import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { parseCSV, readFileAsText } from "@/lib/excel";
import { sectionConfigs } from "@/data/sectionTimetables";

const AddStudent = ({ section = "A2" }: { section?: string }) => {
  const [name, setName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [batch, setBatch] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const config = sectionConfigs[section];

  const getAutoBatch = (reg: string): string => {
    if (!reg || !config) return "";
    const num = parseInt(reg.slice(-3), 10);
    if (num >= config.batch1Range[0] && num <= config.batch1Range[1]) return "1";
    if (num >= config.batch2Range[0] && num <= config.batch2Range[1]) return "2";
    return "";
  };

  const handleRegChange = (val: string) => {
    setRegNumber(val);
    const autoBatch = getAutoBatch(val);
    if (autoBatch) setBatch(autoBatch);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !regNumber.trim() || !password.trim()) {
      toast.error("Name, Registration Number, and Password are required");
      return;
    }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-student", {
        body: { action: "create", name, registration_number: regNumber, password, batch: batch || null, section },
      });
      if (error || data?.error) {
        toast.error(data?.error || error?.message || "Failed to add student");
      } else {
        toast.success(`Student ${name} added successfully!`);
        setName(""); setRegNumber(""); setPassword(""); setBatch("");
      }
    } catch { toast.error("Failed to add student"); }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const text = await readFileAsText(file);
      const rows = parseCSV(text);
      if (rows.length === 0) { toast.error("CSV file is empty or invalid"); setUploading(false); return; }
      const students = rows.map((row) => {
        const keys = Object.keys(row);
        const get = (patterns: string[]) => {
          const key = keys.find((k) => patterns.some((p) => k.toLowerCase().includes(p)));
          return key ? String(row[key]).trim() : "";
        };
        return {
          name: get(["name"]),
          registration_number: get(["reg", "registration", "roll"]),
          password: get(["password", "pass"]) || "Student@123",
          batch: get(["batch"]) || null,
          section,
        };
      }).filter((s) => s.name && s.registration_number);
      if (students.length === 0) { toast.error("No valid students found"); setUploading(false); return; }
      const { data: result, error } = await supabase.functions.invoke("manage-student", {
        body: { action: "create_bulk", students },
      });
      if (error) { toast.error("Upload failed"); }
      else {
        const successes = result.results.filter((r: any) => r.success).length;
        const failures = result.results.filter((r: any) => !r.success);
        toast.success(`${successes} students added successfully!`);
        failures.forEach((f: any) => toast.error(`${f.registration_number}: ${f.error}`));
      }
    } catch { toast.error("Failed to parse CSV file"); }
    setUploading(false);
    e.target.value = "";
  };

  return (
    <div>
      <motion.h1 className="text-2xl font-bold text-foreground mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Add New Student — {section}
      </motion.h1>
      <div className="grid gap-6 max-w-lg">
        <motion.div className="glass-card rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter student name" className="mt-1.5 bg-background/50 border-border/50 rounded-xl h-12" />
            </div>
            <div>
              <Label>Registration Number</Label>
              <Input value={regNumber} onChange={(e) => handleRegChange(e.target.value)} placeholder="e.g., 325506402001" className="mt-1.5 bg-background/50 border-border/50 rounded-xl h-12" />
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className="mt-1.5 bg-background/50 border-border/50 rounded-xl h-12 pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 mt-[3px] text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <Label>Batch</Label>
              <Select value={batch} onValueChange={setBatch}>
                <SelectTrigger className="mt-1.5 bg-background/50 border-border/50 rounded-xl h-12">
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Batch 1</SelectItem>
                  <SelectItem value="2">Batch 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">Section: {section}</p>
            <Button type="submit" className="w-full h-12 rounded-xl active:scale-[0.98] transition-transform" disabled={loading}>
              {loading ? "Adding..." : "Add Student"}
            </Button>
          </form>
        </motion.div>

        <motion.div className="glass-card rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-semibold text-foreground mb-3">Bulk Upload from CSV</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Upload a CSV file with columns: <strong>Name</strong>, <strong>Registration Number</strong>, <strong>Password</strong> (optional), <strong>Batch</strong> (optional).
          </p>
          <label className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border-2 border-dashed border-border/50 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all active:scale-[0.98]">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Choose CSV file"}</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </motion.div>
      </div>
    </div>
  );
};

export default AddStudent;
