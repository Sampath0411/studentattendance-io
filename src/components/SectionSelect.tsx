import { GraduationCap } from "lucide-react";
import { sections, sectionConfigs } from "@/data/sectionTimetables";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SectionSelectProps {
  value: string;
  onChange: (section: string) => void;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

const getSectionLabel = (section: string) => sectionConfigs[section]?.fullName ?? section;

const SectionSelect = ({
  value,
  onChange,
  className,
  triggerClassName,
  contentClassName,
}: SectionSelectProps) => {
  return (
    <div className={cn("w-full sm:w-auto", className)}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          aria-label="Select section"
          className={cn(
            "h-12 rounded-2xl border-border/60 bg-card/60 px-4 text-foreground backdrop-blur-md",
            triggerClassName,
          )}
        >
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Section:</span>
            <span className="text-sm font-semibold text-primary">{value}</span>
          </div>
        </SelectTrigger>
        <SelectContent className={cn("z-[90] max-h-72", contentClassName)}>
          {sections.map((section) => (
            <SelectItem key={section} value={section} className="py-2.5">
              <span className="font-medium">{section}</span>
              <span className="ml-2 text-xs text-muted-foreground">{getSectionLabel(section)}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SectionSelect;
export { getSectionLabel };
