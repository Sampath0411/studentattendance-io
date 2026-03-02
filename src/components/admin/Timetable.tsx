import { useState } from "react";
import { motion } from "framer-motion";
import { sectionConfigs, noClassSubjects } from "@/data/sectionTimetables";
import { days } from "@/data/timetable";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const subjectColors: Record<string, string> = {
  "LA Lab": "bg-[hsl(270,60%,30%)] text-[hsl(270,80%,85%)] border-[hsl(270,50%,40%)]",
  "Physics Lab": "bg-[hsl(200,60%,25%)] text-[hsl(200,80%,85%)] border-[hsl(200,50%,40%)]",
  "Physics Lab (Main)": "bg-[hsl(200,60%,25%)] text-[hsl(200,80%,85%)] border-[hsl(200,50%,40%)]",
  "Physics Lab (Chemical)": "bg-[hsl(200,50%,28%)] text-[hsl(200,70%,85%)] border-[hsl(200,40%,42%)]",
  "Data Structures Using C": "bg-[hsl(150,50%,25%)] text-[hsl(150,70%,85%)] border-[hsl(150,40%,40%)]",
  "Elements of Electronics Engineering": "bg-[hsl(30,60%,25%)] text-[hsl(30,80%,85%)] border-[hsl(30,50%,40%)]",
  "Mathematics-II": "bg-[hsl(340,50%,28%)] text-[hsl(340,70%,85%)] border-[hsl(340,40%,42%)]",
  "Self Study / Library": "bg-muted text-muted-foreground border-border/30",
  "Physics": "bg-[hsl(200,50%,28%)] text-[hsl(200,70%,85%)] border-[hsl(200,40%,42%)]",
  "DS Lab": "bg-[hsl(150,40%,22%)] text-[hsl(150,60%,80%)] border-[hsl(150,35%,35%)]",
  "Data Structures Lab": "bg-[hsl(150,40%,22%)] text-[hsl(150,60%,80%)] border-[hsl(150,35%,35%)]",
  "Digital Logic Design": "bg-[hsl(45,50%,25%)] text-[hsl(45,70%,85%)] border-[hsl(45,40%,40%)]",
  "Swachh Bharat": "bg-muted text-muted-foreground border-border/30",
  "Linux Admn. Lab": "bg-[hsl(280,50%,28%)] text-[hsl(280,70%,85%)] border-[hsl(280,40%,42%)]",
};

const getColor = (subject: string) => {
  return subjectColors[subject] || "bg-card text-foreground border-border/30";
};

type ParsedTimetable = {
  timetable: Record<string, { subject: string; note?: string }[]>;
  daySubjects: Record<string, string[]>;
};

const Timetable = ({ section = "A2" }: { section?: string }) => {
  const config = sectionConfigs[section];
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedTimetable | null>(null);
  const [saved, setSaved] = useState(false);

  const isWomensCollege = section === "Women's College";
  const timetable = parsedData?.timetable || config?.timetable || {};

  const allSubjects = Array.from(
    new Set(
      Object.values(timetable).flat().map((p) => p.subject)
    )
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setParsedData(null);
    setSaved(false);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        
        const { data, error } = await supabase.functions.invoke("parse-timetable", {
          body: { imageBase64: base64 },
        });

        if (error) {
          toast.error("Failed to parse timetable: " + error.message);
          setUploading(false);
          return;
        }

        if (data?.error) {
          toast.error(data.error);
          setUploading(false);
          return;
        }

        if (data?.timetable) {
          setParsedData(data);
          toast.success("Timetable parsed successfully! Review and save below.");
        } else {
          toast.error("Could not extract timetable from image.");
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast.error("Error uploading image");
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!parsedData) return;
    // Update in-memory config (persists for this session)
    if (config) {
      config.timetable = parsedData.timetable;
      config.daySubjects = parsedData.daySubjects;
    }
    setSaved(true);
    toast.success("Timetable saved for this session!");
  };

  if (Object.keys(timetable).length === 0 && !isWomensCollege) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-6">Weekly Timetable — {section}</h1>
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-muted-foreground">No timetable available for {section} yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Weekly Timetable — {section === "Women's College" ? "Women's College" : `Section ${section}`}
        </h1>
        {isWomensCollege && (
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="timetable-upload"
              disabled={uploading}
            />
            <label htmlFor="timetable-upload">
              <Button asChild variant="outline" className="rounded-xl cursor-pointer" disabled={uploading}>
                <span>
                  {uploading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Parsing with AI...</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" /> Upload Timetable Image</>
                  )}
                </span>
              </Button>
            </label>
            {parsedData && !saved && (
              <Button onClick={handleSave} className="rounded-xl">
                <Check className="w-4 h-4 mr-2" /> Save Timetable
              </Button>
            )}
          </div>
        )}
      </div>

      {isWomensCollege && Object.keys(timetable).length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">No timetable configured yet.</p>
          <p className="text-sm text-muted-foreground">Upload a timetable image above — AI will automatically detect subjects and schedule.</p>
        </div>
      )}

      {Object.keys(timetable).length > 0 && (
        <>
          {parsedData && !saved && (
            <div className="glass-card rounded-2xl p-4 mb-4 border-2 border-primary/30 bg-primary/5">
              <p className="text-sm text-primary font-medium">✨ AI-parsed timetable preview — click "Save Timetable" to apply</p>
            </div>
          )}
          
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
                  {(!timetable[day] || timetable[day].length === 0) && (
                    <p className="text-sm text-muted-foreground">No classes</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

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
        </>
      )}
    </div>
  );
};

export default Timetable;
