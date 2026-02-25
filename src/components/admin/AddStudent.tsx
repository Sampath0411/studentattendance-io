import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Upload } from "lucide-react";
import * as XLSX from "xlsx";

const AddStudent = () => {
  const [name, setName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
    const [batch, setBatch] = useState("");
    const [loading, setLoading] = useState(false);

    // Auto-assign batch based on registration number
    const getAutoBatch = (reg: string): string => {
      if (!reg) return "";
      const num = parseInt(reg.slice(-3), 10);
      if (num >= 1 && num <= 38) return "1";
      if (num >= 39 && num <= 75) return "2";
      return "";
    };

    const handleRegChange = (val: string) => {
      setRegNumber(val);
      const autoBatch = getAutoBatch(val);
      if (autoBatch) setBatch(autoBatch);
    };
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !regNumber.trim() || !password.trim()) {
      toast.error("Name, Registration Number, and Password are required");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-student", {
        body: { action: "create", name, registration_number: regNumber, password, batch: batch || null },
      });
      if (error || data?.error) {
        toast.error(data?.error || error?.message || "Failed to add student");
      } else {
        toast.success(`Student ${name} added successfully!`);
        setName("");
        setRegNumber("");
        setPassword("");
        setBatch("");
      }
    } catch {
      toast.error("Failed to add student");
    }
    setLoading(false);
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      if (rows.length === 0) {
        toast.error("Excel file is empty");
        setUploading(false);
        return;
      }

      // Normalize column names (case-insensitive)
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
        };
      }).filter((s) => s.name && s.registration_number);

      if (students.length === 0) {
        toast.error("No valid students found. Ensure columns: Name, Registration Number");
        setUploading(false);
        return;
      }

      const { data: result, error } = await supabase.functions.invoke("manage-student", {
        body: { action: "create_bulk", students },
      });

      if (error) {
        toast.error("Upload failed");
      } else {
        const successes = result.results.filter((r: any) => r.success).length;
        const failures = result.results.filter((r: any) => !r.success);
        toast.success(`${successes} students added successfully!`);
        if (failures.length > 0) {
          failures.forEach((f: any) => toast.error(`${f.registration_number}: ${f.error}`));
        }
      }
    } catch (err) {
      toast.error("Failed to parse Excel file");
    }
    setUploading(false);
    e.target.value = "";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Add New Student</h1>
      
      <div className="grid gap-6 max-w-lg">
        <div className="glass-card rounded-2xl p-6">
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
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="mt-1.5 bg-background/50 border-border/50 rounded-xl h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 mt-[3px] text-muted-foreground hover:text-foreground transition-colors"
                >
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
            <p className="text-xs text-muted-foreground">Section: A2 (default)</p>
            <Button type="submit" className="w-full h-12 rounded-xl" disabled={loading}>
              {loading ? "Adding..." : "Add Student"}
            </Button>
          </form>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Bulk Upload from Excel</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Upload an Excel file (.xlsx) with columns: <strong>Name</strong>, <strong>Registration Number</strong>, <strong>Password</strong> (optional, defaults to Student@123), <strong>Batch</strong> (optional).
          </p>
          <label className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border-2 border-dashed border-border/50 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Choose Excel file"}</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleExcelUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;
