import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AttRecord = {
  id: string;
  date: string;
  status: string;
  remarks: string | null;
  student_name: string;
  subject_name: string;
};

const AttendanceRecords = ({ section = "A2" }: { section?: string }) => {
  const [records, setRecords] = useState<AttRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchRecords = async (from?: string, to?: string) => {
    setLoading(true);

    // First get student IDs for this section
    const { data: sectionStudents } = await supabase
      .from("profiles")
      .select("id")
      .eq("section", section);

    const studentIds = (sectionStudents || []).map((s: any) => s.id);

    if (studentIds.length === 0) {
      setRecords([]);
      setLoading(false);
      return;
    }

    let query = supabase
      .from("attendance")
      .select("id, date, status, remarks, profiles(name), subjects(subject_name)")
      .in("student_id", studentIds)
      .order("date", { ascending: false })
      .limit(200);

    if (from) query = query.gte("date", from);
    if (to) query = query.lte("date", to);

    const { data, error } = await query;
    if (error) toast.error("Failed to fetch records");
    else {
      setRecords(
        (data || []).map((r: any) => ({
          id: r.id,
          date: r.date,
          status: r.status,
          remarks: r.remarks,
          student_name: r.profiles?.name || "",
          subject_name: r.subjects?.subject_name || "",
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => { fetchRecords(); }, [section]);

  const handleFilter = () => {
    if (startDate && endDate) fetchRecords(startDate, endDate);
    else toast.error("Select both dates");
  };

  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to delete ALL attendance records? This action cannot be undone.")) return;
    setDeleting(true);
    const ids = records.map((r) => r.id);
    if (ids.length === 0) {
      toast.error("No records to delete");
      setDeleting(false);
      return;
    }
    for (let i = 0; i < ids.length; i += 100) {
      const batch = ids.slice(i, i + 100);
      const { error } = await supabase.from("attendance").delete().in("id", batch);
      if (error) {
        toast.error("Failed to delete some records");
        setDeleting(false);
        fetchRecords();
        return;
      }
    }
    toast.success(`Deleted ${ids.length} records`);
    setRecords([]);
    setDeleting(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Attendance Records — {section}</h1>
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-end">
          <div className="flex-1 w-full">
            <Label>From</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 bg-background/50 border-border/50 rounded-xl" />
          </div>
          <div className="flex-1 w-full">
            <Label>To</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 bg-background/50 border-border/50 rounded-xl" />
          </div>
          <Button onClick={handleFilter} className="rounded-xl">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" onClick={() => { setStartDate(""); setEndDate(""); fetchRecords(); }} className="rounded-xl border-border/50">
            Clear
          </Button>
          <Button variant="destructive" onClick={handleDeleteAll} disabled={deleting || records.length === 0} className="rounded-xl">
            <Trash2 className="w-4 h-4 mr-2" />
            {deleting ? "Deleting..." : "Delete All"}
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-12 rounded-xl" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Student</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Subject</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-border/10 hover:bg-card/50 transition-colors">
                    <td className="py-3 px-4 text-foreground">{r.date}</td>
                    <td className="py-3 px-4 text-foreground">{r.student_name}</td>
                    <td className="py-3 px-4 text-foreground">{r.subject_name}</td>
                    <td className="py-3 px-4">
                      <Badge className={
                        r.status === "present" ? "bg-success/20 text-success border-success/30"
                          : r.status === "absent" ? "bg-destructive/20 text-destructive border-destructive/30"
                          : "bg-muted text-muted-foreground border-border/30"
                      }>
                        {r.status === "no_class" ? "No Class" : r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{r.remarks || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceRecords;
