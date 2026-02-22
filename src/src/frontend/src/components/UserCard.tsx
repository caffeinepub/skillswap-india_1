import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Star, MapPin, Send } from "lucide-react";
import type { UserProfile } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSendSwapRequest, useGetCallerProfile } from "../hooks/useQueries";
import { toast } from "sonner";

interface UserCardProps {
  user: UserProfile;
  showActions?: boolean;
}

export default function UserCard({ user, showActions = false }: UserCardProps) {
  const { identity } = useInternetIdentity();
  const { data: myProfile } = useGetCallerProfile();
  const sendRequestMutation = useSendSwapRequest();

  const [requestDialog, setRequestDialog] = useState(false);
  const [selectedSkillOffered, setSelectedSkillOffered] = useState("");
  const [selectedSkillWanted, setSelectedSkillWanted] = useState("");

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleSendRequest = () => {
    if (!selectedSkillOffered || !selectedSkillWanted) {
      toast.error("Please select both skills");
      return;
    }

    // Note: We need the user's principal, but UserProfile doesn't include it
    // This is a limitation - in a real app, the backend should return the principal
    // For now, we'll show an error
    toast.error(
      "Unable to send request: User principal not available. This requires backend update."
    );

    // If we had the principal, code would be:
    // sendRequestMutation.mutate(
    //   {
    //     to: userPrincipal,
    //     skillOffered: selectedSkillOffered,
    //     skillWanted: selectedSkillWanted,
    //   },
    //   {
    //     onSuccess: () => {
    //       toast.success("Swap request sent!");
    //       setRequestDialog(false);
    //     },
    //     onError: () => {
    //       toast.error("Failed to send request");
    //     },
    //   }
    // );
  };

  return (
    <>
      <Card className="border-2 hover:border-primary/30 hover:shadow-lifted transition-all group">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Avatar className="w-12 h-12 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
              <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{user.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="text-sm font-semibold">
                    {user.averageRating > 0
                      ? user.averageRating.toFixed(1)
                      : "New"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{user.location}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Offers
            </p>
            <div className="flex flex-wrap gap-1.5">
              {user.skillsOffered.slice(0, 3).map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="default"
                  className="font-mono text-xs px-2 py-0.5"
                >
                  {skill.name}
                </Badge>
              ))}
              {user.skillsOffered.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{user.skillsOffered.length - 3}
                </Badge>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Wants
            </p>
            <div className="flex flex-wrap gap-1.5">
              {user.skillsWanted.slice(0, 3).map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="font-mono text-xs px-2 py-0.5"
                >
                  {skill.name}
                </Badge>
              ))}
              {user.skillsWanted.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{user.skillsWanted.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>

        {showActions && (
          <CardFooter>
            <Button
              className="w-full gap-2"
              size="sm"
              onClick={() => setRequestDialog(true)}
            >
              <Send className="w-4 h-4" />
              Send Swap Request
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Send Request Dialog */}
      <Dialog open={requestDialog} onOpenChange={setRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Swap Request to {user.name}</DialogTitle>
            <DialogDescription>
              Choose which skills you want to exchange
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="skillOffered">Skill You'll Offer</Label>
              <Select
                value={selectedSkillOffered}
                onValueChange={setSelectedSkillOffered}
              >
                <SelectTrigger id="skillOffered" className="mt-2">
                  <SelectValue placeholder="Select a skill..." />
                </SelectTrigger>
                <SelectContent>
                  {myProfile?.skillsOffered.map((skill, idx) => (
                    <SelectItem key={idx} value={skill.name}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="skillWanted">Skill You Want to Learn</Label>
              <Select
                value={selectedSkillWanted}
                onValueChange={setSelectedSkillWanted}
              >
                <SelectTrigger id="skillWanted" className="mt-2">
                  <SelectValue placeholder="Select a skill..." />
                </SelectTrigger>
                <SelectContent>
                  {user.skillsOffered.map((skill, idx) => (
                    <SelectItem key={idx} value={skill.name}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendRequest}
              disabled={sendRequestMutation.isPending}
            >
              {sendRequestMutation.isPending ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
