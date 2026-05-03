import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useLogout } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Menu, User, LogOut, Briefcase, Home } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const { user, logout: clearAuth } = useAuth();
  const { mutate: logout } = useLogout();
  const { toast } = useToast();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        clearAuth();
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        });
      },
    });
  };

  const navLinks = (
    <>
      <Link href="/browse" className="text-sm font-medium hover:text-primary transition-colors">
        Find Workers
      </Link>
      {!user && (
        <Link href="/signup" className="text-sm font-medium hover:text-primary transition-colors">
          Join as Worker
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">Rozgar<span className="text-primary">Connect</span></span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            {navLinks}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline-block">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.phone}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={user.userType === 'customer' ? "/customer/dashboard" : "/worker/dashboard"} className="cursor-pointer w-full flex items-center">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-6 mt-8">
                <Link href="/" className="text-lg font-medium">Home</Link>
                <Link href="/browse" className="text-lg font-medium">Find Workers</Link>
                {!user ? (
                  <>
                    <Link href="/signup" className="text-lg font-medium">Join as Worker</Link>
                    <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link href="/login">Log in</Link>
                      </Button>
                      <Button className="w-full justify-start" asChild>
                        <Link href="/signup">Sign up</Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link href={user.userType === 'customer' ? "/customer/dashboard" : "/worker/dashboard"} className="text-lg font-medium">Dashboard</Link>
                    <Button variant="destructive" className="w-full justify-start mt-4" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
