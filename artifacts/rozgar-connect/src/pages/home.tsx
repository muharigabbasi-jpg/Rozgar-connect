import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { useGetPlatformStats } from "@workspace/api-client-react";
import { Search, Wrench, Zap, Hammer, Paintbrush, Sparkles, ArrowRight, ShieldCheck, Clock, Star } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const CATEGORIES = [
  { name: "Plumber", icon: Wrench, color: "bg-blue-100 text-blue-600" },
  { name: "Electrician", icon: Zap, color: "bg-yellow-100 text-yellow-600" },
  { name: "Carpenter", icon: Hammer, color: "bg-orange-100 text-orange-600" },
  { name: "Painter", icon: Paintbrush, color: "bg-purple-100 text-purple-600" },
  { name: "Cleaner", icon: Sparkles, color: "bg-teal-100 text-teal-600" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");

  const { data: stats } = useGetPlatformStats();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.append("city", city);
    if (category) params.append("category", category);
    setLocation(`/browse?${params.toString()}`);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Apna Kaam, <br/>Apne Haath Se
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-8 max-w-lg">
                Find trusted, verified local workers for your home repairs and maintenance. Reliable service, transparent pricing.
              </p>
              
              <form onSubmit={handleSearch} className="bg-background rounded-lg p-2 flex flex-col sm:flex-row gap-2 shadow-lg">
                <Input 
                  placeholder="Which city?" 
                  className="border-0 focus-visible:ring-0 text-foreground"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <div className="hidden sm:block w-px bg-border my-2"></div>
                <Input 
                  placeholder="What service?" 
                  className="border-0 focus-visible:ring-0 text-foreground"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <Button type="submit" size="lg" className="w-full sm:w-auto">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden md:block relative h-full min-h-[400px] rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 p-8"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
              <div className="relative z-10 flex flex-col h-full justify-center space-y-6">
                <div className="bg-background text-foreground p-4 rounded-xl shadow-lg transform -rotate-3 w-3/4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-primary/10 p-2 rounded-full"><Wrench className="h-4 w-4 text-primary"/></div>
                    <div>
                      <p className="font-bold text-sm">Ali Raza</p>
                      <p className="text-xs text-muted-foreground">Expert Plumber</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <span className="flex items-center text-yellow-500 font-medium"><Star className="h-3 w-3 mr-1 fill-current"/> 4.9</span>
                    <span className="font-semibold">PKR 1,500/hr</span>
                  </div>
                </div>
                
                <div className="bg-background text-foreground p-4 rounded-xl shadow-lg transform rotate-2 w-3/4 self-end">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-primary/10 p-2 rounded-full"><Zap className="h-4 w-4 text-primary"/></div>
                    <div>
                      <p className="font-bold text-sm">Hassan M.</p>
                      <p className="text-xs text-muted-foreground">Master Electrician</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <span className="flex items-center text-yellow-500 font-medium"><Star className="h-3 w-3 mr-1 fill-current"/> 5.0</span>
                    <span className="font-semibold">PKR 2,000/hr</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">What do you need help with?</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {CATEGORIES.map((cat, i) => (
              <Link key={cat.name} href={`/browse?category=${cat.name}`} asChild>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center justify-center p-6 rounded-xl bg-card border hover:border-primary hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className={`p-4 rounded-full ${cat.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <cat.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-center">{cat.name}</h3>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/50 py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 text-primary p-4 rounded-2xl mb-4">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Verified Workers</h3>
              <p className="text-muted-foreground">Every worker is vetted and reviewed by the community.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 text-primary p-4 rounded-2xl mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Quick Booking</h3>
              <p className="text-muted-foreground">Book instantly and track your service request in real-time.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 text-primary p-4 rounded-2xl mb-4">
                <Star className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Transparent Reviews</h3>
              <p className="text-muted-foreground">Read real reviews from actual customers before booking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <p className="text-4xl font-bold text-primary mb-2">{stats.totalWorkers}+</p>
                <p className="text-muted-foreground font-medium">Registered Workers</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary mb-2">{stats.totalBookings}+</p>
                <p className="text-muted-foreground font-medium">Jobs Completed</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary mb-2">{stats.cities.length}+</p>
                <p className="text-muted-foreground font-medium">Cities Covered</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary mb-2">{stats.totalCategories}+</p>
                <p className="text-muted-foreground font-medium">Service Categories</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-foreground text-background py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Are you a skilled worker?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join Rozgar Connect today to find more customers, manage your bookings easily, and grow your income. 
          </p>
          <Button size="lg" variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
            <Link href="/signup">
              Join as a Worker <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}