"use client";

import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function ShipmentsPage() {
  const shipments = useAppStore(state => state.shipments);
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'DELIVERED': return 'bg-green-500/10 text-green-500';
      case 'DELAYED': return 'bg-destructive/10 text-destructive';
      case 'HELD_AT_HUB': return 'bg-orange-500/10 text-orange-500';
      default: return 'bg-blue-500/10 text-blue-500';
    }
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'HIGH': return 'text-destructive border-destructive font-bold';
      case 'MEDIUM': return 'text-orange-500 border-orange-500';
      default: return 'text-green-500 border-green-500';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shipment Manifest</h1>
        <p className="text-muted-foreground">Manage and track all active and historical shipments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Shipments ({shipments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>AWB</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Current Hub</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead className="text-right">Delay (min)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map((shipment) => (
                <TableRow 
                  key={shipment.id} 
                  className="cursor-pointer hover:bg-secondary/50"
                  onClick={() => router.push(`/shipments/${shipment.id}`)}
                >
                  <TableCell className="font-medium">{shipment.awb}</TableCell>
                  <TableCell>{shipment.source}</TableCell>
                  <TableCell>{shipment.destination}</TableCell>
                  <TableCell>{shipment.current_hub}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(shipment.status)}>
                      {shipment.status.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getRiskColor(shipment.risk_score)}>
                      {shipment.risk_score}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${shipment.delay_minutes > 60 ? 'text-destructive' : ''}`}>
                    {shipment.delay_minutes}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
