import { useMemo } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetMySwapRequests,
  useAcceptSwapRequest,
  useRejectSwapRequest,
  useMarkSwapComplete,
  useGetCallerProfile,
} from "../hooks/useQueries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SwapRequest } from "../backend";

export default function RequestsPage() {
  const { identity, loginStatus, login } = useInternetIdentity();
  const { data: profile } = useGetCallerProfile();
  const { data: requests, isLoading } = useGetMySwapRequests();
  const acceptMutation = useAcceptSwapRequest();
  const rejectMutation = useRejectSwapRequest();
  const completeMutation = useMarkSwapComplete();

  const [scheduleDialog, setScheduleDialog] = useState<{
    open: boolean;
    request: SwapRequest | null;
  }>({ open: false, request: null });
  const [sessionDate, setSessionDate] = useState("");

  const isLoggedIn = loginStatus === "success" && identity;
  const myPrincipal = identity?.getPrincipal().toString();

  const { incoming, outgoing, accepted, completed } = useMemo(() => {
    if (!requests || !myPrincipal) {
      return { incoming: [], outgoing: [], accepted: [], completed: [] };
    }

    const incoming = requests.filter(
      (r) => r.to.toString() === myPrincipal && r.status === "pending"
    );
    const outgoing = requests.filter(
      (r) => r.from.toString() === myPrincipal && r.status === "pending"
    );
    const accepted = requests.filter((r) => r.status === "accepted");
    const completed = requests.filter((r) => r.status === "completed");

    return { incoming, outgoing, accepted, completed };
  }, [requests, myPrincipal]);

  if (!isLoggedIn && loginStatus !== "logging-in") {
    login();
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Authenticating...</p>
      </div>
    );
  }

  const handleAccept = (request: SwapRequest) => {
    setScheduleDialog({ open: true, request });
  };

  const handleScheduleSubmit = () => {
    if (!scheduleDialog.request || !sessionDate) {
      toast.error("Please select a session date");
      return;
    }

    const timestamp = BigInt(new Date(sessionDate).getTime());
    acceptMutation.mutate(
      { requestId: scheduleDialog.request.id, sessionTime: timestamp },
      {
        onSuccess: () => {
          toast.success("Request accepted and session scheduled!");
          setScheduleDialog({ open: false, request: null });
          setSessionDate("");
        },
        onError: () => {
          toast.error("Failed to accept request");
        },
      }
    );
  };

  const handleReject = (requestId: bigint) => {
    if (!confirm("Are you sure you want to reject this request?")) return;

    rejectMutation.mutate(requestId, {
      onSuccess: () => {
        toast.success("Request rejected");
      },
      onError: () => {
        toast.error("Failed to reject request");
      },
    });
  };

  const handleComplete = (requestId: bigint) => {
    if (!confirm("Mark this swap as completed?")) return;

    completeMutation.mutate(requestId, {
      onSuccess: () => {
        toast.success("Swap marked as complete!");
      },
      onError: () => {
        toast.error("Failed to mark swap as complete");
      },
    });
  };

  const formatTimestamp = (timestamp?: bigint) => {
    if (!timestamp) return "Not scheduled";
    return new Date(Number(timestamp)).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const RequestCard = ({
    request,
    type,
  }: {
    request: SwapRequest;
    type: "incoming" | "outgoing" | "accepted" | "completed";
  }) => {
    const isIncoming = type === "incoming";
    const isOutgoing = type === "outgoing";
    const isAccepted = type === "accepted";
    const isCompleted = type === "completed";

    return (
      <Card className="border-2 hover:shadow-lifted transition-all">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">
                {isIncoming ? "From" : "To"}:{" "}
                {isIncoming
                  ? request.from.toString().slice(0, 10) + "..."
                  : request.to.toString().slice(0, 10) + "..."}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <Badge
                  variant={
                    isCompleted
                      ? "default"
                      : isAccepted
                      ? "secondary"
                      : "outline"
                  }
                  className="font-mono"
                >
                  {request.status}
                </Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">
                {isIncoming ? "They offer" : "You offer"}
              </p>
              <Badge variant="default" className="font-mono">
                {request.skillOffered}
              </Badge>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">
                {isIncoming ? "You offer" : "They offer"}
              </p>
              <Badge variant="secondary" className="font-mono">
                {request.skillWanted}
              </Badge>
            </div>
          </div>

          {(isAccepted || isCompleted) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatTimestamp(request.sessionTime)}</span>
            </div>
          )}

          {isIncoming && (
            <div className="flex gap-2">
              <Button
                className="flex-1 gap-2"
                onClick={() => handleAccept(request)}
                disabled={acceptMutation.isPending}
              >
                <CheckCircle2 className="w-4 h-4" />
                Accept
              </Button>
              <Button
                variant="destructive"
                className="flex-1 gap-2"
                onClick={() => handleReject(request.id)}
                disabled={rejectMutation.isPending}
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
            </div>
          )}

          {isOutgoing && (
            <div className="text-center text-sm text-muted-foreground">
              Waiting for response...
            </div>
          )}

          {isAccepted && (
            <Button
              className="w-full gap-2"
              onClick={() => handleComplete(request.id)}
              disabled={completeMutation.isPending}
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark as Complete
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">My Swap Requests</h1>
          <p className="text-lg text-muted-foreground">
            Manage your incoming and outgoing skill exchange requests
          </p>
        </div>

        <Tabs defaultValue="incoming" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="incoming" className="gap-2">
              <Clock className="w-4 h-4" />
              Incoming ({incoming.length})
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="gap-2">
              <Clock className="w-4 h-4" />
              Outgoing ({outgoing.length})
            </TabsTrigger>
            <TabsTrigger value="accepted" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Accepted ({accepted.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Completed ({completed.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="mt-6">
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : incoming.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {incoming.map((request) => (
                  <RequestCard
                    key={request.id.toString()}
                    request={request}
                    type="incoming"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  No incoming requests
                </h3>
                <p className="text-muted-foreground">
                  Check back later for new swap requests
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="outgoing" className="mt-6">
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : outgoing.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {outgoing.map((request) => (
                  <RequestCard
                    key={request.id.toString()}
                    request={request}
                    type="outgoing"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  No outgoing requests
                </h3>
                <p className="text-muted-foreground">
                  Send a swap request to start learning!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="accepted" className="mt-6">
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : accepted.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {accepted.map((request) => (
                  <RequestCard
                    key={request.id.toString()}
                    request={request}
                    type="accepted"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  No accepted requests
                </h3>
                <p className="text-muted-foreground">
                  Accept incoming requests to start swapping
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : completed.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {completed.map((request) => (
                  <RequestCard
                    key={request.id.toString()}
                    request={request}
                    type="completed"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  No completed swaps yet
                </h3>
                <p className="text-muted-foreground">
                  Complete your first skill exchange!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Schedule Dialog */}
      <Dialog
        open={scheduleDialog.open}
        onOpenChange={(open) =>
          setScheduleDialog({ open, request: scheduleDialog.request })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Session</DialogTitle>
            <DialogDescription>
              Pick a date and time for your skill exchange session
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="sessionDate">Session Date & Time</Label>
              <Input
                id="sessionDate"
                type="datetime-local"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setScheduleDialog({ open: false, request: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleSubmit}
              disabled={acceptMutation.isPending}
            >
              {acceptMutation.isPending ? "Accepting..." : "Accept & Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
