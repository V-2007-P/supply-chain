"use client";

import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Clock, CloudLightning, Truck, MapPin } from 'lucide-react';

export function AlertsPanel() {
  const alerts = useAppStore(state => state.alerts);
  const activeAlerts = alerts.filter(a => !a.resolved);

  const getIcon = (type: string) => {
    switch (type) {
      case 'TRAFFIC': return <Truck className="w-4 h-4" />;
      case 'WEATHER': return <CloudLightning className="w-4 h-4" />;
      case 'HUB_OVERLOAD': return <MapPin className="w-4 h-4" />;
      case 'DELAY': return <Clock className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Active Alerts</span>
          <Badge variant="destructive">{activeAlerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[300px]">
          <div className="p-4 space-y-4">
            {activeAlerts.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center">No active alerts.</p>
            ) : (
              activeAlerts.map(alert => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors">
                  <div className={`p-2 rounded-full ${
                    alert.severity === 'CRITICAL' ? 'bg-destructive/20 text-destructive' :
                    alert.severity === 'WARNING' ? 'bg-orange-500/20 text-orange-500' :
                    'bg-blue-500/20 text-blue-500'
                  }`}>
                    {getIcon(alert.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{alert.region}</p>
                      <p className="text-xs text-muted-foreground">{alert.route}</p>
                    </div>
                    <p className="text-xs">{alert.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
