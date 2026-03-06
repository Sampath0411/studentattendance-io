import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, ArrowLeft, Eye, EyeOff, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LoginSuccessOverlay from "@/components/LoginSuccessOverlay";
import { useWebAuthn } from "@/hooks/useWebAuthn";

const FloatingOrb = ({ className, delay }: { className: string; delay: number }) => (
  <div
    className={`${className} animate-pulse-slow will-change-[opacity]`}
    style={{ animationDelay: `${delay}s` }}
  />
);

const StudentLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const section = searchParams.get("section") || "A2";

  const storageKey = `student-login-${section}`;
  const saved = localStorage.getItem(storageKey);
  const savedData = saved ? JSON.parse(saved) : null;

  const [regNumber, setRegNumber] = useState(savedData?.regNumber || "");
  const [password, setPassword] = useState(savedData?.password || "");
  const [showPassword, setShowPassword] = useState(false);
  const [saveLogin, setSaveLogin] = useState(!!savedData);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { isSupported, authenticateFingerprint, hasStoredCredential } = useWebAuthn();
  const showBiometric = isSupported && hasStoredCredential();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNumber.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const email = `${regNumber.toLowerCase()}@student.au.edu`;
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error("Invalid credentials. Please check your registration number and password.");
      } else {
        if (saveLogin) {
          localStorage.setItem(storageKey, JSON.stringify({ regNumber, password }));
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

  const handleBiometricLogin = async () => {
    setLoading(true);
    const result = await authenticateFingerprint();
    if (result) {
      // We have the reg number, now try to login with saved credentials
      const saved = localStorage.getItem(`student-login-${section}`);
      if (saved) {
        const { regNumber: savedReg, password: savedPass } = JSON.parse(saved);
        const email = `${savedReg.toLowerCase()}@student.au.edu`;
        const { error } = await supabase.auth.signInWithPassword({ email, password: savedPass });
        if (error) {
          toast.error("Biometric verified but credentials expired. Please login manually.");
        } else {
          setShowSuccess(true);
        }
      } else {
        toast.error("No saved credentials found. Please login manually first and enable 'Save Login'.");
      }
    } else {
      toast.error("Fingerprint authentication cancelled");
    }
    setLoading(false);
  };

  return (
    <>
      <LoginSuccessOverlay show={showSuccess} onComplete={() => navigate("/student/dashboard")} />
      <div className="min-h-[100dvh] gradient-hero flex items-center justify-center px-4 py-6 relative overflow-y-auto">
        <FloatingOrb delay={0} className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <FloatingOrb delay={3} className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-accent/8 rounded-full blur-3xl" />
        <FloatingOrb delay={1.5} className="absolute top-1/2 right-1/3 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />

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
              className="inline-flex p-3 rounded-xl bg-primary/20 mb-4 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <GraduationCap className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground">Student Login</h1>
            <p className="text-muted-foreground text-sm mt-1">CSSE Section {section}</p>
          </div>

          {/* Biometric Login Button */}
          {showBiometric && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                type="button"
                variant="outline"
                className="w-full h-14 rounded-xl border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 active:scale-[0.98] flex items-center gap-3"
                onClick={handleBiometricLogin}
                disabled={loading}
              >
                <Fingerprint className="w-6 h-6 text-primary" />
                <span className="text-base font-medium">Login with Fingerprint</span>
              </Button>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-xs text-muted-foreground">or use credentials</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label htmlFor="regNumber">Registration Number</Label>
              <Input
                id="regNumber"
                placeholder="Enter registration number"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
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

export default StudentLogin;
