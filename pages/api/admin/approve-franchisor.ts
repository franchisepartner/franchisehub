// pages/api/admin/approve-franchisor.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { user_id, email } = req.body

  try {
    // Update role di table auth.users (via Supabase Admin)
    const { error: roleError } = await supabase.auth.admin.updateUserById(user_id, {
      user_metadata: { role: 'Franchisor' }
    })

    if (roleError) throw roleError

    // Update status di franchisor_applications
    const { error: updateError } = await supabase
      .from('franchisor_applications')
      .update({ status: 'approved' })
      .eq('user_id', user_id)

    if (updateError) throw updateError

    res.status(200).json({ message: 'Approved' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Approval failed' })
  }
}
