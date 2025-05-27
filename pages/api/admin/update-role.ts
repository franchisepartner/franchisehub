// pages/api/admin/update-role.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode tidak diizinkan' })
  }

  const { email, full_name, role } = req.body

  if (!email || !role) {
    return res.status(400).json({ error: 'Email dan role wajib diisi' })
  }

  const { data, error } = await supabaseAdmin.auth.admin.updateUserByEmail(email, {
    user_metadata: {
      full_name,
      role
    }
  })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json({ message: 'Role berhasil diperbarui', data })
}
