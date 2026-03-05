import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import LoginSuccessOverlay from "@/components/LoginSuccessOverlay";
import { getAdminEmail } from "@/data/sectionTimetables";
import SectionSelect, { getSectionLabel } from "@/components/SectionSelect";

const FloatingOrb = ({ className, delay }: { className: string; delay: number }) => (
  <div
    className={`${className} animate-pulse-slow will-change-[opacity]`}
    style={{ animationDelay: `${delay}s` }}
  />
);

const bgGradients = [
  "linear-gradient(135deg, hsl(216 50% 6%) 0%, hsl(217 42% 12%) 50%, hsl(224 64% 18%) 100%)",
  "linear-gradient(135deg, hsl(220 50% 8%) 0%, hsl(224 50% 16%) 50%, hsl(230 60% 24%) 100%)",
  "linear-gradient(135deg, hsl(216 50% 10%) 0%, hsl(220 45% 14%) 50%, hsl(226 55% 20%) 100%)",
];

const AdminLogin = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const section = searchParams.get("section") || "A2";
  const { user, isAdmin, loading: authLoading } = useAuth();

  const storageKey = `admin-login-${section}`;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saveLogin, setSaveLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bgPhase, setBgPhase] = useState(0);

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setBgPhase((p) => (p + 1) % bgGradients.length);
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) {
        setUsername("");
        setPassword("");
        setSaveLogin(false);
        return;
      }

      const savedData = JSON.parse(saved);
      setUsername(savedData?.username || "");
      setPassword(savedData?.password || "");
      setSaveLogin(true);
    } catch {
      setUsername("");
      setPassword("");
      setSaveLogin(false);
    }
  }, [storageKey]);

  const handleSectionChange = (nextSection: string) => {
    if (nextSection === section) return;
    setSearchParams({ section: nextSection });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const email = getAdminEmail(section, username);
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast.error("Invalid admin credentials");
      } else {
        if (saveLogin) {
          localStorage.setItem(storageKey, JSON.stringify({ username, password }));
        } else {
          localStorage.removeItem(storageKey);
        }
        setShowSuccess(true);
      }
    } catch {
      toast.error("An error occurred");
    }
    setLoading(false);
  };

  return (
    <>
      <LoginSuccessOverlay show={showSuccess} onComplete={() => navigate("/admin/dashboard")} />
      <div className="relative min-h-[100dvh] overflow-x-hidden">
        <motion.div
          className="absolute inset-0 z-0"
          animate={{ background: bgGradients[bgPhase] }}
          transition={{ duration: 4, ease: "easeInOut" }}
        />

        <FloatingOrb delay={0} className="absolute right-1/4 top-1/3 z-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <FloatingOrb delay={2} className="absolute bottom-1/4 left-1/3 z-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <FloatingOrb delay={4} className="absolute left-1/4 top-1/2 z-0 h-48 w-48 rounded-full bg-primary/10 blur-2xl" />

        <div className="relative z-10 grid min-h-[100dvh] grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
          <section className="hidden flex-col justify-center px-12 lg:flex xl:px-20">
            <motion.h1
              className="text-4xl font-bold text-foreground xl:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Admin Control Center
            </motion.h1>
            <motion.p
              className="mt-4 max-w-lg text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Securely manage attendance, students, and reports with section-wise access.
            </motion.p>
          </section>

          <motion.section
            className="flex min-h-[100dvh] items-center justify-center overflow-y-auto p-4 sm:p-6 lg:p-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-full max-w-xl rounded-3xl border border-border/60 bg-card/70 p-6 shadow-xl backdrop-blur-xl sm:p-8 lg:p-10">
              <button
                onClick={() => navigate("/")}
                className="mb-6 flex items-center gap-2 text-muted-foreground transition-all duration-200 hover:-translate-x-0.5 hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <div className="mb-6 text-center">
                <motion.div
                  className="mb-4 inline-flex rounded-xl bg-primary/20 p-3"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Shield className="h-8 w-8 text-primary" />
                </motion.div>
                <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
                <p className="mt-1 text-sm text-muted-foreground">{getSectionLabel(section)} — Authorized personnel only</p>
              </div>

              <div className="mb-6">
                <SectionSelect
                  value={section}
                  onChange={handleSectionChange}
                  className="w-full"
                  triggerClassName="w-full bg-background/70"
                  contentClassName="max-h-64"
                />
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter admin username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1.5 h-12 rounded-xl border-border/60 bg-background/70"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1.5 h-12 rounded-xl border-border/60 bg-background/70 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 mt-[3px] -translate-y-1/2 text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="saveLogin"
                    checked={saveLogin}
                    onCheckedChange={(checked) => setSaveLogin(!!checked)}
                  />
                  <Label htmlFor="saveLogin" className="cursor-pointer text-sm text-muted-foreground">
                    Save Login
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl border border-primary/40 bg-gradient-to-r from-primary to-accent text-base text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:brightness-110"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
