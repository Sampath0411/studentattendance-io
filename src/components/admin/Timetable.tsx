import { motion } from "framer-motion";
import { timetable, days, type Period } from "@/data/timetable";

const subjectColors: Record<string, string> = {
  "LA Lab": "bg-[hsl(270,60%,30%)] text-[hsl(270,80%,85%)] border-[hsl(270,50%,40%)]",
  "Physics Lab": "bg-[hsl(200,60%,25%)] text-[hsl(200,80%,85%)] border-[hsl(200,50%,40%)]",
  "Data Structures Using C": "bg-[hsl(150,50%,25%)] text-[hsl(150,70%,85%)] border-[hsl(150,40%,40%)]",
  "Elements of Electronics Engineering": "bg-[hsl(30,60%,25%)] text-[hsl(30,80%,85%)] border-[hsl(30,50%,40%)]",
  "Mathematics-II": "bg-[hsl(340,50%,28%)] text-[hsl(340,70%,85%)] border-[hsl(340,40%,42%)]",
  "Self Study / Library": "bg-muted text-muted-foreground border-border/30",
  "Physics": "bg-[hsl(200,50%,28%)] text-[hsl(200,70%,85%)] border-[hsl(200,40%,42%)]",
  "DS Lab": "bg-[hsl(150,40%,22%)] text-[hsl(150,60%,80%)] border-[hsl(150,35%,35%)]",
  "Digital Logic Design": "bg-[hsl(45,50%,25%)] text-[hsl(45,70%,85%)] border-[hsl(45,40%,40%)]",
  "Swachh Bharat": "bg-muted text-muted-foreground border-border/30",
};

const getColor = (subject: string) => {
  return subjectColors[subject] || "bg-card text-foreground border-border/30";
};

const Timetable = () => {
  const allSubjects = Array.from(
    new Set(
      Object.values(timetable)
        .flat()
        .map((p) => p.subject)
    )
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Weekly Timetable — Section A2</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map((day, i) => (
          <motion.div
            key={day}
            className="glass-card rounded-2xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-3">{day}</h3>
            <div className="space-y-2">
              {(timetable[day] || []).map((period, j) => (
                <div
                  key={j}
                  className={`px-3 py-2 rounded-xl text-sm border ${getColor(period.subject)}`}
                >
                  <span className="font-medium">{period.subject}</span>
                  {period.note && (
                    <span className="text-xs opacity-70 ml-1">{period.note}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="glass-card rounded-2xl p-5 mt-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Subject Legend</h3>
        <div className="flex flex-wrap gap-2">
          {allSubjects.map((sub) => (
            <span
              key={sub}
              className={`px-3 py-1 rounded-lg text-xs border ${getColor(sub)}`}
            >
              {sub}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timetable;
