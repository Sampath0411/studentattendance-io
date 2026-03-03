import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, BookOpen, ClipboardCheck, TrendingUp, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminOverview = ({ section = "A2" }: { section?: string }) => {
  const [studentCount, setStudentCount] = useState(0);
  const [subjectCount, setSubjectCount] = useState(0);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      // Get student IDs for this section
      const { data: sectionStudents } = await supabase
        .from("profiles")
        .select("id")
        .eq("section", section);
      const studentIds = (sectionStudents || []).map((s: any) => s.id);

      const [students, subjects] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("section", section),
        supabase.from("subjects").select("id", { count: "exact", head: true }).eq("section", section),
      ]);

      let attCount = 0;
      let todayAtt = 0;
      if (studentIds.length > 0) {
        const [attRes, todayRes] = await Promise.all([
          supabase.from("attendance").select("id", { count: "exact", head: true }).in("student_id", studentIds),
          supabase.from("attendance").select("id", { count: "exact", head: true }).in("student_id", studentIds).eq("date", new Date().toISOString().split("T")[0]),
        ]);
        attCount = attRes.count || 0;
        todayAtt = todayRes.count || 0;
      }

      setStudentCount(students.count || 0);
      setSubjectCount(subjects.count || 0);
      setAttendanceCount(attCount);
      setTodayCount(todayAtt);
    };
    fetchStats();
  }, [section]);

  const cards = [
    { label: "Students", value: studentCount, icon: Users, gradient: "from-primary/20 to-primary/5", iconColor: "text-primary" },
    { label: "Subjects", value: subjectCount, icon: BookOpen, gradient: "from-success/20 to-success/5", iconColor: "text-success" },
    { label: "Total Records", value: attendanceCount, icon: ClipboardCheck, gradient: "from-accent/20 to-accent/5", iconColor: "text-accent" },
    { label: "Today's Marks", value: todayCount, icon: Calendar, gradient: "from-destructive/20 to-destructive/5", iconColor: "text-destructive" },
  ];

  return (
    <div>
      <motion.h1
        className="text-2xl font-bold text-foreground mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Dashboard Overview — {section}
      </motion.h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            className={`glass-card rounded-2xl p-5 bg-gradient-to-br ${c.gradient} hover:scale-[1.03] transition-transform duration-200 cursor-default`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-2 rounded-xl bg-background/50 ${c.iconColor}`}>
                <c.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;
