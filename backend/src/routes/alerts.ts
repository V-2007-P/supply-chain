import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { MOCK_ALERTS } from '../mock/data';
import { notifier } from '../services/notifier';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// GET /api/alerts
router.get('/', async (req: Request, res: Response) => {
  const { severity, resolved = 'false' } = req.query;

  if (supabase) {
    let query = supabase.from('alerts').select('*');
    if (severity) query = query.eq('severity', severity);
    query = query.eq('resolved', resolved === 'true');
    const { data, error } = await query.order('created_at', { ascending: false }).limit(50);
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  let filtered = [...MOCK_ALERTS];
  if (severity) filtered = filtered.filter((a) => a.severity === severity);
  filtered = filtered.filter((a) => a.resolved === (resolved === 'true'));
  return res.json(filtered);
});

// POST /api/alerts
router.post('/', async (req: Request, res: Response) => {
  const body = req.body;
  if (!body.type || !body.severity || !body.message) {
    return res.status(400).json({ error: 'type, severity, message are required' });
  }
  const newAlert = {
    id: `ALT-${Date.now()}`,
    created_at: new Date().toISOString(),
    resolved: false,
    affected_shipments: [],
    ...body,
  };
  if (supabase) {
    const { data, error } = await supabase.from('alerts').insert(newAlert).select().single();
    if (error) return res.status(500).json({ error: error.message });
    notifier.emit('alert:new', data);
    return res.status(201).json(data);
  }
  notifier.emit('alert:new', newAlert);
  return res.status(201).json(newAlert);
});

// PUT /api/alerts/:id/resolve
router.put('/:id/resolve', async (req: Request, res: Response) => {
  const { id } = req.params;

  if (supabase) {
    const { data, error } = await supabase
      .from('alerts')
      .update({ resolved: true })
      .eq('id', id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  const alert = MOCK_ALERTS.find((a) => a.id === id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  return res.json({ ...alert, resolved: true });
});

export default router;
