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

  const { user_id, email } = req.body;
  if (!user_id || !email) {
    return res.status(400).json({ success: false, message: 'Missing user_id or email' });
  }

  try {
    // Cek pengajuan ada dan belum rejected
    const { data: existingApplication, error: fetchError } = await supabase
      .from('franchisor_applications')
      .select('id, status')
      .eq('user_id', user_id)
      .single();

    if (fetchError) {
      return res.status(500).json({ success: false, message: 'Gagal mengambil data pengajuan.', error: fetchError.message });
    }
    if (!existingApplication) {
      return res.status(404).json({ success: false, message: 'Pengajuan franchisor tidak ditemukan.' });
    }
    if (existingApplication.status === 'rejected') {
      return res.status(400).json({ success: false, message: 'Pengajuan franchisor sudah ditolak sebelumnya.' });
    }

    // Update status pengajuan jadi rejected
    const { error: updateError } = await supabase
      .from('franchisor_applications')
      .update({ status: 'rejected' })
      .eq('user_id', user_id);
    if (updateError) {
      return res.status(500).json({ success: false, message: 'Gagal update status pengajuan.', error: updateError.message });
    }

    return res.status(200).json({ success: true, message: 'Pengajuan franchisor berhasil ditolak.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
  }
}
