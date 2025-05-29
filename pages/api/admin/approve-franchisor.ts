// pages/api/admin/approve-franchisor.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    })
  }

  const { user_id }: { user_id?: string } = req.body

  if (!user_id) {
    return res.status(400).json({
      success: false,
      message: 'Missing user_id',
    })
  }

  try {
    console.log('[ADMIN APPROVE] Approving franchisor application for user:', user_id)

    const { error: updateError } = await supabase
      .from('franchisor_applications')
      .update({ status: 'approved' })
      .eq('user_id', user_id)

    if (updateError) {
      console.error('[APPLICATION STATUS UPDATE ERROR]', updateError)
      return res.status(500).json({
        success: false,
        message: 'Gagal update status pengajuan.',
        error: updateError.message,
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Pengajuan telah disetujui. Menunggu pembayaran sebelum ubah role user.',
    })
  } catch (error: any) {
    console.error('[SERVER ERROR]', error)
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message,
    })
  }
}
