import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RotateCcw, Loader2 } from "lucide-react";

type Student = { id: string; name: string; registration_number: string | null; batch: string | null };
type Subject = { id: string; subject_name: string };
type MarkStatus = "present" | "absent" | "no_class";

const daySubjects: Record<string, string[]> = {
  Monday: ["LA Lab", "Physics Lab", "Data Structures Using C"],
  Tuesday: ["Elements of Electronics Engineering", "Mathematics-II", "Self Study / Library"],
  Wednesday: ["Data Structures Using C", "Physics", "DS Lab", "LA Lab"],
  Thursday: ["Digital Logic Design", "Mathematics-II", "Physics Lab", "DS Lab"],
  Friday: ["Digital Logic Design", "Physics", "Elements of Electronics Engineering"],
  Saturday: ["Self Study / Library", "Swachh Bharat"],
};

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const getBatchFromReg = (regNumber: string | null): string => {
  if (!regNumber) return "";
  const num = parseInt(regNumber.slice(-3), 10);
  if (num >= 1 && num <= 38) return "Batch 1";
  if (num >= 39 && num <= 75) return "Batch 2";
  return "";
};

const MarkAttendance = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [marks, setMarks] = useState<Record<string, MarkStatus>>({});
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const [rolesRes, subjectsRes] = await Promise.all([
        supabase.from("user_roles").select("user_id").eq("role", "student"),
        supabase.from("subjects").select("id, subject_name"),
      ]);
      if (rolesRes.data && rolesRes.data.length > 0) {
        const ids = rolesRes.data.map((r: any) => r.user_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, name, registration_number, batch")
          .in("id", ids)
          .order("registration_number");
        setStudents((profilesData as Student[]) || []);
        const initial: Record<string, MarkStatus> = {};
        (profilesData || []).forEach((s: any) => { initial[s.id] = "present"; });
        setMarks(initial);
      }
      setAllSubjects((subjectsRes.data as Subject[]) || []);
    };
    fetch();
  }, []);

  // Load existing attendance when date+subject changes
  useEffect(() => {
    if (!selectedDate || !selectedSubject || students.length === 0) {
      setIsEditing(false);
      return;
    }
    const loadExisting = async () => {
      setLoadingExisting(true);
      const { data } = await supabase
        .from("attendance")
        .select("student_id, status")
        .eq("subject_id", selectedSubject)
        .eq("date", selectedDate);

      if (data && data.length > 0) {
        setIsEditing(true);
        const loaded: Record<string, MarkStatus> = {};
        students.forEach((s) => { loaded[s.id] = "present"; });
        data.forEach((r: any) => { loaded[r.student_id] = r.status as MarkStatus; });
        setMarks(loaded);
        toast.info("Loaded existing attendance — you can edit and re-save.");
      } else {
        setIsEditing(false);
        const fresh: Record<string, MarkStatus> = {};
        students.forEach((s) => { fresh[s.id] = "present"; });
        setMarks(fresh);
      }
      setLoadingExisting(false);
    };
    loadExisting();
  }, [selectedDate, selectedSubject, students.length]);

  const getFilteredSubjects = (): Subject[] => {
    if (!selectedDate) return allSubjects;
    const date = new Date(selectedDate + "T00:00:00");
    const dayName = dayNames[date.getDay()];
    const todaySubjectNames = daySubjects[dayName];
    if (!todaySubjectNames) return allSubjects;
    return allSubjects.filter((s) => todaySubjectNames.includes(s.subject_name));
  };

  const filteredSubjects = getFilteredSubjects();

  useEffect(() => {
    if (selectedSubject && filteredSubjects.length > 0) {
      const stillValid = filteredSubjects.some((s) => s.id === selectedSubject);
      if (!stillValid) setSelectedSubject("");
    }
  }, [selectedDate]);

  const toggleStatus = (studentId: string) => {
    setMarks((prev) => {
      const current = prev[studentId];
      const next = current === "present" ? "absent" : current === "absent" ? "no_class" : "present";
      return { ...prev, [studentId]: next };
    });
  };

  const markAll = (status: MarkStatus) => {
    const updated: Record<string, MarkStatus> = {};
    students.forEach((s) => { updated[s.id] = status; });
    setMarks(updated);
  };

  const clearAll = () => {
    const cleared: Record<string, MarkStatus> = {};
    students.forEach((s) => { cleared[s.id] = "present"; });
    setMarks(cleared);
  };

  const handleSubmit = async () => {
    if (!selectedSubject) {
      toast.error("Please select a subject");
      return;
    }
    setLoading(true);

    // Get subject name for notifications
    const subjectObj = allSubjects.find((s) => s.id === selectedSubject);
    const subjectName = subjectObj?.subject_name || "Unknown";

    const records = students.map((s) => ({
      student_id: s.id,
      subject_id: selectedSubject,
      date: selectedDate,
      status: marks[s.id] || "present",
      remarks: marks[s.id] === "no_class" ? "Self Study / Library" : null,
    }));

    const { error } = await supabase.from("attendance").upsert(records, {
      onConflict: "student_id,subject_id,date",
    });

    if (error) {
      toast.error("Failed to save attendance: " + error.message);
    } else {
      toast.success("Attendance saved successfully!");

      // Send notifications to students
      const notifications = students
        .filter((s) => marks[s.id] !== "no_class")
        .map((s) => ({
          student_id: s.id,
          message: marks[s.id] === "present"
            ? `You were marked Present in ${subjectName} on ${selectedDate}`
            : `You were marked Absent in ${subjectName} on ${selectedDate}`,
          type: "attendance",
          subject_name: subjectName,
          status: marks[s.id] || "present",
          date: selectedDate,
        }));

      if (notifications.length > 0) {
        await supabase.from("notifications").insert(notifications);
      }
    }
    setLoading(false);
  };

  // Group students by batch
  const batch1 = students.filter((s) => getBatchFromReg(s.registration_number) === "Batch 1" || s.batch === "1");
  const batch2 = students.filter((s) => getBatchFromReg(s.registration_number) === "Batch 2" || s.batch === "2");
  const otherBatch = students.filter((s) => {
    const b = getBatchFromReg(s.registration_number);
    return b === "" && s.batch !== "1" && s.batch !== "2";
  });

  const renderStudentRow = (s: Student) => (
    <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-background/30 hover:bg-background/50 transition-colors">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-foreground font-medium">{s.name}</p>
          <p className="text-xs text-muted-foreground font-mono">{s.registration_number}</p>
        </div>
      </div>
      <button onClick={() => toggleStatus(s.id)}>
        <Badge
          className={`cursor-pointer select-none text-sm px-4 py-1.5 ${
            marks[s.id] === "present"
              ? "bg-success/20 text-success border-success/30 hover:bg-success/30"
              : marks[s.id] === "absent"
              ? "bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30"
              : "bg-muted text-muted-foreground border-border/30 hover:bg-muted/80"
          }`}
        >
          {marks[s.id] === "no_class" ? "No Class" : marks[s.id] === "present" ? "Present" : "Absent"}
        </Badge>
      </button>
    </div>
  );

  const renderBatchSection = (title: string, batchStudents: Student[]) => {
    if (batchStudents.length === 0) return null;
    return (
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">{title} ({batchStudents.length})</h3>
        <div className="space-y-2">
          {batchStudents.map(renderStudentRow)}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Mark Attendance</h1>
        {isEditing && (
          <Badge className="bg-primary/20 text-primary border-primary/30">Editing</Badge>
        )}
      </div>
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Label>Date</Label>
            <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="mt-1 bg-background/50 border-border/50 rounded-xl" />
          </div>
          <div className="flex-1">
            <Label>Subject {filteredSubjects.length < allSubjects.length && <span className="text-xs text-muted-foreground">(for {dayNames[new Date(selectedDate + "T00:00:00").getDay()]})</span>}</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="mt-1 bg-background/50 border-border/50 rounded-xl">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {filteredSubjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.subject_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk actions */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button variant="outline" size="sm" className="rounded-xl border-border/50" onClick={() => markAll("present")}>
            All Present
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl border-border/50" onClick={() => markAll("absent")}>
            All Absent
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl border-border/50" onClick={() => markAll("no_class")}>
            No Class
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl border-border/50 text-muted-foreground" onClick={clearAll}>
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Clear Response
          </Button>
        </div>

        {loadingExisting ? (
          <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading existing attendance...
          </div>
        ) : students.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No students found. Add students first.</p>
        ) : (
          <div>
            {renderBatchSection("Batch 1 (001–038)", batch1)}
            {renderBatchSection("Batch 2 (039–075)", batch2)}
            {renderBatchSection("Other", otherBatch)}
          </div>
        )}

        <Button onClick={handleSubmit} className="w-full mt-6 h-12 rounded-xl" disabled={loading || students.length === 0}>
          {loading ? "Saving..." : isEditing ? "Update Attendance" : "Save Attendance"}
        </Button>
      </div>
    </div>
  );
};

export default MarkAttendance;
