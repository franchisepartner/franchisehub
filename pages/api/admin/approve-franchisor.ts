import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase dengan Service Role Key (untuk izin penuh)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  const { user_id, email }: { user_id?: string; email?: string } = req.body;
  // Verifikasi input yang diperlukan
  if (!user_id || !email) {
    return res.status(400).json({
      success: false,
      message: 'Missing user_id or email',
    });
  }

  try {
    // 1. Update role user di tabel profiles menjadi franchisor (is_admin = true)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', user_id);
    if (profileError) {
      console.error('[PROFILE UPDATE ERROR]', profileError);
      return res.status(500).json({
        success: false,
        message: 'Gagal update role user ke franchisor.',
        error: profileError.message,
      });
    }

    // 2. Update status pengajuan franchisor menjadi 'approved'
    const { error: updateError } = await supabase
      .from('franchisor_applications')
      .update({ status: 'approved' })
      .eq('user_id', user_id);
    if (updateError) {
      console.error('[APPLICATION STATUS UPDATE ERROR]', updateError);
      return res.status(500).json({
        success: false,
        message: 'Gagal update status pengajuan.',
        error: updateError.message,
      });
    }

    // 3. Berhasil – kembalikan respons sukses
    return res.status(200).json({
      success: true,
      message: 'Berhasil menyetujui franchisor dan mengubah role user.',
    });
  } catch (error: any) {
    console.error('[SERVER ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message,
    });
  }
}
