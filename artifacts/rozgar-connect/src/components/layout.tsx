import { Navbar } from "./navbar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="bg-muted text-muted-foreground border-t py-12 mt-auto">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-bold text-xl text-foreground mb-4 tracking-tight">Rozgar<span className="text-primary">Connect</span></h3>
            <p className="max-w-xs leading-relaxed">
              Apna Kaam, Apne Haath Se. The trusted platform for finding skilled, verified local labor across Pakistan.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-primary transition-colors">Find Workers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Join as Worker</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">How it works</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Safety</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">© {new Date().getFullYear()} Rozgar Connect. All rights reserved.</p>
          <div className="flex gap-4 text-sm">
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
