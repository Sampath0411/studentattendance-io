import { useEffect, useState } from "react";
import { Users, BookOpen, ClipboardCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminOverview = ({ section = "A2" }: { section?: string }) => {
  const [studentCount, setStudentCount] = useState(0);
  const [subjectCount, setSubjectCount] = useState(0);
  const [attendanceCount, setAttendanceCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const [students, subjects, attendance] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("section", section),
        supabase.from("subjects").select("id", { count: "exact", head: true }),
        supabase.from("attendance").select("id", { count: "exact", head: true }),
      ]);
      setStudentCount(students.count || 0);
      setSubjectCount(subjects.count || 0);
      setAttendanceCount(attendance.count || 0);
    };
    fetchStats();
  }, [section]);

  const cards = [
    { label: "Students", value: studentCount, icon: Users, color: "text-primary" },
    { label: "Subjects", value: subjectCount, icon: BookOpen, color: "text-success" },
    { label: "Records", value: attendanceCount, icon: ClipboardCheck, color: "text-accent" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard Overview — {section}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map((c) => (
          <div key={c.label} className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <c.icon className={`w-6 h-6 ${c.color}`} />
              <span className="text-sm text-muted-foreground">{c.label}</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;
