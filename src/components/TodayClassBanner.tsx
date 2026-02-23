import { motion } from "framer-motion";
import { BookOpen, Clock } from "lucide-react";
import { timetable, noClassSubjects } from "@/data/timetable";

const TodayClassBanner = () => {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayClasses = timetable[today] || [];
  const actualClasses = todayClasses.filter(
    (p) => !noClassSubjects.includes(p.subject)
  );

  if (today === "Sunday") {
    return (
      <motion.div
        className="glass-card rounded-2xl p-5 border border-primary/20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">No classes today</p>
            <p className="text-xs text-muted-foreground">Enjoy your Sunday! 🎉</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="glass-card rounded-2xl p-5 border border-primary/20"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Today's Classes — {today}</p>
          <p className="text-xs text-muted-foreground">
            {actualClasses.length} class{actualClasses.length !== 1 ? "es" : ""} scheduled
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {todayClasses.map((period, i) => {
          const isNoClass = noClassSubjects.includes(period.subject);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isNoClass
                  ? "bg-muted/50 text-muted-foreground border-border/30"
                  : "bg-primary/10 text-primary border-primary/20"
              }`}
            >
              {period.subject}
              {period.note && (
                <span className="text-muted-foreground ml-1 text-[10px]">{period.note}</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TodayClassBanner;
