import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { error } = await supabaseAdmin.from('subscriptions').insert([{
    user_id: 'dadeebb8-e6a6-45e2-966f-39a40dbedaab',
    plan_name: "Test Plan",
    starts_at: new Date().toISOString(),
    ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
  }]);
  return res.json({ ok: !error, error });
}
