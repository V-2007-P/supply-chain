"use client";

import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, CloudLightning, Truck, MapPin, CheckCircle2 } from 'lucide-react';

export default function AlertsPage() {
  const { alerts, resolveAlert } = useAppStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'TRAFFIC': return <Truck className="w-5 h-5" />;
      case 'WEATHER': return <CloudLightning className="w-5 h-5" />;
      case 'HUB_OVERLOAD': return <MapPin className="w-5 h-5" />;
      case 'DELAY': return <Clock className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alert Management</h1>
        <p className="text-muted-foreground">Monitor and resolve network alerts</p>
      </div>

      <div className="grid gap-4">
        {alerts.length === 0 ? (
          <p className="text-muted-foreground">No alerts recorded.</p>
        ) : (
          alerts.map(alert => (
            <Card key={alert.id} className={alert.resolved ? 'opacity-60' : ''}>
              <CardContent className="p-6 flex items-start gap-4">
                <div className={`p-3 rounded-full mt-1 ${
                  alert.resolved ? 'bg-secondary text-muted-foreground' :
                  alert.severity === 'CRITICAL' ? 'bg-destructive/20 text-destructive' :
                  alert.severity === 'WARNING' ? 'bg-orange-500/20 text-orange-500' :
                  'bg-blue-500/20 text-blue-500'
                }`}>
                  {getIcon(alert.type)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{alert.region} <span className="text-muted-foreground font-normal text-sm ml-2">({alert.route})</span></h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="border-primary text-primary">{alert.type}</Badge>
                        <Badge variant="outline" className={
                          alert.severity === 'CRITICAL' ? 'border-destructive text-destructive' :
                          alert.severity === 'WARNING' ? 'border-orange-500 text-orange-500' : 'border-blue-500 text-blue-500'
                        }>{alert.severity}</Badge>
                        {alert.resolved && <Badge variant="secondary">Resolved</Badge>}
                      </div>
                    </div>
                    {!alert.resolved && (
                      <Button onClick={() => resolveAlert(alert.id)} variant="outline" size="sm" className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Resolve
                      </Button>
                    )}
                  </div>
                  <p className="text-sm mt-2">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">Affected Shipments: {alert.affected_shipments.length}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
