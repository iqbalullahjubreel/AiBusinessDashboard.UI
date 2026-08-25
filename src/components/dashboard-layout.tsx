import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BarChart3,
  Sparkles,
  FileText,
  ScrollText,
  Shield,
  Settings,
  User as UserIcon,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  Command,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { CommandPalette } from "@/components/command-palette";
import { NotificationsPopover } from "@/components/notifications-popover";
import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/chat", label: "AI Assistant", icon: Sparkles },
  { to: "/dashboard/files", label: "Files", icon: FileText },
  { to: "/dashboard/summaries", label: "Summaries", icon: ScrollText },
  { to: "/dashboard/admin", label: "Admin", icon: Shield, adminOnly: true },
] as const;

const secondary = [
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
  { to: "/dashboard/profile", label: "Profile", icon: UserIcon },
] as const;

export function DashboardLayout() {
  const { user, logout, loading } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => setMobileOpen(false), [path]);

  const crumbs = path.split("/").filter(Boolean);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-gradient-mesh opacity-60" aria-hidden />
      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl transition-transform lg:static lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-16 items-center justify-between px-5">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary shadow-glow">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-base font-semibold tracking-tight">{brand.namePrefix}<span className="text-gradient-primary">{brand.nameSuffix}</span></span>
            </Link>
            <button className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-2">
            <p className="px-3 pb-1 pt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Workspace</p>
            {nav.filter((item) => !("adminOnly" in item) || user.role === "admin").map((item) => {
              const active = path === item.to || (item.to !== "/dashboard" && path.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-card"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                >
                  <item.icon className={cn("h-4 w-4", active && "text-primary")} />
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronRight className="h-3.5 w-3.5 text-primary" />}
                </Link>
              );
            })}

            <p className="px-3 pb-1 pt-5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Account</p>
            {secondary.map((item) => {
              const active = path === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="m-3 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
            <p className="text-xs font-medium">Pro plan</p>
            <p className="mt-1 text-xs text-muted-foreground">82% of monthly AI quota used</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-sidebar-border">
              <div className="h-full bg-gradient-primary" style={{ width: "82%" }} />
            </div>
          </div>
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl md:px-6">
            <button className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden items-center gap-1.5 text-sm text-muted-foreground md:flex">
              {crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5 capitalize">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
                  <span className={cn(i === crumbs.length - 1 && "text-foreground")}>{c}</span>
                </span>
              ))}
            </div>

            <button
              onClick={() => setPaletteOpen(true)}
              className="ml-auto hidden h-9 w-72 items-center gap-2 rounded-lg border border-input bg-background/60 px-3 text-sm text-muted-foreground transition-colors hover:bg-accent md:flex"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">Search anything...</span>
              <kbd className="flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                <Command className="h-3 w-3" />K
              </kbd>
            </button>

            <Button variant="ghost" size="icon" onClick={() => setPaletteOpen(true)} className="md:hidden">
              <Search className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <NotificationsPopover>
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
              </Button>
            </NotificationsPopover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-accent">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-gradient-primary text-xs font-medium text-primary-foreground">
                      {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                    <Badge variant="secondary" className="mt-1.5 w-fit text-[10px] uppercase">{user.role}</Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/dashboard/profile" })}>
                  <UserIcon className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/dashboard/settings" })}>
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => { await logout(); navigate({ to: "/login" }); }}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="animate-fade-in mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
