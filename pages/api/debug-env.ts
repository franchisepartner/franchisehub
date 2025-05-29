import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET';
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'NOT SET';

    if (SUPABASE_URL === 'NOT SET' || SUPABASE_SERVICE_ROLE_KEY === 'NOT SET') {
      return res.status(500).json({
        success: false,
        message: 'Environment variable missing',
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY_PRESENT: SUPABASE_SERVICE_ROLE_KEY !== 'NOT SET'
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Tes koneksi ke Supabase
    const { data, error } = await supabase.from('profiles').select('*').limit(1);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Supabase client failed',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Supabase client working',
      sample_user: data
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Unhandled exception',
      error: err.message
    });
  }
}
