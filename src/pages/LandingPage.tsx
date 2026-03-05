import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Shield, ChevronDown, PartyPopper, CalendarHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import auLogo from "@/assets/au-logo.png";
import { sections } from "@/data/sectionTimetables";
import { getTodayHoliday, getUpcomingHolidays } from "@/data/holidays";
import ChatBotBubble from "@/components/ChatBotBubble";

/* ─── Animated Background Particles ─── */
const FloatingParticle = ({ delay, size, x, y, duration }: { delay: number; size: number; x: string; y: string; duration: number }) => (
  <motion.div
    className="absolute rounded-full bg-primary/20 blur-sm"
    style={{ width: size, height: size, left: x, top: y }}
    animate={{
      y: [0, -30, 10, -20, 0],
      x: [0, 15, -10, 5, 0],
      opacity: [0.1, 0.4, 0.2, 0.5, 0.1],
      scale: [1, 1.3, 0.9, 1.2, 1],
    }}
    transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

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

const sectionFullNames: Record<string, string> = {
  A2: "CSSE Section A2",
  A3: "CSSE Section A3",
  A4: "CSSE Section A4",
  A5: "CSSE Section A5",
  A6: "CSSE Section A6",
  A7: "CSSE Section A7",
  A8: "CSSE Section A8",
  A9: "CSSE Section A9",
  "Women's College": "Women's College",
};

const LandingPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState("A2");
  const [sectionOpen, setSectionOpen] = useState(false);
  const [bgPhase, setBgPhase] = useState(0);

  const todayHoliday = getTodayHoliday();
  const upcomingHolidays = getUpcomingHolidays(3);

  // Animated background phase cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setBgPhase((p) => (p + 1) % 3);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const bgGradients = [
    "linear-gradient(135deg, hsl(216 50% 6%) 0%, hsl(217 42% 12%) 50%, hsl(224 64% 18%) 100%)",
    "linear-gradient(135deg, hsl(220 50% 8%) 0%, hsl(224 50% 16%) 50%, hsl(230 60% 24%) 100%)",
    "linear-gradient(135deg, hsl(216 50% 10%) 0%, hsl(220 45% 14%) 50%, hsl(226 55% 20%) 100%)",
  ];

  const goToStudentLogin = () => navigate(`/student-login?section=${encodeURIComponent(activeSection)}`);
  const goToAdminLogin = () => navigate(`/admin-login?section=${encodeURIComponent(activeSection)}`);

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 z-0"
        animate={{ background: bgGradients[bgPhase] }}
        transition={{ duration: 4, ease: "easeInOut" }}
      />

      {/* Floating particles */}
      <FloatingParticle delay={0} size={6} x="10%" y="20%" duration={7} />
      <FloatingParticle delay={1} size={4} x="25%" y="60%" duration={9} />
      <FloatingParticle delay={2} size={8} x="70%" y="15%" duration={6} />
      <FloatingParticle delay={0.5} size={5} x="80%" y="70%" duration={8} />
      <FloatingParticle delay={3} size={3} x="50%" y="40%" duration={10} />
      <FloatingParticle delay={1.5} size={7} x="90%" y="30%" duration={7} />
      <FloatingParticle delay={2.5} size={4} x="35%" y="80%" duration={9} />
      <FloatingParticle delay={0.8} size={6} x="15%" y="50%" duration={11} />

      {/* Shooting stars */}
      <ShootingStar delay={0} top="8%" />
      <ShootingStar delay={1.5} top="22%" />
      <ShootingStar delay={3} top="45%" />
      <ShootingStar delay={0.8} top="65%" />
      <ShootingStar delay={2.2} top="80%" />
      <ShootingStar delay={4} top="35%" />

      {/* Twinkling stars */}
      <SmallStar x="5%" y="10%" delay={0} />
      <SmallStar x="15%" y="30%" delay={0.5} />
      <SmallStar x="40%" y="15%" delay={1.5} />
      <SmallStar x="55%" y="75%" delay={0.3} />
      <SmallStar x="70%" y="20%" delay={2} />
      <SmallStar x="80%" y="50%" delay={0.8} />
      <SmallStar x="90%" y="35%" delay={1.2} />
      <SmallStar x="60%" y="40%" delay={0.6} />
      <SmallStar x="85%" y="70%" delay={1.8} />

      {/* Gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl will-change-[opacity]"
        animate={{ opacity: [0.06, 0.14, 0.06], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl will-change-[opacity]"
        animate={{ opacity: [0.04, 0.12, 0.04], scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Holiday Banner */}
      <AnimatePresence>
        {todayHoliday && (
          <motion.div
            className="relative z-20 w-full border-b border-primary/20 bg-primary/10 backdrop-blur-md"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-center gap-3">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <PartyPopper className="w-5 h-5 text-primary" />
              </motion.div>
              <p className="text-sm font-medium text-foreground">
                {todayHoliday.emoji} Today is <span className="text-primary font-bold">{todayHoliday.name}</span>!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="text-center px-4 max-w-2xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Logo */}
              <motion.div
                className="flex justify-center mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, type: "spring" }}
              >
                {isMobile ? (
                  <motion.img
                    src={auLogo}
                    alt="AU Logo"
                    className="w-28 h-28 rounded-2xl"
                    whileHover={{ scale: 1.05, rotate: 2 }}
                  />
                ) : (
                  <motion.div
                    className="p-4 rounded-2xl glass-card shadow-[0_0_40px_rgba(99,102,241,0.15)]"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(99,102,241,0.25)" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <img src={auLogo} alt="AU Logo" className="w-16 h-16 rounded-xl" />
                  </motion.div>
                )}
              </motion.div>

              <motion.h1
                className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 text-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Student Attendance Portal{" "}
                <span className="text-gradient">{activeSection}</span>
              </motion.h1>

              <motion.p
                className="text-base sm:text-lg md:text-xl text-muted-foreground mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                AU College of Engineering – {sectionFullNames[activeSection]}
              </motion.p>
              <motion.p
                className="text-xs sm:text-sm text-muted-foreground mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                Andhra University, Visakhapatnam
              </motion.p>
            </motion.div>
          </AnimatePresence>

          {/* Section Selector Dropdown */}
          <motion.div
            className="relative inline-block mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              onClick={() => setSectionOpen(!sectionOpen)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl glass-card border border-border/50 text-sm font-medium text-foreground hover:border-primary/50 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <GraduationCap className="w-4 h-4 text-primary" />
              <span>Section: <span className="text-primary font-bold">{activeSection}</span></span>
              <motion.div animate={{ rotate: sectionOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {sectionOpen && (
                <motion.div
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 rounded-2xl glass-elevated border border-border/50 overflow-hidden z-[60]"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="p-2 max-h-72 overflow-y-auto scrollbar-hide">
                    {sections.map((section, i) => (
                      <motion.button
                        key={section}
                        onClick={() => {
                          setActiveSection(section);
                          setSectionOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          activeSection === section
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-card/60"
                        }`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        whileHover={{ x: 4 }}
                      >
                        {section}
                        <span className="text-xs ml-2 opacity-60">{sectionFullNames[section]}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col gap-3 sm:gap-4 justify-center px-4 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="text-base px-8 py-6 rounded-2xl w-full sm:w-auto sm:mx-auto shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_30px_rgba(99,102,241,0.35)] transition-all duration-300"
                onClick={goToStudentLogin}
              >
                <GraduationCap className="mr-2 w-5 h-5" />
                Student Login
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 py-6 rounded-2xl w-full sm:w-auto sm:mx-auto border-border/50 backdrop-blur-sm hover:bg-card/60 shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_25px_rgba(0,0,0,0.15)] transition-all duration-300"
                onClick={goToAdminLogin}
              >
                <Shield className="mr-2 w-5 h-5" />
                Admin Login
              </Button>
            </motion.div>
          </motion.div>

          {/* Upcoming Holidays */}
          {upcomingHolidays.length > 0 && (
            <motion.div
              className="mt-8 sm:mt-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <CalendarHeart className="w-4 h-4 text-primary" />
                <p className="text-xs text-muted-foreground font-medium">Upcoming Holidays</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {upcomingHolidays.map((h, i) => (
                  <motion.span
                    key={h.name}
                    className="px-3 py-1.5 rounded-xl bg-card/50 border border-border/30 text-xs text-muted-foreground backdrop-blur-sm"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + i * 0.1 }}
                    whileHover={{ scale: 1.05, borderColor: "hsl(var(--primary) / 0.5)" }}
                  >
                    {h.emoji} {h.name}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Footer */}
          <motion.footer
            className="mt-10 sm:mt-12 space-y-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p className="text-xs text-muted-foreground">
              © 2026 AU College of Engineering. All rights reserved.
            </p>
            <motion.p
              className="text-xs text-muted-foreground/60"
              whileHover={{ color: "hsl(var(--primary))" }}
              transition={{ duration: 0.3 }}
            >
              Created by <span className="font-medium">Sampath</span>
            </motion.p>
          </motion.footer>
        </div>
      </div>

      {/* Close section dropdown on outside click — must be BELOW the dropdown's z-index */}
      {sectionOpen && (
        <div className="fixed inset-0 z-[45]" onClick={() => setSectionOpen(false)} />
      )}

      {/* Chat Bot */}
      <ChatBotBubble />
    </div>
  );
};

export default LandingPage;
