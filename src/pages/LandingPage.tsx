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

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative z-10 text-center px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl glass-card">
              <GraduationCap className="w-12 h-12 text-primary" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground">
            Student Attendance Portal{" "}
            <span className="text-gradient">A2</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-2">
            AU College of Engineering – CSSE Section A2
          </p>
          <p className="text-sm text-muted-foreground mb-10">
            Andhra University, Visakhapatnam
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Button
            size="lg"
            className="text-base px-8 py-6 rounded-2xl"
            onClick={() => navigate("/student-login")}
          >
            <GraduationCap className="mr-2 w-5 h-5" />
            Student Login
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-base px-8 py-6 rounded-2xl border-border/50 bg-card/30 hover:bg-card/60"
            onClick={() => navigate("/admin-login")}
          >
            <Shield className="mr-2 w-5 h-5" />
            Admin Login
          </Button>
        </motion.div>

        <motion.p
          className="mt-12 text-xs text-muted-foreground"
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
