import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useNavigate } from "@tanstack/react-router";
import { BarChart3, FileText, LayoutDashboard, ScrollText, Settings, Shield, Sparkles, User as UserIcon } from "lucide-react";

const items = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, group: "Pages" },
  { label: "Analytics", to: "/dashboard/analytics", icon: BarChart3, group: "Pages" },
  { label: "AI Assistant", to: "/dashboard/chat", icon: Sparkles, group: "Pages" },
  { label: "Files", to: "/dashboard/files", icon: FileText, group: "Pages" },
  { label: "Summaries", to: "/dashboard/summaries", icon: ScrollText, group: "Pages" },
  { label: "Admin", to: "/dashboard/admin", icon: Shield, group: "Pages" },
  { label: "Settings", to: "/dashboard/settings", icon: Settings, group: "Account" },
  { label: "Profile", to: "/dashboard/profile", icon: UserIcon, group: "Account" },
] as const;

const actions = [
  { label: "New AI chat", to: "/dashboard/chat" },
  { label: "Upload a file", to: "/dashboard/files" },
  { label: "Generate summary", to: "/dashboard/summaries" },
] as const;

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {items.filter((i) => i.group === "Pages").map((i) => (
            <CommandItem key={i.to} onSelect={() => go(i.to)}>
              <i.icon className="mr-2 h-4 w-4" /> {i.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Account">
          {items.filter((i) => i.group === "Account").map((i) => (
            <CommandItem key={i.to} onSelect={() => go(i.to)}>
              <i.icon className="mr-2 h-4 w-4" /> {i.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          {actions.map((a) => (
            <CommandItem key={a.label} onSelect={() => go(a.to)}>
              <Sparkles className="mr-2 h-4 w-4 text-primary" /> {a.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
