import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Validasi environment
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  const { user_id, email }: { user_id?: string; email?: string } = req.body;

  if (!user_id || !email) {
    console.error('[ERROR] Missing user_id or email');
    return res.status(400).json({
      success: false,
      message: 'Missing user_id or email',
    });
  }

  try {
    console.log('[START APPROVAL]', { user_id, email });

    // Debug cek apakah user_id ada di tabel profiles
    const { data: existingProfile, error: checkProfileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user_id)
      .single();

    if (checkProfileError || !existingProfile) {
      console.error('[ERROR] Profile not found or fetch failed:', checkProfileError);
      return res.status(404).json({
        success: false,
        message: 'Profile user tidak ditemukan.',
        error: checkProfileError?.message,
      });
    }

    // Update role user menjadi 'franchisor'
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'franchisor' }) // ✅ Gunakan kolom 'role' (bukan 'is_admin')
      .eq('id', user_id);

    if (profileError) {
      console.error('[PROFILE UPDATE ERROR]', profileError);
      return res.status(500).json({
        success: false,
        message: 'Gagal update role user ke franchisor.',
        error: profileError.message,
      });
    }

    // Update status pengajuan menjadi 'approved'
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

    console.log('[APPROVAL SUCCESS]', { user_id });

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
