import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Props = {
  userId: string;
  currentBatch: string | null;
  onComplete: () => void;
};

const ProfileCompletionDialog = ({ userId, currentBatch, onComplete }: Props) => {
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [batch, setBatch] = useState(currentBatch || "");
  const [saving, setSaving] = useState(false);

  const needsBatch = !currentBatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile.trim() || !email.trim()) {
      toast.error("Please fill in mobile number and email");
      return;
    }
    if (!/^\d{10}$/.test(mobile.trim())) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (needsBatch && !batch) {
      toast.error("Please select your batch");
      return;
    }

    setSaving(true);
    const updates: any = { mobile_number: mobile.trim(), email: email.trim() };
    if (needsBatch) updates.batch = batch;

    const { error } = await supabase.from("profiles").update(updates).eq("id", userId);
    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile updated successfully!");
      onComplete();
    }
    setSaving(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-md glass-elevated rounded-2xl p-6 sm:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.3)]"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, type: "spring", damping: 20 }}
        >
          <div className="text-center mb-6">
            <motion.div
              className="inline-flex p-3 rounded-xl bg-primary/20 mb-3"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <CheckCircle className="w-7 h-7 text-primary" />
            </motion.div>
            <h2 className="text-xl font-bold text-foreground">Complete Your Profile</h2>
            <p className="text-sm text-muted-foreground mt-1">Please provide your details for a better experience</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="mobile" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Mobile Number
              </Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="mt-1.5 bg-background/50 border-border/50 rounded-xl h-12"
                maxLength={10}
              />
            </div>

            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 bg-background/50 border-border/50 rounded-xl h-12"
              />
            </div>

            {needsBatch && (
              <div>
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  Batch
                </Label>
                <Select value={batch} onValueChange={setBatch}>
                  <SelectTrigger className="mt-1.5 bg-background/50 border-border/50 rounded-xl h-12">
                    <SelectValue placeholder="Select your batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Batch 1</SelectItem>
                    <SelectItem value="2">Batch 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base shadow-[0_4px_15px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_25px_rgba(99,102,241,0.35)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save & Continue"}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileCompletionDialog;
