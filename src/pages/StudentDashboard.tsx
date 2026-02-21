import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, BookOpen, UserCheck, UserX, CalendarDays, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import CircularProgress from "@/components/CircularProgress";
import { SkeletonCard, SkeletonTable, SkeletonCircle } from "@/components/Skeletons";
import { toast } from "sonner";

type AttendanceRecord = {
  id: string;
  date: string;
  status: string;
  remarks: string | null;
  subject_name: string;
};

const StudentDashboard = () => {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterActive, setFilterActive] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/student-login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchAttendance();
  }, [user]);

  const fetchAttendance = async (from?: string, to?: string) => {
    setLoading(true);
    let query = supabase
      .from("attendance")
      .select("id, date, status, remarks, subjects(subject_name)")
      .eq("student_id", user!.id)
      .order("date", { ascending: false });

    if (from) query = query.gte("date", from);
    if (to) query = query.lte("date", to);

    const { data, error } = await query;
    if (error) {
      toast.error("Failed to fetch attendance");
    } else {
      setRecords(
        (data || []).map((r: any) => ({
          id: r.id,
          date: r.date,
          status: r.status,
          remarks: r.remarks,
          subject_name: r.subjects?.subject_name || "",
        }))
      );
    }
    setLoading(false);
  };

  const handleFilter = () => {
    if (startDate && endDate) {
      fetchAttendance(startDate, endDate);
      setFilterActive(true);
    } else {
      toast.error("Please select both dates");
    }
  };

  const clearFilter = () => {
    setStartDate("");
    setEndDate("");
    setFilterActive(false);
    fetchAttendance();
  };

  const stats = useMemo(() => {
    const validRecords = records.filter((r) => r.status !== "no_class");
    const present = validRecords.filter((r) => r.status === "present").length;
    const absent = validRecords.filter((r) => r.status === "absent").length;
    const total = validRecords.length;
    const percentage = total > 0 ? (present / total) * 100 : 0;
    return { present, absent, total, percentage };
  }, [records]);

  const getDayName = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading) return <div className="min-h-screen gradient-hero" />;

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="border-b border-border/30 backdrop-blur-md bg-background/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Welcome, <span className="text-gradient">{profile?.name || "Student"}</span>
            </h1>
            <p className="text-sm text-muted-foreground">{profile?.registration_number || ""}</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl border-border/50" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Attendance Circle */}
          <motion.div
            className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center md:row-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {loading ? (
              <SkeletonCircle />
            ) : (
              <CircularProgress percentage={stats.percentage} />
            )}
          </motion.div>

          {/* Stat Cards */}
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <motion.div className="glass-card rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Total Classes</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </motion.div>

              <motion.div className="glass-card rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="flex items-center gap-3 mb-2">
                  <UserCheck className="w-5 h-5 text-success" />
                  <span className="text-sm text-muted-foreground">Present</span>
                </div>
                <p className="text-3xl font-bold text-success">{stats.present}</p>
              </motion.div>

              <motion.div className="glass-card rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="flex items-center gap-3 mb-2">
                  <UserX className="w-5 h-5 text-destructive" />
                  <span className="text-sm text-muted-foreground">Absent</span>
                </div>
                <p className="text-3xl font-bold text-destructive">{stats.absent}</p>
              </motion.div>
            </>
          )}
        </div>

        {/* Date Filter */}
        <motion.div
          className="glass-card rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Filter by Date</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 bg-background/50 border-border/50 rounded-xl" />
            </div>
            <div className="flex-1 w-full">
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 bg-background/50 border-border/50 rounded-xl" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleFilter} className="rounded-xl">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              {filterActive && (
                <Button variant="outline" onClick={clearFilter} className="rounded-xl border-border/50">
                  Clear
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Attendance Table */}
        <motion.div
          className="glass-card rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Attendance History</h2>
          {loading ? (
            <SkeletonTable />
          ) : records.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No attendance records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Day</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Subject</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className="border-b border-border/10 hover:bg-card/50 transition-colors">
                      <td className="py-3 px-4 text-foreground">{record.date}</td>
                      <td className="py-3 px-4 text-foreground">{getDayName(record.date)}</td>
                      <td className="py-3 px-4 text-foreground">{record.subject_name}</td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            record.status === "present"
                              ? "bg-success/20 text-success border-success/30"
                              : record.status === "absent"
                              ? "bg-destructive/20 text-destructive border-destructive/30"
                              : "bg-muted text-muted-foreground border-border/30"
                          }
                        >
                          {record.status === "no_class" ? "No Class" : record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{record.remarks || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default StudentDashboard;
