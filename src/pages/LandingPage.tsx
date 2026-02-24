import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import auLogo from "@/assets/au-logo.png";

const ShootingStar = ({ delay, top }: { delay: number; top: string }) => (
  <div
    className="absolute h-[2px] rounded-full animate-shooting-star will-change-transform"
    style={{
      top,
      left: "-10%",
      width: "80px",
      background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.6), transparent)",
      animationDelay: `${delay}s`,
      animationDuration: `${5 + delay}s`,
    }}
  />
);

const SmallStar = ({ x, y, delay }: { x: string; y: string; delay: number }) => (
  <div
    className="absolute w-1 h-1 rounded-full bg-primary/30 animate-twinkle will-change-[opacity]"
    style={{ left: x, top: y, animationDelay: `${delay}s` }}
  />
);

const LandingPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="relative min-h-screen gradient-hero overflow-hidden flex items-center justify-center">
      {/* Shooting stars */}
      <ShootingStar delay={0} top="8%" />
      <ShootingStar delay={1.5} top="22%" />
      <ShootingStar delay={3} top="45%" />
      <ShootingStar delay={0.8} top="65%" />
      <ShootingStar delay={2.2} top="80%" />
      <ShootingStar delay={4} top="35%" />
      <ShootingStar delay={1} top="55%" />
      <ShootingStar delay={3.5} top="12%" />
      <ShootingStar delay={2.8} top="90%" />
      <ShootingStar delay={0.3} top="72%" />

      {/* Static twinkling stars */}
      <SmallStar x="5%" y="10%" delay={0} />
      <SmallStar x="15%" y="30%" delay={0.5} />
      <SmallStar x="25%" y="60%" delay={1} />
      <SmallStar x="40%" y="15%" delay={1.5} />
      <SmallStar x="55%" y="75%" delay={0.3} />
      <SmallStar x="70%" y="20%" delay={2} />
      <SmallStar x="80%" y="50%" delay={0.8} />
      <SmallStar x="90%" y="35%" delay={1.2} />
      <SmallStar x="35%" y="85%" delay={2.5} />
      <SmallStar x="60%" y="40%" delay={0.6} />
      <SmallStar x="85%" y="70%" delay={1.8} />
      <SmallStar x="10%" y="55%" delay={2.2} />
      <SmallStar x="50%" y="5%" delay={0.9} />
      <SmallStar x="75%" y="90%" delay={1.4} />
      <SmallStar x="95%" y="15%" delay={3} />

      {/* Gradient orbs - pure CSS */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow will-change-[opacity]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-slow will-change-[opacity]" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-primary/5 rounded-full blur-2xl animate-pulse-slow will-change-[opacity]" style={{ animationDelay: "4s" }} />

      <div className="relative z-10 text-center px-4 max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo for mobile, glass icon for desktop */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {isMobile ? (
              <img src={auLogo} alt="Andhra University Students Attendance" className="w-28 h-28 rounded-2xl" />
            ) : (
              <div className="p-4 rounded-2xl glass-card shadow-[0_0_40px_rgba(99,102,241,0.15)]">
                <img src={auLogo} alt="Andhra University Students Attendance" className="w-16 h-16 rounded-xl" />
              </div>
            )}
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
