"use client";

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  icon?: React.ReactNode;
}

export function KpiCard({ title, value, trend, trendValue, icon }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            {trend === 'up' && <ArrowUpIcon className="w-3 h-3 text-destructive mr-1" />}
            {trend === 'down' && <ArrowDownIcon className="w-3 h-3 text-green-500 mr-1" />}
            {trend === 'neutral' && <MinusIcon className="w-3 h-3 text-muted-foreground mr-1" />}
            <span className={trend === 'up' ? 'text-destructive' : trend === 'down' ? 'text-green-500' : ''}>
              {trendValue}
            </span>
            <span className="ml-1">from yesterday</span>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
