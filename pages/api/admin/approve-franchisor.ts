import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Pakai variabel environment SESUAI permintaanmu
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,       // tetap gunakan ini sesuai permintaan
  process.env.SUPABASE_SERVICE_ROLE_KEY!       // HARUS tetap pakai service key untuk update
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[API] Approve Franchisor Hit');

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  const { user_id, email } = req.body;

  if (!user_id || !email) {
    return res.status(400).json({
      success: false,
      message: 'Missing user_id or email',
    });
  }

  try {
    // Update role user di tabel profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', user_id);

    if (profileError) {
      console.error('[PROFILE ERROR]', profileError);
      return res.status(500).json({
        success: false,
        message: 'Gagal update role user ke franchisor.',
        error: profileError.message,
      });
    }

    // Update status pengajuan
    const { error: statusError } = await supabase
      .from('franchisor_applications')
      .update({ status: 'approved' })
      .eq('user_id', user_id);

    if (statusError) {
      console.error('[STATUS ERROR]', statusError);
      return res.status(500).json({
        success: false,
        message: 'Gagal update status pengajuan.',
        error: statusError.message,
      });
    }

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
