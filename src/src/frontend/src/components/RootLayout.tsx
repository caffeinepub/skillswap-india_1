import { Outlet, Link, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  Home,
  LayoutDashboard,
  Search,
  RefreshCcw,
  Star,
  LogOut,
  Moon,
  Sun,
  Heart,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export default function RootLayout() {
  const { loginStatus, clear, identity } = useInternetIdentity();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const isLoggedIn = loginStatus === "success" && identity;

  const navLinks = [
    { to: "/", label: "Home", icon: Home, public: true },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/search", label: "Search", icon: Search },
    { to: "/requests", label: "Requests", icon: RefreshCcw },
    { to: "/reviews", label: "Reviews", icon: Star },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative px-3 py-1.5 bg-card rounded-lg border border-primary/20">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  SkillSwap
                </span>
              </div>
            </div>
            <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
              India
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              const shouldShow = link.public || isLoggedIn;

              if (!shouldShow) return null;

              return (
                <Link key={link.to} to={link.to}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "gap-2",
                      isActive && "bg-secondary/80 text-secondary-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Auth Button */}
            {isLoggedIn ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => clear()}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            ) : null}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isLoggedIn && (
          <div className="md:hidden border-t border-border/60 px-4 py-2 flex items-center gap-1 overflow-x-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              const shouldShow = link.public || isLoggedIn;

              if (!shouldShow) return null;

              return (
                <Link key={link.to} to={link.to}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "gap-2 whitespace-nowrap",
                      isActive && "bg-secondary/80 text-secondary-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              © 2026. Built with{" "}
              <Heart className="inline w-4 h-4 text-destructive fill-destructive" />{" "}
              using{" "}
              <a
                href="https://caffeine.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
            <p className="text-xs font-mono text-muted-foreground">
              Learn Anything. Teach Anything. Pay with Skills.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
