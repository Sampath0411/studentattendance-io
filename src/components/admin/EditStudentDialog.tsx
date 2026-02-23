import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Student = {
  id: string;
  name: string;
  registration_number: string | null;
  batch: string | null;
};

type EditStudentDialogProps = {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

const EditStudentDialog = ({ student, open, onOpenChange, onSaved }: EditStudentDialogProps) => {
  const [name, setName] = useState(student?.name || "");
  const [regNumber, setRegNumber] = useState(student?.registration_number || "");
  const [batch, setBatch] = useState(student?.batch || "");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && student) {
      setName(student.name);
      setRegNumber(student.registration_number || "");
      setBatch(student.batch || "");
      setNewPassword("");
    }
    onOpenChange(isOpen);
  };

  const handleSave = async () => {
    if (!student) return;
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      // Update profile including registration_number
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: name.trim(),
          batch: batch.trim() || null,
          registration_number: regNumber.trim() || null,
        })
        .eq("id", student.id);

      if (profileError) {
        toast.error("Failed to update profile");
        setSaving(false);
        return;
      }

      // Reset password if provided
      if (newPassword.trim()) {
        if (newPassword.length < 6) {
          toast.error("Password must be at least 6 characters");
          setSaving(false);
          return;
        }
        const { error: resetError } = await supabase.functions.invoke("reset-student-password", {
          body: { student_id: student.id, new_password: newPassword },
        });
        if (resetError) {
          toast.error("Profile updated but password reset failed");
          setSaving(false);
          onSaved();
          onOpenChange(false);
          return;
        }
      }

      toast.success("Student updated successfully!");
      onSaved();
      onOpenChange(false);
    } catch {
      toast.error("An error occurred");
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="glass-elevated border-border/50 rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Student</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter student name" className="mt-1.5 bg-background/50 border-border/50 rounded-xl h-11" />
          </div>
          <div>
            <Label>Registration Number</Label>
            <Input value={regNumber} onChange={(e) => setRegNumber(e.target.value)} placeholder="Enter registration number" className="mt-1.5 bg-background/50 border-border/50 rounded-xl h-11" />
          </div>
          <div>
            <Label>Batch</Label>
            <Input value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="e.g., Batch 1" className="mt-1.5 bg-background/50 border-border/50 rounded-xl h-11" />
          </div>
          <div>
            <Label>New Password (leave blank to keep current)</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" className="mt-1.5 bg-background/50 border-border/50 rounded-xl h-11" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl border-border/50">Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="rounded-xl">{saving ? "Saving..." : "Save Changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditStudentDialog;
