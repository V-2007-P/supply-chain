"use client";

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Zap } from 'lucide-react';
import axios from 'axios';

export function RecommendationsPanel() {
  const { recommendations, setRecommendations } = useAppStore();
  const pending = recommendations.filter(r => r.status === 'PENDING');

  useEffect(() => {
    // Fetch initial recommendations
    const fetchRecs = async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recommendations`);
        setRecommendations(data);
      } catch (err) {
        console.error('Failed to fetch recommendations', err);
      }
    };
    fetchRecs();
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            AI Recommendations
          </span>
          {pending.length > 0 && <Badge variant="secondary">{pending.length} New</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[300px]">
          <div className="p-4 space-y-4">
            {pending.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center">System running optimally.</p>
            ) : (
              pending.map(rec => (
                <div key={rec.id} className="p-4 rounded-lg border bg-gradient-to-br from-card to-secondary/30">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="border-primary text-primary">
                      {rec.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs font-medium text-green-500">
                      Save ~{rec.time_saved_minutes}m
                    </span>
                  </div>
                  <p className="text-sm mb-3 text-muted-foreground">{rec.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${rec.confidence_percent}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground">{rec.confidence_percent}% Match</span>
                    </div>
                    <Button size="sm" className="h-7 text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Execute
                    </Button>
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
