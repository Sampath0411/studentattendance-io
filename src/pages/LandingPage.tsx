import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const FloatingParticle = ({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) => (
  <motion.div
    className="absolute rounded-full bg-primary/20"
    style={{ left: x, top: y, width: size, height: size }}
    animate={{
      y: [0, -30, 0],
      opacity: [0.2, 0.5, 0.2],
      scale: [1, 1.2, 1],
    }}
    transition={{ duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

const FloatingOrb = ({ className, delay }: { className: string; delay: number }) => (
  <motion.div
    className={className}
    animate={{
      scale: [1, 1.15, 1],
      opacity: [0.08, 0.15, 0.08],
      x: [0, 20, -10, 0],
      y: [0, -15, 10, 0],
    }}
    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen gradient-hero overflow-hidden flex items-center justify-center">
      {/* Particles */}
      <FloatingParticle delay={0} x="10%" y="20%" size={8} />
      <FloatingParticle delay={1} x="80%" y="15%" size={6} />
      <FloatingParticle delay={2} x="60%" y="70%" size={10} />
      <FloatingParticle delay={0.5} x="25%" y="80%" size={7} />
      <FloatingParticle delay={1.5} x="90%" y="50%" size={5} />
      <FloatingParticle delay={3} x="40%" y="30%" size={9} />
      <FloatingParticle delay={2.5} x="70%" y="85%" size={6} />
      <FloatingParticle delay={0.8} x="15%" y="55%" size={8} />
      <FloatingParticle delay={1.2} x="50%" y="10%" size={7} />
      <FloatingParticle delay={2.2} x="35%" y="90%" size={5} />

      {/* Animated gradient orbs */}
      <FloatingOrb delay={0} className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <FloatingOrb delay={2} className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      <FloatingOrb delay={4} className="absolute top-1/2 right-1/3 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />

      <div className="relative z-10 text-center px-4 max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="flex justify-center mb-6"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="p-4 rounded-2xl glass-card shadow-[0_0_40px_rgba(99,102,241,0.15)]">
              <GraduationCap className="w-12 h-12 text-primary" />
            </div>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 text-foreground">
            Student Attendance Portal{" "}
            <span className="text-gradient">A2</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-2">
            AU College of Engineering – CSSE Section A2
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mb-8 sm:mb-10">
            Andhra University, Visakhapatnam
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col gap-3 sm:gap-4 justify-center px-4 sm:px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Button
            size="lg"
            className="text-base px-8 py-6 rounded-2xl w-full sm:w-auto sm:mx-auto shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_30px_rgba(99,102,241,0.35)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => navigate("/student-login")}
          >
            <GraduationCap className="mr-2 w-5 h-5" />
            Student Login
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-base px-8 py-6 rounded-2xl w-full sm:w-auto sm:mx-auto border-border/50 backdrop-blur-sm hover:bg-card/60 shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_25px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => navigate("/admin-login")}
          >
            <Shield className="mr-2 w-5 h-5" />
            Admin Login
          </Button>
        </motion.div>

        <motion.p
          className="mt-10 sm:mt-12 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          © 2026 AU College of Engineering. All rights reserved.
        </motion.p>
      </div>
    </div>
  );
};

export default LandingPage;
