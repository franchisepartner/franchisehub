// pages/api/admin/franchisor-applications.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase client dengan Service Role Key untuk akses penuh
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Pastikan hanya metode GET yang diizinkan
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Gunakan metode GET.',
    });
  }

  try {
    // Query untuk mengambil data pengajuan franchisor dengan status 'pending'
    const { data, error } = await supabase
      .from('franchisor_applications')
      .select('id, user_id, name, email, document, status')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[FETCH APPLICATIONS ERROR]', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data pengajuan franchisor.',
        error: error.message,
      });
    }

    // Kirim data pengajuan sebagai JSON
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('[SERVER ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message,
    });
  }
}
