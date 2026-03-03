import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Trash2, Download, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
      .limit(500);

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
    if (ids.length === 0) { toast.error("No records to delete"); setDeleting(false); return; }
    for (let i = 0; i < ids.length; i += 100) {
      const batch = ids.slice(i, i + 100);
      const { error } = await supabase.from("attendance").delete().in("id", batch);
      if (error) { toast.error("Failed to delete some records"); setDeleting(false); fetchRecords(); return; }
    }
    toast.success(`Deleted ${ids.length} records`);
    setRecords([]);
    setDeleting(false);
  };

  const exportExcel = () => {
    if (records.length === 0) { toast.error("No records to export"); return; }
    const data = records.map((r) => ({
      Date: r.date,
      Student: r.student_name,
      Subject: r.subject_name,
      Status: r.status === "no_class" ? "No Class" : r.status.charAt(0).toUpperCase() + r.status.slice(1),
      Remarks: r.remarks || "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `Attendance_${section}_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("Excel exported!");
  };

  const exportPDF = () => {
    if (records.length === 0) { toast.error("No records to export"); return; }
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Attendance Records — ${section}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [["Date", "Student", "Subject", "Status", "Remarks"]],
      body: records.map((r) => [
        r.date,
        r.student_name,
        r.subject_name,
        r.status === "no_class" ? "No Class" : r.status.charAt(0).toUpperCase() + r.status.slice(1),
        r.remarks || "",
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 73, 134] },
    });

    doc.save(`Attendance_${section}_${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("PDF exported!");
  };

  return (
    <div>
      <motion.h1
        className="text-2xl font-bold text-foreground mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Attendance Records — {section}
      </motion.h1>
      <motion.div
        className="glass-card rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex flex-col sm:flex-row gap-3 mb-4 items-end flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <Label>From</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 bg-background/50 border-border/50 rounded-xl" />
          </div>
          <div className="flex-1 min-w-[140px]">
            <Label>To</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 bg-background/50 border-border/50 rounded-xl" />
          </div>
          <Button onClick={handleFilter} className="rounded-xl">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Button variant="outline" onClick={() => { setStartDate(""); setEndDate(""); fetchRecords(); }} className="rounded-xl border-border/50">
            Clear
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={exportExcel} className="rounded-xl border-border/50">
            <Download className="w-4 h-4 mr-1.5" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={exportPDF} className="rounded-xl border-border/50">
            <FileText className="w-4 h-4 mr-1.5" /> PDF
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteAll} disabled={deleting || records.length === 0} className="rounded-xl ml-auto">
            <Trash2 className="w-4 h-4 mr-1.5" /> {deleting ? "Deleting..." : "Delete All"}
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
                {records.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    className="border-b border-border/10 hover:bg-card/50 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.5) }}
                  >
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
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AttendanceRecords;
