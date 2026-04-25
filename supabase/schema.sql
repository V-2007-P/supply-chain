-- ============================================================
-- SwiftRoute — Supabase PostgreSQL Schema
-- Paste this entire file into the Supabase SQL Editor and Run
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- SHIPMENTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shipments (
  id               TEXT PRIMARY KEY,
  awb              TEXT UNIQUE NOT NULL,
  source           TEXT,
  destination      TEXT,
  current_location TEXT,
  current_hub      TEXT,
  status           TEXT CHECK (status IN ('IN_TRANSIT','DELAYED','OUT_FOR_DELIVERY','HELD_AT_HUB','DELIVERED')),
  risk_score       TEXT CHECK (risk_score IN ('LOW','MEDIUM','HIGH')),
  delay_minutes    INTEGER DEFAULT 0,
  edd              TIMESTAMP,
  last_scan_time   TIMESTAMP,
  lat              FLOAT,
  lng              FLOAT,
  created_at       TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipments_status     ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_risk_score ON shipments(risk_score);
CREATE INDEX IF NOT EXISTS idx_shipments_created_at ON shipments(created_at DESC);

ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON shipments USING (true);

-- ─────────────────────────────────────────
-- ALERTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id                  TEXT PRIMARY KEY,
  type                TEXT CHECK (type IN ('TRAFFIC','WEATHER','HUB_OVERLOAD','DELAY','VEHICLE_BREAKDOWN')),
  severity            TEXT CHECK (severity IN ('CRITICAL','WARNING','INFO')),
  region              TEXT,
  route               TEXT,
  message             TEXT,
  affected_shipments  TEXT[],
  resolved            BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_severity   ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved   ON alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON alerts USING (true);

-- ─────────────────────────────────────────
-- ROUTES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS routes (
  id                  TEXT PRIMARY KEY,
  name                TEXT,
  waypoints           TEXT[],
  is_blocked          BOOLEAN DEFAULT FALSE,
  congestion_level    INTEGER DEFAULT 0,
  alternate_route_id  TEXT,
  nh_number           TEXT
);

ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON routes USING (true);

-- ─────────────────────────────────────────
-- RECOMMENDATIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recommendations (
  id                    TEXT PRIMARY KEY,
  type                  TEXT,
  description           TEXT,
  affected_shipments    TEXT[],
  time_saved_minutes    INTEGER,
  confidence_percent    INTEGER,
  status                TEXT DEFAULT 'PENDING',
  created_at            TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_status     ON recommendations(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_created_at ON recommendations(created_at DESC);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON recommendations USING (true);

-- ─────────────────────────────────────────
-- REALTIME — enable for live subscriptions
-- ─────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE recommendations;
