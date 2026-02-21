import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AddStudent = () => {
  const [name, setName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [password, setPassword] = useState("");
  const [batch, setBatch] = useState("");
  const [loading, setLoading] = useState(false);

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
      const email = `${regNumber.toLowerCase()}@student.au.edu`;
      
      // Sign up the student via edge function or admin API
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            registration_number: regNumber,
          },
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        // Update batch if provided
        if (batch && data.user) {
          await supabase
            .from("profiles")
            .update({ batch })
            .eq("id", data.user.id);
        }
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Add New Student</h1>
      <div className="glass-card rounded-2xl p-6 max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label>Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter student name" className="mt-1.5 bg-background/50 border-border/50 rounded-xl h-12" />
          </div>
          <div>
            <Label>Registration Number</Label>
            <Input value={regNumber} onChange={(e) => setRegNumber(e.target.value)} placeholder="e.g., 322103310001" className="mt-1.5 bg-background/50 border-border/50 rounded-xl h-12" />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className="mt-1.5 bg-background/50 border-border/50 rounded-xl h-12" />
          </div>
          <div>
            <Label>Batch (optional)</Label>
            <Input value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="e.g., Batch 1" className="mt-1.5 bg-background/50 border-border/50 rounded-xl h-12" />
          </div>
          <p className="text-xs text-muted-foreground">Section: A2 (default)</p>
          <Button type="submit" className="w-full h-12 rounded-xl" disabled={loading}>
            {loading ? "Adding..." : "Add Student"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;
