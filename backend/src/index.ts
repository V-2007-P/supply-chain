import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import shipmentsRouter from './routes/shipments';
import alertsRouter from './routes/alerts';
import optimizeRouter from './routes/optimize';
import { notifier } from './services/notifier';
import { MOCK_SHIPMENTS, MOCK_ALERTS } from './mock/data';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// ── Socket.io ──────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Make io available globally via notifier
notifier.init(io);

// ── Middleware ─────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────
app.use('/api/shipments', shipmentsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api', optimizeRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'SwiftRoute Backend', timestamp: new Date().toISOString() });
});

// ── Socket.io connection handler ───────────────────────────
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Send initial state on connect
  socket.emit('initial:state', {
    shipments: MOCK_SHIPMENTS.slice(0, 20),
    alerts: MOCK_ALERTS.slice(0, 5),
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// ── Dev mode: simulate live updates every 8s ───────────────
if (process.env.NODE_ENV !== 'production') {
  const statusCycle = ['IN_TRANSIT', 'DELAYED', 'OUT_FOR_DELIVERY', 'HELD_AT_HUB'] as const;
  const riskCycle = ['LOW', 'MEDIUM', 'HIGH'] as const;

  setInterval(() => {
    const shipment = MOCK_SHIPMENTS[Math.floor(Math.random() * MOCK_SHIPMENTS.length)];
    const updated = {
      ...shipment,
      status: statusCycle[Math.floor(Math.random() * statusCycle.length)],
      risk_score: riskCycle[Math.floor(Math.random() * riskCycle.length)],
      delay_minutes: Math.floor(Math.random() * 120),
      last_scan_time: new Date().toISOString(),
    };
    notifier.emit('shipment:update', updated);
    console.log(`[Sim] Shipment update → ${updated.awb} → ${updated.status}`);
  }, 8000);

  setInterval(() => {
    const alert = MOCK_ALERTS[Math.floor(Math.random() * MOCK_ALERTS.length)];
    notifier.emit('alert:new', { ...alert, id: `ALT-${Date.now()}`, created_at: new Date().toISOString() });
    console.log(`[Sim] Alert broadcast → ${alert.type} [${alert.severity}]`);
  }, 15000);
}

// ── Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`\n🚚 SwiftRoute Backend running on http://localhost:${PORT}`);
  console.log(`   API:    http://localhost:${PORT}/api`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});
