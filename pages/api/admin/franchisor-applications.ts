// pages/api/admin/franchisor-applications.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Pastikan hanya GET yang diterima
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  // Inisialisasi Supabase dengan service role key (server-side)
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Ambil data franchisor dengan status 'pending'
    const { data, error } = await supabase
      .from('franchisors')        // sesuaikan nama tabel Anda
      .select('*')
      .eq('status', 'pending');
    if (error) throw error;

    // Kirim hasil data (array) ke klien
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Gagal mengambil data pengajuan franchisor.' });
  }
}
