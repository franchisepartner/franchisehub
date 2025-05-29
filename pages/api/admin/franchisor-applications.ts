// pages/api/admin/franchisor-applications.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed, gunakan GET' });
  }

  try {
    const { data, error } = await supabase
      .from('franchisor_applications')
      .select('id, user_id, name, email, document, status, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching franchisor applications:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data pengajuan franchisor', error: error.message });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Server error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
}
