import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useLogin, LoginBodyUserType } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const redirect = new URLSearchParams(searchString).get("redirect");
  
  const { setUser } = useAuth();
  const { toast } = useToast();
  const { mutate: login, isPending } = useLogin();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<LoginBodyUserType>("customer");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    login(
      { data: { phone, password, userType } },
      {
        onSuccess: (data) => {
          setUser(data.user);
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
          
          if (redirect) {
            setLocation(redirect);
          } else {
            setLocation(data.user.userType === "customer" ? "/customer/dashboard" : "/worker/dashboard");
          }
        },
        onError: (err) => {
          toast({
            title: "Login failed",
            description: err.error || "Invalid credentials",
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
          className="w-full max-w-md"
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
              <CardTitle className="text-2xl">Log in to your account</CardTitle>
              <CardDescription>Welcome back to Rozgar Connect</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="customer" onValueChange={(v) => setUserType(v as LoginBodyUserType)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="customer">Customer</TabsTrigger>
                  <TabsTrigger value="worker">Worker</TabsTrigger>
                </TabsList>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      placeholder="e.g. 03001234567" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full mt-6" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Log in
                  </Button>
                </form>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center border-t p-4 text-sm text-muted-foreground">
              Don't have an account? <Link href="/signup" className="text-primary font-medium ml-1 hover:underline">Sign up</Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
