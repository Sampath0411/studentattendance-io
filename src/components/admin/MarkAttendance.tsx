import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Student = { id: string; name: string; registration_number: string | null };
type Subject = { id: string; subject_name: string };
type MarkStatus = "present" | "absent" | "no_class";

const MarkAttendance = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [marks, setMarks] = useState<Record<string, MarkStatus>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const [rolesRes, subjectsRes] = await Promise.all([
        supabase.from("user_roles").select("user_id").eq("role", "student"),
        supabase.from("subjects").select("id, subject_name"),
      ]);
      if (rolesRes.data && rolesRes.data.length > 0) {
        const ids = rolesRes.data.map((r: any) => r.user_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, name, registration_number")
          .in("id", ids)
          .order("name");
        setStudents((profilesData as Student[]) || []);
        // Initialize all as present
        const initial: Record<string, MarkStatus> = {};
        (profilesData || []).forEach((s: any) => { initial[s.id] = "present"; });
        setMarks(initial);
      }
      setSubjects((subjectsRes.data as Subject[]) || []);
    };
    fetch();
  }, []);

  const toggleStatus = (studentId: string) => {
    setMarks((prev) => {
      const current = prev[studentId];
      const next = current === "present" ? "absent" : current === "absent" ? "no_class" : "present";
      return { ...prev, [studentId]: next };
    });
  };

  const markAll = (status: MarkStatus) => {
    const updated: Record<string, MarkStatus> = {};
    students.forEach((s) => { updated[s.id] = status; });
    setMarks(updated);
  };

  const handleSubmit = async () => {
    if (!selectedSubject) {
      toast.error("Please select a subject");
      return;
    }
    setLoading(true);
    const records = students.map((s) => ({
      student_id: s.id,
      subject_id: selectedSubject,
      date: selectedDate,
      status: marks[s.id] || "present",
      remarks: marks[s.id] === "no_class" ? "Self Study / Library" : null,
    }));

    const { error } = await supabase.from("attendance").upsert(records, {
      onConflict: "student_id,subject_id,date",
    });

    if (error) toast.error("Failed to save attendance: " + error.message);
    else toast.success("Attendance saved successfully!");
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Mark Attendance</h1>
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Label>Date</Label>
            <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="mt-1 bg-background/50 border-border/50 rounded-xl" />
          </div>
          <div className="flex-1">
            <Label>Subject</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="mt-1 bg-background/50 border-border/50 rounded-xl">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.subject_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk actions */}
        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" className="rounded-xl border-border/50" onClick={() => markAll("present")}>
            All Present
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl border-border/50" onClick={() => markAll("absent")}>
            All Absent
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl border-border/50" onClick={() => markAll("no_class")}>
            No Class
          </Button>
        </div>

        {students.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No students found. Add students first.</p>
        ) : (
          <div className="space-y-2">
            {students.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-background/30 hover:bg-background/50 transition-colors">
                <div>
                  <p className="text-foreground font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{s.registration_number}</p>
                </div>
                <button onClick={() => toggleStatus(s.id)}>
                  <Badge
                    className={`cursor-pointer select-none text-sm px-4 py-1.5 ${
                      marks[s.id] === "present"
                        ? "bg-success/20 text-success border-success/30 hover:bg-success/30"
                        : marks[s.id] === "absent"
                        ? "bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30"
                        : "bg-muted text-muted-foreground border-border/30 hover:bg-muted/80"
                    }`}
                  >
                    {marks[s.id] === "no_class" ? "No Class" : marks[s.id] === "present" ? "Present" : "Absent"}
                  </Badge>
                </button>
              </div>
            ))}
          </div>
        )}

        <Button onClick={handleSubmit} className="w-full mt-6 h-12 rounded-xl" disabled={loading || students.length === 0}>
          {loading ? "Saving..." : "Save Attendance"}
        </Button>
      </div>
    </div>
  );
};

export default MarkAttendance;
