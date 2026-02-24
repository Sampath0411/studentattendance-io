import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FloatingOrb = ({ className, delay }: { className: string; delay: number }) => (
  <motion.div
    className={className}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.06, 0.12, 0.06],
      x: [0, 15, -10, 0],
      y: [0, -10, 8, 0],
    }}
    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

const StudentLogin = () => {
  const navigate = useNavigate();
  const [regNumber, setRegNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
        toast.success("Login successful!");
        navigate("/student/dashboard");
      }
    } catch {
      toast.error("An error occurred");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 relative overflow-y-auto">
      {/* Background animations */}
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
          <p className="text-muted-foreground text-sm mt-1">CSSE Section A2</p>
        </div>

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
  );
};

export default StudentLogin;
