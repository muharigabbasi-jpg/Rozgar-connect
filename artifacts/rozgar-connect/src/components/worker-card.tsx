import { Link } from "wouter";
import { WorkerCard as WorkerCardType } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Star, Wrench, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface WorkerCardProps {
  worker: WorkerCardType;
  index?: number;
}

export function WorkerCard({ worker, index = 0 }: WorkerCardProps) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow group">
        <CardHeader className="p-0">
          <div className="h-24 bg-primary/10 w-full relative">
            <div className="absolute -bottom-10 left-6 rounded-full border-4 border-background bg-background">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-xl bg-primary/20 text-primary font-bold">
                  {getInitials(worker.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 text-sm font-semibold">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {worker.avgRating > 0 ? worker.avgRating.toFixed(1) : 'New'}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-14 pb-4 flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                {worker.name}
                <ShieldCheck className="h-4 w-4 text-blue-500" />
              </h3>
              <p className="text-muted-foreground flex items-center gap-1.5 text-sm mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {worker.city}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">{formatPKR(worker.hourlyRate)}</p>
              <p className="text-xs text-muted-foreground">per hour</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary" className="bg-secondary/50 flex items-center gap-1">
              <Wrench className="h-3 w-3" />
              {worker.skill}
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              {worker.totalReviews} {worker.totalReviews === 1 ? 'review' : 'reviews'}
            </Badge>
          </div>

          {worker.bio && (
            <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
              {worker.bio}
            </p>
          )}
        </CardContent>
        <CardFooter className="pt-0 pb-6 px-6 gap-3">
          <Button variant="outline" className="w-full group-hover:border-primary/50 transition-colors" asChild>
            <Link href={`/worker/${worker.id}`}>View Profile</Link>
          </Button>
          <Button className="w-full" asChild>
            <Link href={`/worker/${worker.id}?book=true`}>Book Now</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
