import { useState } from "react";
import { useLocation } from "wouter";
import { useListBookings, useUpdateBookingStatus, BookingStatus } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import { ReviewDialog } from "@/components/review-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListBookingsQueryKey } from "@workspace/api-client-react";
import { Loader2, Calendar, Clock, MapPin, CheckCircle, XCircle, Star, Wrench, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function CustomerDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: bookings, isLoading } = useListBookings({
    query: { enabled: !!user && user.userType === "customer" }
  });
  
  const { mutate: updateStatus, isPending } = useUpdateBookingStatus();
  
  const [reviewBooking, setReviewBooking] = useState<any>(null);

  // Auth check
  if (!authLoading && (!user || user.userType !== "customer")) {
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

  const formatPKR = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const renderBookingsList = (statusFilter: string) => {
    const filtered = bookings?.filter(b => statusFilter === "all" || b.status === statusFilter) || [];
    
    if (isLoading) {
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
          <p className="text-muted-foreground mb-6">You don't have any {statusFilter !== "all" ? statusFilter : ""} bookings yet.</p>
          <Button onClick={() => setLocation("/browse")}>Find a Worker</Button>
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
                      <h3 className="text-xl font-bold">{booking.workerName}</h3>
                      <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
                        <Wrench className="h-4 w-4" /> {booking.workerSkill}
                      </p>
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
                      {booking.workerHourlyRate && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-primary">{formatPKR(booking.workerHourlyRate)}/hr</span>
                        </div>
                      )}
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
                  {booking.status === 'accepted' && (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white" 
                      onClick={() => handleUpdateStatus(booking.id, 'completed')}
                      disabled={isPending}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
                    </Button>
                  )}
                  
                  {booking.status === 'completed' && !booking.hasReview && (
                    <Button 
                      variant="outline" 
                      className="w-full border-primary text-primary hover:bg-primary/10"
                      onClick={() => setReviewBooking(booking)}
                    >
                      <Star className="mr-2 h-4 w-4" /> Rate Worker
                    </Button>
                  )}
                  
                  {booking.status === 'completed' && booking.hasReview && (
                    <div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" /> Reviewed
                    </div>
                  )}

                  <Button variant="ghost" className="w-full" onClick={() => setLocation(`/worker/${booking.workerId}`)}>
                    View Profile <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
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
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground mt-1">Manage your service requests and appointments</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl flex-1">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-8 grid grid-cols-2 md:grid-cols-5 w-full md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="rejected" className="hidden md:flex">Rejected</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">{renderBookingsList("all")}</TabsContent>
          <TabsContent value="pending">{renderBookingsList("pending")}</TabsContent>
          <TabsContent value="accepted">{renderBookingsList("accepted")}</TabsContent>
          <TabsContent value="completed">{renderBookingsList("completed")}</TabsContent>
          <TabsContent value="rejected">{renderBookingsList("rejected")}</TabsContent>
        </Tabs>
      </div>

      <ReviewDialog 
        booking={reviewBooking} 
        open={!!reviewBooking} 
        onOpenChange={(open) => !open && setReviewBooking(null)} 
      />
    </Layout>
  );
}
