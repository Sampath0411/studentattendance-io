import { motion } from "framer-motion";

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

type Period = { subject: string; note?: string };

const timetable: Record<string, Period[]> = {
  Monday: [
    { subject: "LA Lab", note: "/ Physics Lab (Batch-based)" },
    { subject: "Data Structures Using C" },
  ],
  Tuesday: [
    { subject: "Elements of Electronics Engineering" },
    { subject: "Mathematics-II" },
    { subject: "Self Study / Library", note: "No Class" },
  ],
  Wednesday: [
    { subject: "Data Structures Using C" },
    { subject: "Physics" },
    { subject: "DS Lab", note: "/ LA Lab (Batch-based)" },
  ],
  Thursday: [
    { subject: "Digital Logic Design" },
    { subject: "Mathematics-II" },
    { subject: "Physics Lab", note: "/ DS Lab (Batch-based)" },
  ],
  Friday: [
    { subject: "Digital Logic Design" },
    { subject: "Physics" },
    { subject: "Elements of Electronics Engineering" },
  ],
  Saturday: [
    { subject: "Self Study / Library", note: "No Class" },
    { subject: "Swachh Bharat", note: "No Class" },
  ],
};

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const getColor = (subject: string) => {
  return subjectColors[subject] || "bg-card text-foreground border-border/30";
};

const Timetable = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Weekly Timetable</h1>
      <p className="text-muted-foreground text-sm mb-6">Section A2 – CSSE, AU College of Engineering</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map((day, dayIdx) => (
          <motion.div
            key={day}
            className="glass-card rounded-2xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dayIdx * 0.08 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-3">{day}</h3>
            <div className="space-y-2">
              {timetable[day].map((period, i) => (
                <div
                  key={i}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium ${getColor(period.subject)}`}
                >
                  <span>{period.subject}</span>
                  {period.note && (
                    <span className="block text-xs opacity-70 mt-0.5">{period.note}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Subject Legend</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(subjectColors)
            .filter(([name]) => name !== "Swachh Bharat" && name !== "Self Study / Library")
            .map(([name, cls]) => (
              <span key={name} className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${cls}`}>
                {name}
              </span>
            ))}
          <span className="rounded-lg border px-3 py-1.5 text-xs font-medium bg-muted text-muted-foreground border-border/30">
            No Class
          </span>
        </div>
      </div>
    </div>
  );
};

export default Timetable;
