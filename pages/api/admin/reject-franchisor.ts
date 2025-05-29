// pages/api/admin/reject-franchisor.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Pastikan hanya POST yang diterima
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'ID pengajuan tidak ditemukan.' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Update status menjadi 'rejected'
    const { data, error } = await supabase
      .from('franchisors')        // sesuaikan nama tabel Anda
      .update({ status: 'rejected' })
      .eq('id', id)
      .single();
    if (error) throw error;

    res.status(200).json({ message: 'Pengajuan franchisor telah ditolak.' });
  } catch (error: any) {
    console.error('Error rejecting application:', error);
    res.status(500).json({ error: 'Gagal menolak pengajuan franchisor.' });
  }
}
