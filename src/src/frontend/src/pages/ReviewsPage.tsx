import { useState, useMemo } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetReviewsForUser,
  useGetMySwapRequests,
  useSubmitReview,
} from "../hooks/useQueries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Star, MessageSquare, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewsPage() {
  const { identity, loginStatus, login } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal().toString();

  const { data: myReviews, isLoading: reviewsLoading } =
    useGetReviewsForUser(myPrincipal || null);
  const { data: swapRequests } = useGetMySwapRequests();
  const submitReviewMutation = useSubmitReview();

  const [reviewDialog, setReviewDialog] = useState(false);
  const [selectedSwapId, setSelectedSwapId] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");

  const isLoggedIn = loginStatus === "success" && identity;

  const completedSwaps = useMemo(() => {
    if (!swapRequests) return [];
    return swapRequests.filter((r) => r.status === "completed");
  }, [swapRequests]);

  if (!isLoggedIn && loginStatus !== "logging-in") {
    login();
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Authenticating...</p>
      </div>
    );
  }

  const handleSubmitReview = () => {
    if (!selectedSwapId) {
      toast.error("Please select a swap request");
      return;
    }

    submitReviewMutation.mutate(
      {
        swapRequestId: BigInt(selectedSwapId),
        rating: BigInt(rating),
        comment: comment.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success("Review submitted successfully!");
          setReviewDialog(false);
          setSelectedSwapId("");
          setRating(5);
          setComment("");
        },
        onError: () => {
          toast.error("Failed to submit review");
        },
      }
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? "text-accent fill-accent"
                : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  const RatingSelector = () => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= rating
                  ? "text-accent fill-accent"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Reviews & Ratings</h1>
            <p className="text-lg text-muted-foreground mt-1">
              View feedback from your skill exchanges
            </p>
          </div>
          <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Submit Review
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit a Review</DialogTitle>
                <DialogDescription>
                  Rate your skill exchange experience
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="swap">Select Completed Swap</Label>
                  <Select value={selectedSwapId} onValueChange={setSelectedSwapId}>
                    <SelectTrigger id="swap" className="mt-2">
                      <SelectValue placeholder="Choose a swap..." />
                    </SelectTrigger>
                    <SelectContent>
                      {completedSwaps.length > 0 ? (
                        completedSwaps.map((swap) => (
                          <SelectItem
                            key={swap.id.toString()}
                            value={swap.id.toString()}
                          >
                            {swap.skillOffered} ↔ {swap.skillWanted}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No completed swaps
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Rating</Label>
                  <div className="mt-2">
                    <RatingSelector />
                  </div>
                </div>

                <div>
                  <Label htmlFor="comment">Comment (Optional)</Label>
                  <Textarea
                    id="comment"
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mt-2 min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setReviewDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitReview}
                  disabled={submitReviewMutation.isPending}
                >
                  {submitReviewMutation.isPending
                    ? "Submitting..."
                    : "Submit Review"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviewsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : myReviews && myReviews.length > 0 ? (
            myReviews.map((review, idx) => (
              <Card key={idx} className="border-2 hover:shadow-lifted transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        From: {review.reviewer.toString().slice(0, 20)}...
                      </CardTitle>
                      {renderStars(Number(review.rating))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Swap ID: {review.swapRequestId.toString()}
                    </div>
                  </div>
                </CardHeader>
                {review.comment && (
                  <CardContent>
                    <p className="text-muted-foreground italic">
                      "{review.comment}"
                    </p>
                  </CardContent>
                )}
              </Card>
            ))
          ) : (
            <div className="text-center py-20">
              <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
              <p className="text-muted-foreground">
                Complete skill swaps to receive reviews from your partners
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
