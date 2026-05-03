import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useSignup, useListCategories, SignupBodyUserType } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { setUser } = useAuth();
  const { toast } = useToast();
  const { mutate: signup, isPending } = useSignup();
  const { data: categories = [] } = useListCategories();

  const [userType, setUserType] = useState<SignupBodyUserType>("customer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  
  // Worker specific fields
  const [skill, setSkill] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [bio, setBio] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userType === "worker" && (!skill || !hourlyRate)) {
      toast({
        title: "Missing fields",
        description: "Please select a skill and set an hourly rate.",
        variant: "destructive",
      });
      return;
    }

    signup(
      { 
        data: { 
          name, 
          phone, 
          password, 
          city, 
          userType,
          ...(userType === "worker" ? { 
            skill, 
            hourlyRate: parseInt(hourlyRate, 10), 
            bio 
          } : {})
        } 
      },
      {
        onSuccess: (data) => {
          setUser(data.user);
          toast({
            title: "Account created!",
            description: "Welcome to Rozgar Connect.",
          });
          setLocation(data.user.userType === "customer" ? "/customer/dashboard" : "/worker/dashboard");
        },
        onError: (err) => {
          toast({
            title: "Signup failed",
            description: err.error || "Please check your information and try again.",
            variant: "destructive",
          });
        }
      }
    );
  };

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center p-4 py-12 bg-muted/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg"
        >
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-2 rounded-md">
                <Briefcase className="h-6 w-6" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-foreground">Rozgar<span className="text-primary">Connect</span></span>
            </Link>
          </div>
          
          <Card className="shadow-xl border-border/50">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Create an account</CardTitle>
              <CardDescription>Join Rozgar Connect to find or offer services</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="customer" onValueChange={(v) => setUserType(v as SignupBodyUserType)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="customer">I want to hire</TabsTrigger>
                  <TabsTrigger value="worker">I want to work</TabsTrigger>
                </TabsList>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        placeholder="Ali Raza" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        placeholder="03001234567" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        placeholder="Lahore" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {userType === "worker" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-4 pt-2 border-t mt-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="skill">Your Skill</Label>
                          <Select value={skill} onValueChange={setSkill}>
                            <SelectTrigger id="skill">
                              <SelectValue placeholder="Select a skill" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rate">Hourly Rate (PKR)</Label>
                          <Input 
                            id="rate" 
                            type="number" 
                            placeholder="1500" 
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(e.target.value)}
                            required={userType === "worker"}
                            min="100"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio (Optional)</Label>
                        <Textarea 
                          id="bio" 
                          placeholder="Tell customers about your experience and expertise..." 
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="resize-none"
                          rows={3}
                        />
                      </div>
                    </motion.div>
                  )}

                  <Button type="submit" className="w-full mt-6" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center border-t p-4 text-sm text-muted-foreground">
              Already have an account? <Link href="/login" className="text-primary font-medium ml-1 hover:underline">Log in</Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
