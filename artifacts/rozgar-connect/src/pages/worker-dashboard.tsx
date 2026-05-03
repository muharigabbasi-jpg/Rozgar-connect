import { useLocation } from "wouter";
import { useListBookings, useUpdateBookingStatus, useGetWorkerProfile, BookingStatus } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListBookingsQueryKey } from "@workspace/api-client-react";
import { Loader2, Calendar, Clock, MapPin, CheckCircle, XCircle, Star, User } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function WorkerDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: bookings, isLoading: bookingsLoading } = useListBookings({
    query: { enabled: !!user && user.userType === "worker" }
  });

  const { data: profile, isLoading: profileLoading } = useGetWorkerProfile(
    user?.workerId || 0,
    { query: { enabled: !!user?.workerId } }
  );
  
  const { mutate: updateStatus, isPending } = useUpdateBookingStatus();

  // Auth check
  if (!authLoading && (!user || user.userType !== "worker")) {
    setLocation("/login");
    return null;
  }

  const handleUpdateStatus = (bookingId: number, status: BookingStatus) => {
    updateStatus(
      { bookingId, data: { status } },
      {
        onSuccess: () => {
          toast({
            title: "Booking Updated",
            description: `Status changed to ${status}.`,
          });
          queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
        },
        onError: (err) => {
          toast({
            title: "Update Failed",
            description: err.error || "Failed to update booking status.",
            variant: "destructive",
          });
        }
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderBookingsList = (statusFilter: string | string[]) => {
    const filters = Array.isArray(statusFilter) ? statusFilter : [statusFilter];
    const filtered = bookings?.filter(b => filters.includes(b.status)) || [];
    
    if (bookingsLoading) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    if (filtered.length === 0) {
      return (
        <div className="text-center py-16 bg-card rounded-2xl border border-dashed shadow-sm">
          <div className="bg-primary/10 p-4 rounded-full inline-block mb-4">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">No bookings found</h3>
          <p className="text-muted-foreground">You don't have any bookings in this category.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filtered.map((booking, i) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <User className="h-5 w-5 text-muted-foreground" />
                        {booking.customerName}
                      </h3>
                    </div>
                    <Badge variant="outline" className={getStatusColor(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.time}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{booking.address}</span>
                      </div>
                    </div>
                  </div>
                  
                  {booking.notes && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                      <p className="font-medium mb-1">Notes:</p>
                      <p className="text-muted-foreground">{booking.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="bg-muted/30 p-6 md:w-64 border-t md:border-t-0 md:border-l flex flex-col justify-center gap-3">
                  {booking.status === 'pending' && (
                    <>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white" 
                        onClick={() => handleUpdateStatus(booking.id, 'accepted')}
                        disabled={isPending}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" /> Accept
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="w-full" 
                        onClick={() => handleUpdateStatus(booking.id, 'rejected')}
                        disabled={isPending}
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                      </Button>
                    </>
                  )}
                  
                  {booking.status === 'accepted' && (
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                      onClick={() => handleUpdateStatus(booking.id, 'completed')}
                      disabled={isPending}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
                    </Button>
                  )}

                  {(booking.status === 'completed' || booking.status === 'rejected') && (
                    <div className="text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2 py-4">
                      {booking.status === 'completed' ? (
                        <>
                          <CheckCircle className="h-8 w-8 text-green-500 mb-1" />
                          Job Completed
                        </>
                      ) : (
                        <>
                          <XCircle className="h-8 w-8 text-red-500 mb-1" />
                          Request Rejected
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Worker Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage your incoming requests and jobs</p>
            </div>
            {profile && (
              <div className="flex items-center gap-4 bg-background p-3 rounded-xl border shadow-sm">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">My Rating</p>
                  <p className="font-bold flex items-center justify-end gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {profile.avgRating > 0 ? profile.avgRating.toFixed(1) : 'New'}
                  </p>
                </div>
                <div className="w-px h-8 bg-border"></div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Reviews</p>
                  <p className="font-bold">{profile.totalReviews}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl flex-1">
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-2 md:grid-cols-4 md:w-auto">
            <TabsTrigger value="requests">New Requests</TabsTrigger>
            <TabsTrigger value="active">Active Jobs</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="reviews" className="hidden md:flex">My Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="requests">{renderBookingsList("pending")}</TabsContent>
          <TabsContent value="active">{renderBookingsList("accepted")}</TabsContent>
          <TabsContent value="history">{renderBookingsList(["completed", "rejected"])}</TabsContent>
          
          <TabsContent value="reviews">
            {profileLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !profile?.reviews || profile.reviews.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-2xl border border-dashed shadow-sm">
                <div className="bg-primary/10 p-4 rounded-full inline-block mb-4">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">No reviews yet</h3>
                <p className="text-muted-foreground">Complete jobs to get reviews from customers.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {profile.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-bold">{review.customerName}</p>
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
                      {review.comment ? (
                        <p className="text-foreground leading-relaxed">{review.comment}</p>
                      ) : (
                        <p className="text-muted-foreground italic">No comment provided.</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
