import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, UserPlus, Users, ClipboardCheck, FileText, LogOut, Menu, X, ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import AdminOverview from "@/components/admin/AdminOverview";
import AddStudent from "@/components/admin/AddStudent";
import StudentList from "@/components/admin/StudentList";
import MarkAttendance from "@/components/admin/MarkAttendance";
import AttendanceRecords from "@/components/admin/AttendanceRecords";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "add-student", label: "Add Student", icon: UserPlus },
  { key: "students", label: "Students List", icon: Users },
  { key: "mark-attendance", label: "Mark Attendance", icon: ClipboardCheck },
  { key: "records", label: "Attendance Records", icon: FileText },
];

const AdminDashboard = () => {
  const { user, isAdmin, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate("/admin-login");
  }, [user, isAdmin, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading) return <div className="min-h-screen gradient-hero" />;

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <AdminOverview />;
      case "add-student": return <AddStudent />;
      case "students": return <StudentList />;
      case "mark-attendance": return <MarkAttendance />;
      case "records": return <AttendanceRecords />;
      default: return <AdminOverview />;
    }
  };

  const SidebarContent = () => (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map((item) => (
        <button
          key={item.key}
          onClick={() => { setActiveTab(item.key); setMobileOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            activeTab === item.key
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
          }`}
        >
          <item.icon className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span>{item.label}</span>}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen gradient-hero flex">
      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden md:flex flex-col border-r border-border/30 bg-background/50 backdrop-blur-xl"
        animate={{ width: sidebarOpen ? 250 : 72 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/30">
          {sidebarOpen && <h2 className="font-bold text-foreground text-lg">Admin</h2>}
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-xl">
            <ChevronLeft className={`w-5 h-5 transition-transform ${!sidebarOpen ? "rotate-180" : ""}`} />
          </Button>
        </div>
        <SidebarContent />
        <div className="p-3 border-t border-border/30">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-background border-r border-border/30 z-50 flex flex-col"
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="flex items-center justify-between p-4 border-b border-border/30">
                <h2 className="font-bold text-foreground text-lg">Admin</h2>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <SidebarContent />
              <div className="p-3 border-t border-border/30">
                <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-destructive hover:bg-destructive/10">
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden border-b border-border/30 backdrop-blur-md bg-background/30 p-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} className="rounded-xl">
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-foreground">Admin Panel</h1>
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
