// pages/api/admin/approve-franchisor.ts

import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { user_id, email } = req.body

  if (!user_id || !email) {
    return res.status(400).json({ error: 'user_id and email are required' })
  }

  // Update role ke "franchisor"
  const { error: roleError } = await supabase.auth.admin.updateUserById(user_id, {
    user_metadata: { role: 'franchisor' }
  })

  if (roleError) {
    console.error('Role update error:', roleError.message)
    return res.status(500).json({ error: 'Gagal mengubah role user' })
  }

  // Update status pengajuan
  const { error: statusError } = await supabase
    .from('franchisor_applications')
    .update({ status: 'approved' })
    .eq('user_id', user_id)

  if (statusError) {
    console.error('Status update error:', statusError.message)
    return res.status(500).json({ error: 'Gagal mengubah status pengajuan' })
  }

  return res.status(200).json({ message: 'Berhasil approve' })
}
