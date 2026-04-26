"use client";

import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export function ShipmentTable() {
  const shipments = useAppStore(state => state.shipments);
  const router = useRouter();
  // Show top 10 most recent or high risk
  const displayShipments = shipments
    .sort((a, b) => new Date(b.last_scan_time).getTime() - new Date(a.last_scan_time).getTime())
    .slice(0, 8);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'DELIVERED': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'DELAYED': return 'bg-destructive/10 text-destructive hover:bg-destructive/20';
      case 'HELD_AT_HUB': return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
      default: return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
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
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Recent Shipment Updates</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>AWB</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Current Hub</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead className="text-right">Delay (min)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {displayShipments.map((shipment) => (
                <motion.tr 
                  key={`${shipment.id}-${shipment.last_scan_time}`}
                  initial={{ opacity: 0, backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
                  animate={{ opacity: 1, backgroundColor: 'transparent' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="border-b cursor-pointer hover:bg-secondary/50"
                  onClick={() => router.push(`/shipments/${shipment.id}`)}
                >
                  <TableCell className="font-medium">{shipment.awb}</TableCell>
                  <TableCell>{shipment.source} → {shipment.destination}</TableCell>
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
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
