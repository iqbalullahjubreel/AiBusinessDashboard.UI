import type { ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { notifications } from "@/lib/mock-data";
import { Check, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  success: Check,
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
};

export function NotificationsPopover({ children }: { children: ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border p-3">
          <p className="text-sm font-semibold">Notifications</p>
          <button className="text-xs text-primary hover:underline">Mark all read</button>
        </div>
        <ul className="max-h-80 divide-y divide-border overflow-y-auto">
          {notifications.map((n) => {
            const Icon = iconMap[n.type];
            return (
              <li key={n.id} className={cn("flex gap-3 p-3 transition-colors hover:bg-accent/40", !n.read && "bg-accent/20")}>
                <div className={cn(
                  "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg",
                  n.type === "success" && "bg-success/10 text-success",
                  n.type === "info" && "bg-primary/10 text-primary",
                  n.type === "warning" && "bg-warning/10 text-warning",
                  n.type === "error" && "bg-destructive/10 text-destructive",
                )}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{n.description}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{n.time}</span>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-border p-2 text-center">
          <button className="text-xs text-muted-foreground hover:text-foreground">View all</button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
