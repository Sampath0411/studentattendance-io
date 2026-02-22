import { useState, useEffect } from "react";
import { Search, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EditStudentDialog from "./EditStudentDialog";

type Student = {
  id: string;
  name: string;
  registration_number: string | null;
  section: string | null;
  batch: string | null;
};

const StudentList = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "student");
    if (!roles || roles.length === 0) {
      setStudents([]);
      setLoading(false);
      return;
    }
    const studentIds = roles.map((r: any) => r.user_id);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, registration_number, section, batch")
      .in("id", studentIds);
    if (error) toast.error("Failed to fetch students");
    else setStudents((data as Student[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) toast.error("Failed to delete student");
    else {
      toast.success("Student deleted");
      fetchStudents();
    }
  };

  const handleEdit = (student: Student) => {
    setEditStudent(student);
    setEditOpen(true);
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.registration_number || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Students List</h1>
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or registration number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background/50 border-border/50 rounded-xl h-11"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-14 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No students found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Reg. Number</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Section</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Batch</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-border/10 hover:bg-card/50 transition-colors">
                    <td className="py-3 px-4 text-foreground">{s.name}</td>
                    <td className="py-3 px-4 text-foreground font-mono text-xs">{s.registration_number || "—"}</td>
                    <td className="py-3 px-4 text-foreground">{s.section || "A2"}</td>
                    <td className="py-3 px-4 text-foreground">{s.batch || "—"}</td>
                    <td className="py-3 px-4 flex gap-1">
                      <Button variant="ghost" size="icon" className="rounded-lg text-primary hover:bg-primary/10" onClick={() => handleEdit(s)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-lg text-destructive hover:bg-destructive/10" onClick={() => handleDelete(s.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EditStudentDialog
        student={editStudent}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={fetchStudents}
      />
    </div>
  );
};

export default StudentList;
