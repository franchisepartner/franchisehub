// pages/api/admin/approve-franchisor.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Supabase client dengan Service Role Key (hanya untuk server)
const supabase = createClient(
  process.env.SUPABASE_URL!,
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

  // Ambil user_id dan email dari body
  const { user_id, email } = req.body;

  // Validasi input
  if (!user_id || !email) {
    return res.status(400).json({
      success: false,
      message: 'Missing user_id or email',
    });
  }

  try {
    // 1. Update role user di tabel profiles
    const { error: roleError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', user_id);

    if (roleError) {
      console.error('[PROFILE UPDATE ERROR]', roleError);
      return res.status(500).json({
        success: false,
        message: 'Gagal update role user ke franchisor.',
        error: roleError.message,
      });
    }

    // 2. Update status pengajuan di tabel franchisor_applications
    const { error: statusError } = await supabase
      .from('franchisor_applications')
      .update({ status: 'approved' })
      .eq('user_id', user_id);

    if (statusError) {
      console.error('[APPLICATION STATUS UPDATE ERROR]', statusError);
      return res.status(500).json({
        success: false,
        message: 'Gagal update status pengajuan.',
        error: statusError.message,
      });
    }

    // 3. Success response
    return res.status(200).json({
      success: true,
      message: 'Berhasil approve pengajuan franchisor.',
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
