import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// Inisialisasi Supabase dengan Service Role Key (jangan bocorkan key ini ke client-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { user_id, email } = req.body

  if (!user_id || !email) {
    return res.status(400).json({ success: false, message: 'Missing user_id or email' })
  }

  try {
    // Update metadata user menjadi franchisor
    const { error: roleError } = await supabase.auth.admin.updateUserById(user_id, {
      user_metadata: { role: 'franchisor' }
    })

    if (roleError) {
      return res.status(500).json({ success: false, message: 'Gagal update role', error: roleError.message })
    }

    // Update status pengajuan di tabel franchisor_applications menjadi approved
    const { error: updateError } = await supabase
      .from('franchisor_applications')
      .update({ status: 'approved' })
      .eq('user_id', user_id)

    if (updateError) {
      return res.status(500).json({ success: false, message: 'Gagal update status pengajuan', error: updateError.message })
    }

    return res.status(200).json({ success: true })
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message })
  }
}
