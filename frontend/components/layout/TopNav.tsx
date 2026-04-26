import { Bell, Search, User } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';

export function TopNav() {
  const alerts = useAppStore(state => state.alerts);
  const activeAlerts = alerts.filter(a => !a.resolved).length;

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search AWB, Hub, or Route..." 
            className="w-full bg-secondary/50 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {activeAlerts > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-[10px]">
              {activeAlerts}
            </Badge>
          )}
        </button>
        <div className="flex items-center gap-3 pl-4 border-l">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
            <User className="w-4 h-4" />
          </div>
          <div className="text-sm">
            <p className="font-medium">Operations Mgr</p>
            <p className="text-xs text-muted-foreground">North Zone</p>
          </div>
        </div>
      </div>
    </header>
  );
}
