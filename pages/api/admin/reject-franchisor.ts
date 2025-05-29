// pages/api/admin/reject-franchisor.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ success: false, message: 'Missing user_id' });
  }

  try {
    const { error } = await supabase
      .from('franchisor_applications')
      .update({ status: 'rejected' })
      .eq('user_id', user_id);

    if (error) {
      return res.status(500).json({ success: false, message: 'Gagal reject', error: error.message });
    }

    return res.status(200).json({ success: true, message: 'Berhasil reject' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}
