export type Period = { subject: string; note?: string };

export const timetable: Record<string, Period[]> = {
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

export const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const noClassSubjects = ["Self Study / Library", "Swachh Bharat"];
