import { useState } from "react";
import { useCreateReview, Booking } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListBookingsQueryKey } from "@workspace/api-client-react";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewDialog({ booking, open, onOpenChange }: ReviewDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutate: createReview, isPending } = useCreateReview();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating.",
        variant: "destructive",
      });
      return;
    }

    createReview(
      {
        data: {
          bookingId: booking.id,
          rating,
          comment,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Review Submitted",
            description: "Thank you for your feedback!",
          });
          queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
          onOpenChange(false);
          setRating(0);
          setComment("");
        },
        onError: (err) => {
          toast({
            title: "Error",
            description: err.error || "Failed to submit review.",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rate {booking.workerName}</DialogTitle>
          <DialogDescription>
            How was your experience with {booking.workerName} for {booking.workerSkill}?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Label className="text-lg">Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none transition-colors"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={cn(
                      "h-10 w-10 transition-all",
                      (hoveredRating || rating) >= star
                        ? "fill-yellow-400 text-yellow-400 scale-110"
                        : "text-muted-foreground hover:text-yellow-200"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Tell us about the service..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending || rating === 0} className="w-full">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
