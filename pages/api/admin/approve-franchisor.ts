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

  try {
    // Update metadata user jadi Franchisor
    const { error: roleError } = await supabase.auth.admin.updateUserById(user_id, {
      user_metadata: { role: 'Franchisor' }
    })
    if (roleError) throw roleError

    // Update status aplikasi
    const { error: updateError } = await supabase
      .from('franchisor_applications')
      .update({ status: 'approved' })
      .eq('user_id', user_id)

    if (updateError) throw updateError

    return res.status(200).json({ message: 'Approved' })
  } catch (err) {
    console.error('Approval failed:', err)
    return res.status(500).json({ message: 'Approval failed' })
  }
}
