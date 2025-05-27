// pages/api/admin/approve-franchisor.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Pastikan key ini diatur di Vercel!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { user_id, id } = req.body

  try {
    const { error: roleError } = await supabase.auth.admin.updateUserById(user_id, {
      user_metadata: { role: 'Franchisor' },
    })

    if (roleError) return res.status(500).json({ error: roleError.message })

    const { error: updateError } = await supabase
      .from('franchisor_applications')
      .update({ status: 'approved' })
      .eq('id', id)

    if (updateError) return res.status(500).json({ error: updateError.message })

    res.status(200).json({ message: 'Approved' })
  } catch (err) {
    res.status(500).json({ error: 'Unexpected error' })
  }
}
