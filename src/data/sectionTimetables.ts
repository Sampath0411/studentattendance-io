import type { Period } from "./timetable";

export type SectionConfig = {
  name: string;
  fullName: string;
  batch1Range: [number, number];
  batch2Range: [number, number];
  timetable: Record<string, Period[]>;
  daySubjects: Record<string, string[]>;
};

export const sectionConfigs: Record<string, SectionConfig> = {
  A2: {
    name: "A2",
    fullName: "CSSE Section A2 (SS-I)",
    batch1Range: [1, 38],
    batch2Range: [39, 75],
    timetable: {
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
    },
    daySubjects: {
      Monday: ["LA Lab", "Physics Lab", "Data Structures Using C"],
      Tuesday: ["Elements of Electronics Engineering", "Mathematics-II", "Self Study / Library"],
      Wednesday: ["Data Structures Using C", "Physics", "DS Lab", "LA Lab"],
      Thursday: ["Digital Logic Design", "Mathematics-II", "Physics Lab", "DS Lab"],
      Friday: ["Digital Logic Design", "Physics", "Elements of Electronics Engineering"],
      Saturday: ["Self Study / Library", "Swachh Bharat"],
    },
  },

  A3: {
    name: "A3",
    fullName: "CSSE Section A3 (SS-II)",
    batch1Range: [76, 113],
    batch2Range: [114, 150],
    timetable: {
      Monday: [
        { subject: "Data Structures Using C" },
        { subject: "Elements of Electronics Engineering" },
        { subject: "Digital Logic Design" },
        { subject: "Data Structures Using C" },
      ],
      Tuesday: [
        { subject: "Linux Admn. Lab", note: "/ Physics Lab (Main) (Batch-based)" },
        { subject: "Data Structures Using C" },
      ],
      Wednesday: [
        { subject: "Mathematics-II" },
        { subject: "Physics" },
        { subject: "Self Study / Library", note: "No Class" },
        { subject: "Data Structures Lab", note: "/ Linux Admn. Lab (Batch-based)" },
      ],
      Thursday: [
        { subject: "Mathematics-II" },
        { subject: "Physics" },
        { subject: "Data Structures Lab", note: "/ Linux Admn. Lab (Batch-based)" },
      ],
      Friday: [
        { subject: "Elements of Electronics Engineering" },
        { subject: "Digital Logic Design" },
        { subject: "Self Study / Library", note: "No Class" },
      ],
      Saturday: [
        { subject: "Physics Lab (Main)", note: "/ Data Structures Lab (Batch-based)" },
        { subject: "Swachh Bharat", note: "No Class" },
      ],
    },
    daySubjects: {
      Monday: ["Data Structures Using C", "Elements of Electronics Engineering", "Digital Logic Design"],
      Tuesday: ["Linux Admn. Lab", "Physics Lab (Main)", "Data Structures Using C"],
      Wednesday: ["Mathematics-II", "Physics", "Self Study / Library", "Data Structures Lab", "Linux Admn. Lab"],
      Thursday: ["Mathematics-II", "Physics", "Data Structures Lab", "Linux Admn. Lab"],
      Friday: ["Elements of Electronics Engineering", "Digital Logic Design", "Self Study / Library"],
      Saturday: ["Physics Lab (Main)", "Data Structures Lab", "Swachh Bharat"],
    },
  },

  A4: {
    name: "A4",
    fullName: "CSSE Section A4 (SS-III)",
    batch1Range: [151, 188],
    batch2Range: [189, 225],
    timetable: {
      Monday: [
        { subject: "Physics" },
        { subject: "Self Study / Library", note: "No Class" },
        { subject: "Linux Admn. Lab", note: "/ Physics Lab (Chemical) (Batch-based)" },
      ],
      Tuesday: [
        { subject: "Elements of Electronics Engineering" },
        { subject: "Mathematics-II" },
        { subject: "Digital Logic Design" },
        { subject: "Data Structures Using C" },
      ],
      Wednesday: [
        { subject: "Self Study / Library", note: "No Class" },
        { subject: "Data Structures Using C" },
        { subject: "Data Structures Lab", note: "/ Linux Admn. Lab (Batch-based)" },
      ],
      Thursday: [
        { subject: "Physics Lab (Chemical)", note: "/ Data Structures Lab (Batch-based)" },
        { subject: "Digital Logic Design" },
      ],
      Friday: [
        { subject: "Elements of Electronics Engineering" },
        { subject: "Mathematics-II" },
        { subject: "Self Study / Library", note: "No Class" },
      ],
      Saturday: [
        { subject: "Data Structures Using C" },
        { subject: "Physics" },
        { subject: "Swachh Bharat", note: "No Class" },
      ],
    },
    daySubjects: {
      Monday: ["Physics", "Self Study / Library", "Linux Admn. Lab", "Physics Lab (Chemical)"],
      Tuesday: ["Elements of Electronics Engineering", "Mathematics-II", "Digital Logic Design", "Data Structures Using C"],
      Wednesday: ["Self Study / Library", "Data Structures Using C", "Data Structures Lab", "Linux Admn. Lab"],
      Thursday: ["Physics Lab (Chemical)", "Data Structures Lab", "Digital Logic Design"],
      Friday: ["Elements of Electronics Engineering", "Mathematics-II", "Self Study / Library"],
      Saturday: ["Data Structures Using C", "Physics", "Swachh Bharat"],
    },
  },

  A5: {
    name: "A5",
    fullName: "CSSE Section A5 (SS-IV)",
    batch1Range: [226, 263],
    batch2Range: [264, 300],
    timetable: {
      Monday: [
        { subject: "Linux Admn. Lab", note: "/ Physics Lab (Chemical) (Batch-based)" },
        { subject: "Elements of Electronics Engineering" },
      ],
      Tuesday: [
        { subject: "Mathematics-II" },
        { subject: "Physics" },
        { subject: "Elements of Electronics Engineering" },
      ],
      Wednesday: [
        { subject: "Data Structures Lab", note: "/ Linux Admn. Lab (Batch-based)" },
        { subject: "Data Structures Using C" },
      ],
      Thursday: [
        { subject: "Self Study / Library", note: "No Class" },
        { subject: "Physics" },
        { subject: "Digital Logic Design" },
        { subject: "Data Structures Using C" },
      ],
      Friday: [
        { subject: "Mathematics-II" },
        { subject: "Digital Logic Design" },
        { subject: "Physics Lab (Chemical)", note: "/ Data Structures Lab (Batch-based)" },
      ],
      Saturday: [
        { subject: "Digital Logic Design" },
        { subject: "Self Study / Library", note: "No Class" },
        { subject: "Swachh Bharat", note: "No Class" },
      ],
    },
    daySubjects: {
      Monday: ["Linux Admn. Lab", "Physics Lab (Chemical)", "Elements of Electronics Engineering"],
      Tuesday: ["Mathematics-II", "Physics", "Elements of Electronics Engineering"],
      Wednesday: ["Data Structures Lab", "Linux Admn. Lab", "Data Structures Using C"],
      Thursday: ["Self Study / Library", "Physics", "Digital Logic Design", "Data Structures Using C"],
      Friday: ["Mathematics-II", "Digital Logic Design", "Physics Lab (Chemical)", "Data Structures Lab"],
      Saturday: ["Digital Logic Design", "Self Study / Library", "Swachh Bharat"],
    },
  },

  A6: {
    name: "A6",
    fullName: "CSSE Section A6 (SS-V)",
    batch1Range: [301, 338],
    batch2Range: [339, 375],
    timetable: {
      Monday: [
        { subject: "Data Structures Using C" },
        { subject: "Mathematics-II" },
        { subject: "Self Study / Library", note: "No Class" },
      ],
      Tuesday: [
        { subject: "Physics Lab (Chemical)", note: "/ Data Structures Lab (Batch-based)" },
        { subject: "Data Structures Lab", note: "/ Linux Admn. Lab (Batch-based)" },
      ],
      Wednesday: [
        { subject: "Physics" },
        { subject: "Digital Logic Design" },
        { subject: "Self Study / Library", note: "No Class" },
      ],
      Thursday: [
        { subject: "Physics" },
        { subject: "Digital Logic Design" },
        { subject: "Linux Admn. Lab", note: "/ Physics Lab (Chemical) (Batch-based)" },
      ],
      Friday: [
        { subject: "Data Structures Using C" },
        { subject: "Mathematics-II" },
        { subject: "Elements of Electronics Engineering" },
      ],
      Saturday: [
        { subject: "Elements of Electronics Engineering" },
        { subject: "Self Study / Library", note: "No Class" },
        { subject: "Swachh Bharat", note: "No Class" },
      ],
    },
    daySubjects: {
      Monday: ["Data Structures Using C", "Mathematics-II", "Self Study / Library"],
      Tuesday: ["Physics Lab (Chemical)", "Data Structures Lab", "Linux Admn. Lab"],
      Wednesday: ["Physics", "Digital Logic Design", "Self Study / Library"],
      Thursday: ["Physics", "Digital Logic Design", "Linux Admn. Lab", "Physics Lab (Chemical)"],
      Friday: ["Data Structures Using C", "Mathematics-II", "Elements of Electronics Engineering"],
      Saturday: ["Elements of Electronics Engineering", "Self Study / Library", "Swachh Bharat"],
    },
  },

  A7: {
    name: "A7",
    fullName: "CSSE Section A7 (SS-VI)",
    batch1Range: [376, 413],
    batch2Range: [414, 450],
    timetable: {
      Monday: [
        { subject: "Digital Logic Design" },
        { subject: "Mathematics-II" },
        { subject: "Elements of Electronics Engineering" },
      ],
      Tuesday: [
        { subject: "Data Structures Using C" },
        { subject: "Mathematics-II" },
        { subject: "Linux Admn. Lab", note: "/ Data Structures Lab (Batch-based)" },
      ],
      Wednesday: [
        { subject: "Physics" },
        { subject: "Elements of Electronics Engineering" },
        { subject: "Digital Logic Design" },
      ],
      Thursday: [
        { subject: "Data Structures Using C" },
        { subject: "Self Study / Library", note: "No Class" },
        { subject: "Physics" },
      ],
      Friday: [
        { subject: "Physics Lab (Chemical)", note: "/ Linux Admn. Lab (Batch-based)" },
        { subject: "Self Study / Library", note: "No Class" },
      ],
      Saturday: [
        { subject: "Data Structures Lab", note: "/ Physics Lab (Chemical) (Batch-based)" },
        { subject: "Swachh Bharat", note: "No Class" },
      ],
    },
    daySubjects: {
      Monday: ["Digital Logic Design", "Mathematics-II", "Elements of Electronics Engineering"],
      Tuesday: ["Data Structures Using C", "Mathematics-II", "Linux Admn. Lab", "Data Structures Lab"],
      Wednesday: ["Physics", "Elements of Electronics Engineering", "Digital Logic Design"],
      Thursday: ["Data Structures Using C", "Self Study / Library", "Physics"],
      Friday: ["Physics Lab (Chemical)", "Linux Admn. Lab", "Self Study / Library"],
      Saturday: ["Data Structures Lab", "Physics Lab (Chemical)", "Swachh Bharat"],
    },
  },

  A8: {
    name: "A8",
    fullName: "CSSE Section A8 (SS-VII)",
    batch1Range: [451, 488],
    batch2Range: [489, 525],
    timetable: {
      Monday: [
        { subject: "Data Structures Lab", note: "/ Linux Admn. Lab (Batch-based)" },
        { subject: "Self Study / Library", note: "No Class" },
      ],
      Tuesday: [
        { subject: "Data Structures Using C" },
        { subject: "Physics" },
        { subject: "Elements of Electronics Engineering" },
      ],
      Wednesday: [
        { subject: "Mathematics-II" },
        { subject: "Digital Logic Design" },
        { subject: "Linux Admn. Lab", note: "/ Physics Lab (Main) (Batch-based)" },
      ],
      Thursday: [
        { subject: "Data Structures Using C" },
        { subject: "Elements of Electronics Engineering" },
        { subject: "Self Study / Library", note: "No Class" },
      ],
      Friday: [
        { subject: "Physics Lab (Main)", note: "/ Data Structures Lab (Batch-based)" },
        { subject: "Physics" },
      ],
      Saturday: [
        { subject: "Digital Logic Design" },
        { subject: "Mathematics-II" },
        { subject: "Swachh Bharat", note: "No Class" },
      ],
    },
    daySubjects: {
      Monday: ["Data Structures Lab", "Linux Admn. Lab", "Self Study / Library"],
      Tuesday: ["Data Structures Using C", "Physics", "Elements of Electronics Engineering"],
      Wednesday: ["Mathematics-II", "Digital Logic Design", "Linux Admn. Lab", "Physics Lab (Main)"],
      Thursday: ["Data Structures Using C", "Elements of Electronics Engineering", "Self Study / Library"],
      Friday: ["Physics Lab (Main)", "Data Structures Lab", "Physics"],
      Saturday: ["Digital Logic Design", "Mathematics-II", "Swachh Bharat"],
    },
  },

  A9: {
    name: "A9",
    fullName: "CSSE Section A9 (SS-VIII)",
    batch1Range: [526, 557],
    batch2Range: [558, 588],
    timetable: {
      Monday: [
        { subject: "Physics" },
        { subject: "Self Study / Library", note: "No Class" },
        { subject: "Data Structures Using C" },
      ],
      Tuesday: [
        { subject: "Digital Logic Design" },
        { subject: "Physics" },
        { subject: "Self Study / Library", note: "No Class" },
      ],
      Wednesday: [
        { subject: "Linux Admn. Lab", note: "/ Physics Lab (Chemical) (Batch-based)" },
        { subject: "Self Study / Library", note: "No Class" },
      ],
      Thursday: [
        { subject: "Mathematics-II" },
        { subject: "Elements of Electronics Engineering" },
        { subject: "Data Structures Lab", note: "/ Linux Admn. Lab (Batch-based)" },
      ],
      Friday: [
        { subject: "Mathematics-II" },
        { subject: "Digital Logic Design" },
        { subject: "Self Study / Library", note: "No Class" },
      ],
      Saturday: [
        { subject: "Elements of Electronics Engineering" },
        { subject: "Data Structures Using C" },
        { subject: "Physics Lab (Chemical)", note: "/ Data Structures Lab (Batch-based)" },
        { subject: "Swachh Bharat", note: "No Class" },
      ],
    },
    daySubjects: {
      Monday: ["Physics", "Self Study / Library", "Data Structures Using C"],
      Tuesday: ["Digital Logic Design", "Physics", "Self Study / Library"],
      Wednesday: ["Linux Admn. Lab", "Physics Lab (Chemical)", "Self Study / Library"],
      Thursday: ["Mathematics-II", "Elements of Electronics Engineering", "Data Structures Lab", "Linux Admn. Lab"],
      Friday: ["Mathematics-II", "Digital Logic Design", "Self Study / Library"],
      Saturday: ["Elements of Electronics Engineering", "Data Structures Using C", "Physics Lab (Chemical)", "Data Structures Lab", "Swachh Bharat"],
    },
  },

  "Women's College": {
    name: "Women's College",
    fullName: "Women's College",
    batch1Range: [0, 0],
    batch2Range: [0, 0],
    timetable: {},
    daySubjects: {},
  },
};

export const sections = ["A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "Women's College"];

export const noClassSubjects = ["Self Study / Library", "Swachh Bharat"];

export const getSectionKey = (section: string): string => {
  return section.toLowerCase().replace("'", "").replace(/\s+/g, "");
};

export const getAdminEmail = (section: string, username: string): string => {
  if (section === "A2") return `${username.toLowerCase()}@admin.au.edu`;
  const key = getSectionKey(section);
  return `admin.${key}@admin.au.edu`;
};

export const getBatchFromReg = (regNumber: string | null, section: string): string => {
  if (!regNumber) return "";
  const num = parseInt(regNumber.slice(-3), 10);
  const config = sectionConfigs[section];
  if (!config) return "";
  const [b1Start, b1End] = config.batch1Range;
  const [b2Start, b2End] = config.batch2Range;
  if (num >= b1Start && num <= b1End) return "Batch 1";
  if (num >= b2Start && num <= b2End) return "Batch 2";
  return "";
};
