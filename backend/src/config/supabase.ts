import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.warn('[config] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — DB calls will fail until configured.');
}

// service_role client — bypasses RLS, used by the ingestion + diagnostics engine
export const supabaseAdmin = createClient(url ?? '', serviceKey ?? '', {
  auth: { persistSession: false, autoRefreshToken: false },
});
