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

const FloatingOrb = ({ className, delay }: { className: string; delay: number }) => (
  <div
    className={`${className} animate-pulse-slow will-change-[opacity]`}
    style={{ animationDelay: `${delay}s` }}
  />
);

const AdminLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const section = searchParams.get("section") || "A2";
  const { user, isAdmin, loading: authLoading } = useAuth();
  
  const storageKey = `admin-login-${section}`;
  const saved = localStorage.getItem(storageKey);
  const savedData = saved ? JSON.parse(saved) : null;

  const [username, setUsername] = useState(savedData?.username || "");
  const [password, setPassword] = useState(savedData?.password || "");
  const [showPassword, setShowPassword] = useState(false);
  const [saveLogin, setSaveLogin] = useState(!!savedData);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [user, isAdmin, authLoading, navigate]);

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
      <div className="min-h-[100dvh] gradient-hero flex items-center justify-center px-4 py-6 relative overflow-y-auto">
        <FloatingOrb delay={0} className="absolute top-1/3 right-1/4 w-72 h-72 bg-destructive/8 rounded-full blur-3xl" />
        <FloatingOrb delay={2} className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-primary/8 rounded-full blur-3xl" />
        <FloatingOrb delay={4} className="absolute top-1/2 left-1/4 w-48 h-48 bg-accent/5 rounded-full blur-2xl" />

        <motion.div
          className="w-full max-w-md glass-elevated rounded-2xl p-6 sm:p-8 relative z-10 shadow-[0_8px_40px_rgba(0,0,0,0.15)]"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-all duration-200 hover:translate-x-[-2px]">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="text-center mb-8">
            <motion.div
              className="inline-flex p-3 rounded-xl bg-destructive/20 mb-4 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Shield className="w-8 h-8 text-destructive" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {section === "A2" ? "Authorized personnel only" : `Section ${section} — Authorized personnel only`}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder={section === "A2" ? "Enter admin username" : "admin@123"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5 bg-background/50 border-border/50 rounded-xl h-12 transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
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
                  className="mt-1.5 bg-background/50 border-border/50 rounded-xl h-12 pr-12 transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 mt-[3px] text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="saveLogin"
                checked={saveLogin}
                onCheckedChange={(checked) => setSaveLogin(!!checked)}
              />
              <Label htmlFor="saveLogin" className="text-sm text-muted-foreground cursor-pointer">
                Save Login
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base shadow-[0_4px_15px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_25px_rgba(99,102,241,0.35)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default AdminLogin;
