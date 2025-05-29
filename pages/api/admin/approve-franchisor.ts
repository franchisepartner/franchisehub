// pages/api/admin/approve-franchisor.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    // Update role user menjadi franchisor
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', user_id);

    if (profileError) {
      console.error('[PROFILE ERROR]', profileError);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengubah role user ke franchisor.',
        error: profileError.message,
      });
    }

    // Update status pengajuan jadi approved
    const { error: appError } = await supabase
      .from('franchisor_applications')
      .update({ status: 'approved' })
      .eq('user_id', user_id);

    if (appError) {
      console.error('[APPLICATION ERROR]', appError);
      return res.status(500).json({
        success: false,
        message: 'Gagal update status pengajuan.',
        error: appError.message,
      });
    }

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
