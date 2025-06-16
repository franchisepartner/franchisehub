import { createClient } from '@supabase/supabase-js';
export default async function handler(req, res) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await supabaseAdmin
    .from('auth.users')
    .select('id, email')
    .limit(10);
  res.json({ data, error });
}
