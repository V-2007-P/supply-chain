import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { MOCK_SHIPMENTS } from '../mock/data';
import { notifier } from '../services/notifier';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// GET /api/shipments
router.get('/', async (req: Request, res: Response) => {
  const { status, risk_score, page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  if (supabase) {
    let query = supabase.from('shipments').select('*', { count: 'exact' });
    if (status) query = query.eq('status', status);
    if (risk_score) query = query.eq('risk_score', risk_score);
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ data, total: count, page: pageNum, limit: limitNum });
  }

  // Fallback to mock data
  let filtered = [...MOCK_SHIPMENTS];
  if (status) filtered = filtered.filter((s) => s.status === status);
  if (risk_score) filtered = filtered.filter((s) => s.risk_score === risk_score);
  const paginated = filtered.slice(offset, offset + limitNum);
  return res.json({ data: paginated, total: filtered.length, page: pageNum, limit: limitNum });
});

// GET /api/shipments/:id
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  if (supabase) {
    const { data, error } = await supabase.from('shipments').select('*').eq('id', id).single();
    if (error) return res.status(404).json({ error: 'Shipment not found' });
    return res.json(data);
  }

  const shipment = MOCK_SHIPMENTS.find((s) => s.id === id || s.awb === id);
  if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
  return res.json(shipment);
});

// POST /api/shipments
router.post('/', async (req: Request, res: Response) => {
  const body = req.body;
  if (!body.awb || !body.source || !body.destination) {
    return res.status(400).json({ error: 'awb, source, destination are required' });
  }
  const newShipment = {
    id: `SHP-${Date.now()}`,
    created_at: new Date().toISOString(),
    status: 'IN_TRANSIT',
    risk_score: 'LOW',
    delay_minutes: 0,
    ...body,
  };
  if (supabase) {
    const { data, error } = await supabase.from('shipments').insert(newShipment).select().single();
    if (error) return res.status(500).json({ error: error.message });
    notifier.emit('shipment:update', data);
    return res.status(201).json(data);
  }
  notifier.emit('shipment:update', newShipment);
  return res.status(201).json(newShipment);
});

// PUT /api/shipments/:id
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  if (supabase) {
    const { data, error } = await supabase
      .from('shipments')
      .update({ ...updates, last_scan_time: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    notifier.emit('shipment:update', data);
    return res.json(data);
  }

  const shipment = MOCK_SHIPMENTS.find((s) => s.id === id);
  if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
  const updated = { ...shipment, ...updates, last_scan_time: new Date().toISOString() };
  notifier.emit('shipment:update', updated);
  return res.json(updated);
});

export default router;
