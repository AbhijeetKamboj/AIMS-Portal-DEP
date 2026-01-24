import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function seed() {
  try {
    // ensure roles
    const { error: rerr } = await supabase
      .from('roles')
      .upsert([
        { id: 1, name: 'student' },
        { id: 2, name: 'faculty' },
        { id: 3, name: 'admin' },
      ], { onConflict: 'id' });

    if (rerr) throw rerr;

    // upsert admin user mapping (replace id/email/name if needed)
    const adminId = 'ac763883-6876-41b4-ade2-82a37e1da875';
    const { error: uerr } = await supabase
      .from('users')
      .upsert(
        { id: adminId, name: 'Admin', email: 'admin@test.com', role_id: 3 },
        { onConflict: 'id' }
      );

    if (uerr) throw uerr;

    console.log('Seed complete: roles ensured and admin user upserted');
  } catch (err) {
    console.error('Seed failed:', err.message || err);
    process.exit(1);
  }
}

seed();
