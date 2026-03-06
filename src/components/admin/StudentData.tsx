import { useState, useEffect } from "react";
import { Search, Download, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";

type StudentData = {
  id: string;
  name: string;
  registration_number: string | null;
  email: string | null;
  mobile_number: string | null;
  batch: string | null;
  section: string | null;
  attendance_percentage: number | null;
};

const StudentDataTab = ({ section = "A2" }: { section?: string }) => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);

    // Get student role user IDs
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "student");
    if (!roles || roles.length === 0) {
      setStudents([]);
      setLoading(false);
      return;
    }

    const studentIds = roles.map((r: any) => r.user_id);
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, name, registration_number, email, mobile_number, batch, section")
      .in("id", studentIds)
      .eq("section", section)
      .order("registration_number", { ascending: true });

    if (error) {
      toast.error("Failed to fetch student data");
      setLoading(false);
      return;
    }

    // Fetch attendance for each student to calculate percentage
    const studentsWithAttendance: StudentData[] = [];
    for (const p of (profiles || [])) {
      const { data: attendance } = await supabase
        .from("attendance")
        .select("status")
        .eq("student_id", p.id);

      let percentage: number | null = null;
      if (attendance && attendance.length >= 3) {
        const valid = attendance.filter((a: any) => a.status !== "no_class");
        const present = valid.filter((a: any) => a.status === "present").length;
        percentage = valid.length > 0 ? Math.round((present / valid.length) * 100) : null;
      }

      studentsWithAttendance.push({
        ...p,
        attendance_percentage: percentage,
      });
    }

    setStudents(studentsWithAttendance);
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, [section]);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.registration_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.mobile_number || "").includes(search)
  );

  const exportExcel = () => {
    if (filtered.length === 0) {
      toast.error("No data to export");
      return;
    }
    const rows = filtered.map((s) => ({
      "Reg. Number": s.registration_number || "—",
      "Full Name": s.name,
      "Email": s.email || "—",
      "Mobile Number": s.mobile_number || "—",
      "Batch": s.batch || "—",
      "Section": s.section || section,
      "Attendance %": s.attendance_percentage !== null ? `${s.attendance_percentage}%` : "N/A",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, `Students_Data_${section}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Excel file downloaded!");
  };

  // Send alert for students below 75%
  const sendLowAttendanceAlerts = async () => {
    const lowStudents = students.filter(
      (s) => s.attendance_percentage !== null && s.attendance_percentage < 75
    );
    if (lowStudents.length === 0) {
      toast.info("No students below 75% attendance");
      return;
    }

    let sent = 0;
    for (const s of lowStudents) {
      const { error } = await supabase.from("notifications").insert({
        student_id: s.id,
        message: `⚠️ Your attendance is ${s.attendance_percentage}%, which is below 75%. Please improve your attendance.`,
        type: "alert",
        status: "warning",
      });
      if (!error) sent++;
    }
    toast.success(`Alert sent to ${sent} students with attendance below 75%`);
  };

  return (
    <div>
      <motion.h1
        className="text-2xl font-bold text-foreground mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Students Data — {section}
      </motion.h1>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, reg no, email, or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background/50 border-border/50 rounded-xl h-11"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-border/50"
              onClick={sendLowAttendanceAlerts}
            >
              <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-500" />
              Alert &lt;75%
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-border/50"
              onClick={exportExcel}
            >
              <Download className="w-4 h-4 mr-1.5" />
              Excel
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-14 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No students found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Reg. No</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Full Name</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Mobile</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Batch</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    className="border-b border-border/10 hover:bg-card/50 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <td className="py-3 px-4 text-foreground font-mono text-xs">{s.registration_number || "—"}</td>
                    <td className="py-3 px-4 text-foreground">{s.name}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{s.email || "—"}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{s.mobile_number || "—"}</td>
                    <td className="py-3 px-4 text-foreground">{s.batch || "—"}</td>
                    <td className="py-3 px-4">
                      {s.attendance_percentage !== null ? (
                        <Badge
                          className={
                            s.attendance_percentage >= 75
                              ? "bg-success/20 text-success border-success/30"
                              : "bg-destructive/20 text-destructive border-destructive/30"
                          }
                        >
                          {s.attendance_percentage}%
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDataTab;
