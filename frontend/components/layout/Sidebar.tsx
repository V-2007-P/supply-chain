import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Map as MapIcon, AlertTriangle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Shipments', href: '/shipments', icon: Package },
    { name: 'Live Map', href: '/map', icon: MapIcon },
    { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
  ];

  return (
    <div className="w-64 border-r bg-card h-screen flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b">
        <span className="font-bold text-xl tracking-tight text-primary flex items-center gap-2">
          <Package className="w-6 h-6" />
          SwiftRoute
        </span>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-secondary w-full">
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </div>
    </div>
  );
}
