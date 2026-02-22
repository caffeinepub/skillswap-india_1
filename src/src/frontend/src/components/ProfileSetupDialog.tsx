import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSaveProfile } from "../hooks/useQueries";
import { toast } from "sonner";
import { X } from "lucide-react";
import type { UserProfile, Skill } from "../backend";

interface ProfileSetupDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingProfile?: UserProfile;
}

export default function ProfileSetupDialog({
  open,
  onClose,
  onSuccess,
  existingProfile,
}: ProfileSetupDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [skillOfferedInput, setSkillOfferedInput] = useState("");
  const [skillWantedInput, setSkillWantedInput] = useState("");
  const [skillsOffered, setSkillsOffered] = useState<Skill[]>([]);
  const [skillsWanted, setSkillsWanted] = useState<Skill[]>([]);

  const saveProfileMutation = useSaveProfile();

  useEffect(() => {
    if (existingProfile) {
      setName(existingProfile.name);
      setEmail(existingProfile.email);
      setLocation(existingProfile.location);
      setSkillsOffered(existingProfile.skillsOffered);
      setSkillsWanted(existingProfile.skillsWanted);
    }
  }, [existingProfile]);

  const addSkillOffered = () => {
    const trimmed = skillOfferedInput.trim();
    if (!trimmed) return;
    if (skillsOffered.some((s) => s.name === trimmed)) {
      toast.error("Skill already added");
      return;
    }
    setSkillsOffered([...skillsOffered, { name: trimmed }]);
    setSkillOfferedInput("");
  };

  const addSkillWanted = () => {
    const trimmed = skillWantedInput.trim();
    if (!trimmed) return;
    if (skillsWanted.some((s) => s.name === trimmed)) {
      toast.error("Skill already added");
      return;
    }
    setSkillsWanted([...skillsWanted, { name: trimmed }]);
    setSkillWantedInput("");
  };

  const removeSkillOffered = (skillName: string) => {
    setSkillsOffered(skillsOffered.filter((s) => s.name !== skillName));
  };

  const removeSkillWanted = (skillName: string) => {
    setSkillsWanted(skillsWanted.filter((s) => s.name !== skillName));
  };

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !location.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (skillsOffered.length === 0) {
      toast.error("Please add at least one skill you offer");
      return;
    }

    if (skillsWanted.length === 0) {
      toast.error("Please add at least one skill you want to learn");
      return;
    }

    const profile: UserProfile = {
      name: name.trim(),
      email: email.trim(),
      location: location.trim(),
      skillsOffered,
      skillsWanted,
      averageRating: existingProfile?.averageRating || 0,
    };

    saveProfileMutation.mutate(profile, {
      onSuccess: () => {
        toast.success(
          existingProfile ? "Profile updated!" : "Profile created!"
        );
        onSuccess();
      },
      onError: () => {
        toast.error("Failed to save profile");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingProfile ? "Edit Profile" : "Set Up Your Profile"}
          </DialogTitle>
          <DialogDescription>
            Tell us about yourself and the skills you want to exchange
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Priya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2"
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g., priya@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2"
            />
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">
              Location <span className="text-destructive">*</span>
            </Label>
            <Input
              id="location"
              placeholder="e.g., Mumbai, Maharashtra"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-2"
            />
          </div>

          {/* Skills Offered */}
          <div>
            <Label htmlFor="skillOffered">
              Skills I Offer <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="skillOffered"
                placeholder="e.g., Web Development"
                value={skillOfferedInput}
                onChange={(e) => setSkillOfferedInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkillOffered();
                  }
                }}
              />
              <Button type="button" onClick={addSkillOffered}>
                Add
              </Button>
            </div>
            {skillsOffered.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {skillsOffered.map((skill, idx) => (
                  <Badge
                    key={idx}
                    variant="default"
                    className="font-mono px-3 py-1.5 gap-2"
                  >
                    {skill.name}
                    <button
                      type="button"
                      onClick={() => removeSkillOffered(skill.name)}
                      className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Skills Wanted */}
          <div>
            <Label htmlFor="skillWanted">
              Skills I Want to Learn <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="skillWanted"
                placeholder="e.g., Guitar Playing"
                value={skillWantedInput}
                onChange={(e) => setSkillWantedInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkillWanted();
                  }
                }}
              />
              <Button type="button" onClick={addSkillWanted}>
                Add
              </Button>
            </div>
            {skillsWanted.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {skillsWanted.map((skill, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="font-mono px-3 py-1.5 gap-2"
                  >
                    {skill.name}
                    <button
                      type="button"
                      onClick={() => removeSkillWanted(skill.name)}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saveProfileMutation.isPending}
          >
            {saveProfileMutation.isPending
              ? "Saving..."
              : existingProfile
              ? "Update Profile"
              : "Create Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
