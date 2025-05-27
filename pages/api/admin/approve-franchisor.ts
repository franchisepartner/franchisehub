import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode tidak diizinkan' });
  }

  const { user_id, application_id } = req.body;

  if (!user_id || !application_id) {
    return res.status(400).json({ error: 'Parameter tidak lengkap' });
  }

  // 1. Ubah role user menjadi 'Franchisor'
  const { error: roleError } = await supabaseAdmin
    .from('user_roles')
    .update({ role: 'Franchisor' })
    .eq('user_id', user_id);

  if (roleError) {
    return res.status(500).json({ error: 'Gagal mengubah role user', detail: roleError.message });
  }

  // 2. Update status pengajuan jadi 'approved'
  const { error: statusError } = await supabaseAdmin
    .from('franchisor_applications')
    .update({ status: 'approved' })
    .eq('id', application_id);

  if (statusError) {
    return res.status(500).json({ error: 'Gagal mengubah status pengajuan', detail: statusError.message });
  }

  return res.status(200).json({ success: true });
}
