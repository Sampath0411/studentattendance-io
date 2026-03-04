// Public & international holidays (month is 0-indexed)
export interface Holiday {
  name: string;
  date: { month: number; day: number };
  type: "national" | "international" | "cultural";
  emoji: string;
}

export const holidays: Holiday[] = [
  { name: "New Year's Day", date: { month: 0, day: 1 }, type: "international", emoji: "🎉" },
  { name: "Republic Day", date: { month: 0, day: 26 }, type: "national", emoji: "🇮🇳" },
  { name: "Valentine's Day", date: { month: 1, day: 14 }, type: "international", emoji: "❤️" },
  { name: "International Women's Day", date: { month: 2, day: 8 }, type: "international", emoji: "👩" },
  { name: "Holi", date: { month: 2, day: 14 }, type: "cultural", emoji: "🎨" },
  { name: "World Water Day", date: { month: 2, day: 22 }, type: "international", emoji: "💧" },
  { name: "Ugadi", date: { month: 2, day: 30 }, type: "cultural", emoji: "🌸" },
  { name: "April Fool's Day", date: { month: 3, day: 1 }, type: "international", emoji: "🤡" },
  { name: "Ambedkar Jayanti", date: { month: 3, day: 14 }, type: "national", emoji: "📘" },
  { name: "Earth Day", date: { month: 3, day: 22 }, type: "international", emoji: "🌍" },
  { name: "Labour Day", date: { month: 4, day: 1 }, type: "international", emoji: "⚒️" },
  { name: "World Environment Day", date: { month: 5, day: 5 }, type: "international", emoji: "🌿" },
  { name: "International Yoga Day", date: { month: 5, day: 21 }, type: "international", emoji: "🧘" },
  { name: "Independence Day", date: { month: 7, day: 15 }, type: "national", emoji: "🇮🇳" },
  { name: "Teachers' Day", date: { month: 8, day: 5 }, type: "national", emoji: "👨‍🏫" },
  { name: "Engineer's Day", date: { month: 8, day: 15 }, type: "national", emoji: "⚙️" },
  { name: "Gandhi Jayanti", date: { month: 9, day: 2 }, type: "national", emoji: "🕊️" },
  { name: "World Mental Health Day", date: { month: 9, day: 10 }, type: "international", emoji: "🧠" },
  { name: "Dussehra", date: { month: 9, day: 12 }, type: "cultural", emoji: "🏹" },
  { name: "Halloween", date: { month: 9, day: 31 }, type: "international", emoji: "🎃" },
  { name: "Diwali", date: { month: 10, day: 1 }, type: "cultural", emoji: "🪔" },
  { name: "Children's Day", date: { month: 10, day: 14 }, type: "national", emoji: "👶" },
  { name: "World Kindness Day", date: { month: 10, day: 13 }, type: "international", emoji: "💝" },
  { name: "Christmas", date: { month: 11, day: 25 }, type: "international", emoji: "🎄" },
  { name: "New Year's Eve", date: { month: 11, day: 31 }, type: "international", emoji: "🥳" },
];

export function getTodayHoliday(): Holiday | null {
  const now = new Date();
  const month = now.getMonth();
  const day = now.getDate();
  return holidays.find(h => h.date.month === month && h.date.day === day) || null;
}

export function getUpcomingHolidays(count = 3): Holiday[] {
  const now = new Date();
  const month = now.getMonth();
  const day = now.getDate();

  const sorted = [...holidays].sort((a, b) => {
    const aDays = ((a.date.month - month + 12) % 12) * 31 + a.date.day - day;
    const bDays = ((b.date.month - month + 12) % 12) * 31 + b.date.day - day;
    return aDays - bDays;
  });

  return sorted.filter(h => {
    const diff = ((h.date.month - month + 12) % 12) * 31 + h.date.day - day;
    return diff > 0;
  }).slice(0, count);
}
