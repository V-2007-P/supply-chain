import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { optimizeRoute } from '../services/routeOptimizer';
import { scoreRisk } from '../services/riskEngine';
import { MOCK_RECOMMENDATIONS } from '../mock/data';
import { notifier } from '../services/notifier';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// POST /api/optimize
router.post('/optimize', async (req: Request, res: Response) => {
  const { source, destination, blocked_nh, shipment_id } = req.body;
  if (!source || !destination || !blocked_nh) {
    return res.status(400).json({ error: 'source, destination, blocked_nh are required' });
  }
  try {
    const result = await optimizeRoute(source, destination, blocked_nh);
    const recommendation = {
      id: `REC-${Date.now()}`,
      type: 'ROUTE_OPTIMIZATION',
      description: result.description,
      affected_shipments: shipment_id ? [shipment_id] : [],
      time_saved_minutes: result.estimated_time_saved_minutes,
      confidence_percent: result.confidence_percent,
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };
    if (supabase) {
      await supabase.from('recommendations').insert(recommendation);
    }
    notifier.emit('recommendation:new', recommendation);
    return res.json({ optimization: result, recommendation });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
});

// POST /api/score-risk
router.post('/score-risk', async (req: Request, res: Response) => {
  const { shipment_id, source, destination, ...rest } = req.body;
  if (!shipment_id || !source || !destination) {
    return res.status(400).json({ error: 'shipment_id, source, destination required' });
  }
  try {
    const result = await scoreRisk({ shipment_id, source, destination, ...rest });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
});

// GET /api/recommendations
router.get('/recommendations', async (req: Request, res: Response) => {
  const { status } = req.query;
  if (supabase) {
    let query = supabase.from('recommendations').select('*');
    if (status) query = query.eq('status', status);
    const { data, error } = await query.order('created_at', { ascending: false }).limit(20);
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  let recs = [...MOCK_RECOMMENDATIONS];
  if (status) recs = recs.filter((r) => r.status === status);
  return res.json(recs);
});

// PUT /api/recommendations/:id
router.put('/recommendations/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (supabase) {
    const { data, error } = await supabase
      .from('recommendations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  const rec = MOCK_RECOMMENDATIONS.find((r) => r.id === id);
  if (!rec) return res.status(404).json({ error: 'Not found' });
  return res.json({ ...rec, status });
});

export default router;
