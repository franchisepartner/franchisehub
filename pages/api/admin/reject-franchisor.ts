// pages/api/admin/reject-franchisor.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase dengan Service Role Key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Izinkan hanya metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { user_id } = req.body;

  // Validasi input
  if (!user_id) {
    return res.status(400).json({ success: false, message: 'Missing user_id' });
  }

  try {
    // Update status menjadi 'rejected'
    const { data, error } = await supabase
      .from('franchisor_applications')
      .update({ status: 'rejected' })
      .eq('user_id', user_id)
      .select(); // Debugging: ambil data hasil update

    if (error) {
      console.error('[REJECT ERROR]', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal reject franchisor.',
        error: error.message,
      });
    }

    if (!data || data.length === 0) {
      console.warn('[NO ROW UPDATED] Mungkin user_id salah atau tidak ditemukan');
      return res.status(404).json({
        success: false,
        message: 'Pengajuan tidak ditemukan atau sudah di-reject.',
      });
    }

    console.log('[REJECT SUCCESS]', data);
    return res.status(200).json({
      success: true,
      message: 'Berhasil reject franchisor.',
      data,
    });
  } catch (err: any) {
    console.error('[SERVER ERROR]', err);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: err.message,
    });
  }
}
