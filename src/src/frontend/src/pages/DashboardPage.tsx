import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerProfile,
  useFindMatches,
  useGetMySwapRequests,
} from "../hooks/useQueries";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Edit,
  Star,
  MapPin,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import ProfileSetupDialog from "../components/ProfileSetupDialog";
import UserCard from "../components/UserCard";

export default function DashboardPage() {
  const { identity, loginStatus, login } = useInternetIdentity();
  const navigate = useNavigate();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useGetCallerProfile();
  const { data: matches, isLoading: matchesLoading } = useFindMatches();
  const { data: swapRequests, isLoading: requestsLoading } =
    useGetMySwapRequests();

  const isLoggedIn = loginStatus === "success" && identity;

  useEffect(() => {
    if (!isLoggedIn && loginStatus !== "logging-in") {
      login();
    }
  }, [isLoggedIn, loginStatus, login]);

  useEffect(() => {
    if (isLoggedIn && !profileLoading && !profile) {
      setShowProfileSetup(true);
    }
  }, [isLoggedIn, profileLoading, profile]);

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Authenticating...</p>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-48 w-full mb-8" />
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to SkillSwap!</h2>
          <p className="text-muted-foreground mb-6">
            Let's set up your profile to start swapping skills.
          </p>
          <Button onClick={() => setShowProfileSetup(true)}>
            Create Profile
          </Button>
        </div>
        <ProfileSetupDialog
          open={showProfileSetup}
          onClose={() => setShowProfileSetup(false)}
          onSuccess={() => {
            setShowProfileSetup(false);
            refetchProfile();
          }}
        />
      </>
    );
  }

  const pendingRequests =
    swapRequests?.filter((r) => r.status === "pending") || [];
  const completedSwaps =
    swapRequests?.filter((r) => r.status === "completed") || [];
  const matchCount = matches?.length || 0;

  return (
    <>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Profile Header Card */}
        <Card className="border-2 shadow-lifted">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              {/* Avatar */}
              <Avatar className="w-20 h-20 border-4 border-primary/20">
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Profile Info */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <h2 className="text-3xl font-bold">{profile.name}</h2>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-accent fill-accent" />
                    <span className="font-semibold text-lg">
                      {profile.averageRating > 0
                        ? profile.averageRating.toFixed(1)
                        : "New"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>

                {/* Skills */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Skills I Offer
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profile.skillsOffered.map((skill, idx) => (
                        <Badge
                          key={idx}
                          variant="default"
                          className="font-mono px-3 py-1"
                        >
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Skills I Want
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profile.skillsWanted.map((skill, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="font-mono px-3 py-1"
                        >
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setShowProfileSetup(true)}
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{matchCount}</div>
                <p className="text-sm text-muted-foreground">
                  Available Matches
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent/50 transition-colors">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {pendingRequests.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Pending Requests
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-chart-4/50 transition-colors">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-chart-4/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-chart-4" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {completedSwaps.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Completed Swaps
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suggested Matches */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Suggested Matches
                </CardTitle>
                <CardDescription>
                  Users who want your skills and offer skills you need
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: "/search" })}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {matchesLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : matches && matches.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.slice(0, 6).map((user, idx) => (
                  <UserCard key={idx} user={user} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No matches found yet. Check back later!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ProfileSetupDialog
        open={showProfileSetup}
        onClose={() => setShowProfileSetup(false)}
        onSuccess={() => {
          setShowProfileSetup(false);
          refetchProfile();
        }}
        existingProfile={profile}
      />
    </>
  );
}
