import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { MOCK_SHIPMENTS, MOCK_ALERTS, MOCK_RECOMMENDATIONS } from './data';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  console.log('🌱 Seeding Supabase database...');

  // Seed Shipments
  console.log('Seeding shipments...');
  const { error: err1 } = await supabase.from('shipments').upsert(
    MOCK_SHIPMENTS.map((s) => ({
      ...s,
      edd: new Date(s.edd).toISOString(),
      last_scan_time: new Date(s.last_scan_time).toISOString(),
      created_at: new Date(s.created_at).toISOString(),
    })),
    { onConflict: 'id' }
  );
  if (err1) console.error('❌ Error seeding shipments:', err1.message);
  else console.log(`✅ Seeded ${MOCK_SHIPMENTS.length} shipments.`);

  // Seed Alerts
  console.log('Seeding alerts...');
  const { error: err2 } = await supabase.from('alerts').upsert(
    MOCK_ALERTS.map((a) => ({
      ...a,
      created_at: new Date(a.created_at).toISOString(),
    })),
    { onConflict: 'id' }
  );
  if (err2) console.error('❌ Error seeding alerts:', err2.message);
  else console.log(`✅ Seeded ${MOCK_ALERTS.length} alerts.`);

  // Seed Recommendations
  console.log('Seeding recommendations...');
  const { error: err3 } = await supabase.from('recommendations').upsert(
    MOCK_RECOMMENDATIONS.map((r) => ({
      ...r,
      created_at: new Date(r.created_at).toISOString(),
    })),
    { onConflict: 'id' }
  );
  if (err3) console.error('❌ Error seeding recommendations:', err3.message);
  else console.log(`✅ Seeded ${MOCK_RECOMMENDATIONS.length} recommendations.`);

  console.log('🎉 Seeding complete!');
  process.exit(0);
}

seed();
