import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, BookOpen, UserCheck, UserX, CalendarDays, Filter, Info, Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import CircularProgress from "@/components/CircularProgress";
import TodayClassBanner from "@/components/TodayClassBanner";
import { SkeletonCard, SkeletonTable, SkeletonCircle } from "@/components/Skeletons";
import { toast } from "sonner";
import { getUpcomingHolidays } from "@/data/holidays";
import { CalendarHeart } from "lucide-react";

type AttendanceRecord = {
  id: string;
  date: string;
  status: string;
  remarks: string | null;
  subject_name: string;
};

type Notification = {
  id: string;
  message: string;
  status: string | null;
  subject_name: string | null;
  date: string | null;
  read: boolean;
  created_at: string;
};

const MIN_RECORDS_FOR_PERCENTAGE = 3;

const StudentDashboard = () => {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterActive, setFilterActive] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/student-login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAttendance();
      fetchNotifications();
      // Subscribe to realtime notifications
      const channel = supabase
        .channel('student-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `student_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotif = payload.new as any;
            setNotifications((prev) => [
              {
                id: newNotif.id,
                message: newNotif.message,
                status: newNotif.status,
                subject_name: newNotif.subject_name,
                date: newNotif.date,
                read: newNotif.read,
                created_at: newNotif.created_at,
              },
              ...prev,
            ]);
            // Show toast for new notification
            toast(newNotif.message, {
              icon: newNotif.status === "present" ? "✅" : "❌",
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("student_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setNotifications(data as Notification[]);
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unread.length > 0) {
      await supabase.from("notifications").update({ read: true }).in("id", unread);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

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
    const hasEnoughRecords = total >= MIN_RECORDS_FOR_PERCENTAGE;
    return { present, absent, total, percentage, hasEnoughRecords };
  }, [records]);

  const getDayName = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (authLoading) return <div className="min-h-screen gradient-hero" />;

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="border-b border-border/30 backdrop-blur-md bg-background/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-xl font-bold text-foreground">
              Welcome, <span className="text-gradient">{profile?.name || "Student"}</span>
            </h1>
            <p className="text-sm text-muted-foreground">{profile?.registration_number || ""}</p>
          </motion.div>
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Notification Bell */}
            <button
              onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) markAllRead(); }}
              className="relative p-2 rounded-xl hover:bg-card/60 transition-colors"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Notification Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            className="fixed top-16 right-4 z-50 w-80 max-h-96 overflow-y-auto glass-elevated rounded-2xl p-4 shadow-[var(--shadow-elevated)]"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
              <button onClick={() => setShowNotifications(false)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No notifications yet</p>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl text-sm transition-colors ${
                      n.read ? "bg-background/30" : "bg-primary/10 border border-primary/20"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5">
                        {n.status === "present" ? "✅" : n.status === "absent" ? "❌" : "📢"}
                      </span>
                      <div>
                        <p className="text-foreground">{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(n.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Upcoming Holidays */}
        {(() => {
          const upcomingHolidays = getUpcomingHolidays(3);
          if (upcomingHolidays.length === 0) return null;
          return (
            <motion.div
              className="glass-card rounded-2xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <CalendarHeart className="w-5 h-5 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Upcoming Holidays</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {upcomingHolidays.map((h, i) => (
                  <motion.span
                    key={h.name}
                    className="px-3 py-1.5 rounded-xl bg-card/50 border border-border/30 text-xs text-muted-foreground backdrop-blur-sm"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    whileHover={{ scale: 1.05, borderColor: "hsl(var(--primary) / 0.5)" }}
                  >
                    {h.emoji} {h.name}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          );
        })()}

        {/* Today's Classes Banner */}
        <TodayClassBanner />

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
            ) : !stats.hasEnoughRecords ? (
              <motion.div
                className="flex flex-col items-center text-center gap-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="p-3 rounded-full bg-muted/50">
                  <Info className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Attendance percentage will appear after{" "}
                  <span className="font-semibold text-foreground">{MIN_RECORDS_FOR_PERCENTAGE}</span>{" "}
                  class records
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats.total} of {MIN_RECORDS_FOR_PERCENTAGE} recorded
                </p>
              </motion.div>
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
              <motion.div
                className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Total Classes</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </motion.div>

              <motion.div
                className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <UserCheck className="w-5 h-5 text-success" />
                  <span className="text-sm text-muted-foreground">Present</span>
                </div>
                <p className="text-3xl font-bold text-success">{stats.present}</p>
              </motion.div>

              <motion.div
                className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
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
          transition={{ delay: 0.4, duration: 0.4 }}
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
              <Button
                onClick={handleFilter}
                className="rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <AnimatePresence>
                {filterActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant="outline"
                      onClick={clearFilter}
                      className="rounded-xl border-border/50 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      Clear
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Attendance Table */}
        <motion.div
          className="glass-card rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Attendance History</h2>
          {loading ? (
            <SkeletonTable />
          ) : records.length === 0 ? (
            <motion.p
              className="text-center text-muted-foreground py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              No attendance records found.
            </motion.p>
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
                  {records.map((record, index) => (
                    <motion.tr
                      key={record.id}
                      className="border-b border-border/10 hover:bg-card/50 transition-colors duration-150"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.3 }}
                    >
                      <td className="py-3 px-4 text-foreground">{record.date}</td>
                      <td className="py-3 px-4 text-foreground">{getDayName(record.date)}</td>
                      <td className="py-3 px-4 text-foreground">{record.subject_name}</td>
                      <td className="py-3 px-4">
                        <Badge
                          className={`transition-all duration-200 ${
                            record.status === "present"
                              ? "bg-success/20 text-success border-success/30"
                              : record.status === "absent"
                              ? "bg-destructive/20 text-destructive border-destructive/30"
                              : "bg-muted text-muted-foreground border-border/30"
                          }`}
                        >
                          {record.status === "no_class" ? "No Class" : record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{record.remarks || "—"}</td>
                    </motion.tr>
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
