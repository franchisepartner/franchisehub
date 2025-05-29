import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Pakai NEXT_PUBLIC_SUPABASE_URL SESUAI request kamu
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Tambahkan validasi agar tidak 500 saat ENV undefined
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Environment variables not found: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[HIT] Approve API');

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
    // Update role
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

    // Update status
    const { error: statusError } = await supabase
      .from('franchisor_applications')
      .update({ status: 'approved' })
      .eq('user_id', user_id);

    if (statusError) {
      console.error('[APPLICATION STATUS ERROR]', statusError);
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
