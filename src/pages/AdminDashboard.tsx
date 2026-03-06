import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, UserPlus, Users, ClipboardCheck, FileText, LogOut, ChevronLeft, CalendarDays, Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import AdminOverview from "@/components/admin/AdminOverview";
import AddStudent from "@/components/admin/AddStudent";
import StudentList from "@/components/admin/StudentList";
import MarkAttendance from "@/components/admin/MarkAttendance";
import AttendanceRecords from "@/components/admin/AttendanceRecords";
import Timetable from "@/components/admin/Timetable";
import StudentDataTab from "@/components/admin/StudentData";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "add-student", label: "Add", icon: UserPlus },
  { key: "students", label: "Students", icon: Users },
  { key: "student-data", label: "Data", icon: Database },
  { key: "mark-attendance", label: "Attendance", icon: ClipboardCheck },
  { key: "records", label: "Records", icon: FileText },
  { key: "timetable", label: "Timetable", icon: CalendarDays },
];

const AdminDashboard = () => {
  const { user, isAdmin, profile, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const section = profile?.section || "A2";

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate("/admin-login");
  }, [user, isAdmin, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading) return <div className="min-h-screen gradient-hero flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>;

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <AdminOverview section={section} />;
      case "add-student": return <AddStudent section={section} />;
      case "students": return <StudentList section={section} />;
      case "student-data": return <StudentDataTab section={section} />;
      case "mark-attendance": return <MarkAttendance section={section} />;
      case "records": return <AttendanceRecords section={section} />;
      case "timetable": return <Timetable section={section} />;
      default: return <AdminOverview section={section} />;
    }
  };

  const headerTitle = `Admin Panel — ${section}`;

  if (isMobile) {
    return (
      <div className="min-h-[100dvh] gradient-hero flex flex-col">
        <header className="border-b border-border/30 backdrop-blur-md bg-background/30 p-4 flex items-center justify-between sticky top-0 z-50">
          <h1 className="font-bold text-foreground text-lg truncate">{headerTitle}</h1>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200 active:scale-95"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        </header>

        <main className="flex-1 p-4 pb-24 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
          <motion.nav
            className="flex items-center justify-around gap-0.5 px-2 py-2 mx-3 mb-3 rounded-2xl glass-elevated shadow-[0_-4px_30px_rgba(0,0,0,0.3)] border border-border/30"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 20, delay: 0.2 }}
          >
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[48px] active:scale-90 ${
                  activeTab === item.key
                    ? "bg-primary text-primary-foreground scale-105 shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              </button>
            ))}
          </motion.nav>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex">
      <motion.aside
        className="flex flex-col border-r border-border/30 bg-background/50 backdrop-blur-xl"
        animate={{ width: sidebarOpen ? 250 : 72 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/30">
          {sidebarOpen && (
            <motion.h2
              className="font-bold text-foreground text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Admin
            </motion.h2>
          )}
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-xl hover:bg-card/60">
            <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${!sidebarOpen ? "rotate-180" : ""}`} />
          </Button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                activeTab === item.key
                  ? "bg-primary text-primary-foreground shadow-[0_2px_12px_hsl(var(--primary)/0.3)]"
                  : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border/30">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-all duration-200 active:scale-95"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="border-b border-border/30 backdrop-blur-md bg-background/30 p-4 flex items-center justify-between sticky top-0 z-40">
          <h1 className="font-bold text-foreground">{headerTitle}</h1>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
