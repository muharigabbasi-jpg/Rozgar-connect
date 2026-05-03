import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useListWorkers, useListCategories } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { WorkerCard } from "@/components/worker-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function Browse() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const initialCity = searchParams.get("city") || "";
  const initialCategory = searchParams.get("category") || "";

  const [city, setCity] = useState(initialCity);
  const [category, setCategory] = useState(initialCategory);
  
  // Use state to trigger the query to avoid refetching on every keystroke if we wanted
  // But for now, we'll just pass the state directly to the hook
  const { data: workers, isLoading, isError } = useListWorkers({ city, category });
  const { data: categories = [] } = useListCategories();

  const handleClearFilters = () => {
    setCity("");
    setCategory("");
  };

  return (
    <Layout>
      <div className="bg-primary/5 py-8 border-b">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Find Workers</h1>
              <p className="text-muted-foreground mt-1">Browse skilled professionals in your area</p>
            </div>
            
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 bg-card p-3 rounded-lg shadow-sm border">
              <div className="w-full sm:w-48 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="City" 
                  className="pl-9 bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-ring"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="hidden sm:block w-px bg-border my-1"></div>
              <div className="w-full sm:w-48">
                <Select value={category} onValueChange={(val) => setCategory(val === "all" ? "" : val)}>
                  <SelectTrigger className="border-0 focus:ring-1 focus:ring-ring bg-transparent">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(city || category) && (
                <Button variant="ghost" size="icon" onClick={handleClearFilters} className="hidden sm:flex" title="Clear filters">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl flex-1">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[250px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <h3 className="text-lg font-semibold text-destructive">Error loading workers</h3>
            <p className="text-muted-foreground">Please try again later.</p>
          </div>
        ) : workers?.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-center py-20 flex flex-col items-center justify-center bg-card rounded-2xl border border-dashed shadow-sm"
          >
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">No workers found</h3>
            <p className="text-muted-foreground max-w-md">
              We couldn't find any workers matching your filters. Try clearing your search or looking in a different city.
            </p>
            <Button onClick={handleClearFilters} variant="outline" className="mt-6">
              Clear Filters
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {workers?.map((worker, index) => (
              <WorkerCard key={worker.id} worker={worker} index={index} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
