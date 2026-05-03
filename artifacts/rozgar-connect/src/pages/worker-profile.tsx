import { useState } from "react";
import { useParams, useSearch, useLocation } from "wouter";
import { useGetWorkerProfile } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { BookingDialog } from "@/components/booking-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { MapPin, Star, Wrench, ShieldCheck, ArrowLeft, Clock } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth";

export default function WorkerProfile() {
  const { id } = useParams();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const shouldOpenBooking = searchParams.get("book") === "true";
  
  const workerId = parseInt(id || "0", 10);
  const { data: worker, isLoading, isError } = useGetWorkerProfile(workerId, {
    query: { enabled: !!workerId }
  });

  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [bookingOpen, setBookingOpen] = useState(shouldOpenBooking);

  const formatPKR = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleBookClick = () => {
    if (!user) {
      setLocation(`/login?redirect=/worker/${workerId}?book=true`);
      return;
    }
    setBookingOpen(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !worker) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-destructive">Worker not found</h2>
          <p className="text-muted-foreground mt-2 mb-6">The worker profile you're looking for doesn't exist.</p>
          <Button variant="outline" onClick={() => setLocation("/browse")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Browse
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
              <AvatarFallback className="text-4xl bg-primary/20 text-primary font-bold">
                {getInitials(worker.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-2">
                    {worker.name}
                    <ShieldCheck className="h-6 w-6 text-blue-500" title="Verified Worker" />
                  </h1>
                  <p className="text-lg text-muted-foreground flex items-center gap-2 mt-1">
                    <Wrench className="h-4 w-4" /> {worker.skill}
                    <span className="text-border">•</span>
                    <MapPin className="h-4 w-4" /> {worker.city}
                  </p>
                </div>
                
                <div className="text-left md:text-right bg-background p-4 rounded-xl shadow-sm border">
                  <p className="text-sm text-muted-foreground mb-1">Rate</p>
                  <p className="text-2xl font-bold text-primary">{formatPKR(worker.hourlyRate)}<span className="text-sm text-muted-foreground font-normal">/hr</span></p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">
                  <Star className="h-4 w-4 fill-current" />
                  {worker.avgRating > 0 ? worker.avgRating.toFixed(1) : 'New'}
                </div>
                <span className="text-muted-foreground text-sm">
                  ({worker.totalReviews} {worker.totalReviews === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-10">
            <section>
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <div className="bg-card p-6 rounded-2xl border shadow-sm">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {worker.bio || "This worker hasn't provided a bio yet."}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                Reviews <span className="text-muted-foreground font-normal text-lg">({worker.reviews.length})</span>
              </h2>
              
              {worker.reviews.length === 0 ? (
                <div className="bg-muted/30 p-8 rounded-2xl border border-dashed text-center">
                  <p className="text-muted-foreground">No reviews yet. Be the first to book and review!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {worker.reviews.map((review) => (
                    <div key={review.id} className="bg-card p-6 rounded-2xl border shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-semibold">{review.customerName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(review.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-foreground text-sm leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="md:col-span-1">
            <div className="sticky top-24 bg-card p-6 rounded-2xl border shadow-lg space-y-6">
              <h3 className="font-bold text-lg">Ready to hire?</h3>
              <p className="text-sm text-muted-foreground">
                Book {worker.name} for your task. You'll agree on final details after they accept.
              </p>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base Rate</span>
                  <span className="font-semibold">{formatPKR(worker.hourlyRate)}/hr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Response Time</span>
                  <span className="font-semibold">Usually within 1 hr</span>
                </div>
              </div>
              
              <Button size="lg" className="w-full text-lg h-14" onClick={handleBookClick}>
                Book This Worker
              </Button>
            </div>
          </div>
        </div>
      </div>

      <BookingDialog 
        worker={worker} 
        open={bookingOpen} 
        onOpenChange={setBookingOpen} 
      />
    </Layout>
  );
}
