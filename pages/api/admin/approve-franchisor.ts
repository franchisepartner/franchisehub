import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end()

  const { user_id, email } = req.body
  if (!user_id || !email) return res.status(400).json({ error: 'Missing user_id or email' })

  // 1. Update role user
  const { error: roleError } = await supabase.auth.admin.updateUserById(user_id, {
    user_metadata: { role: 'franchisor' }
  })

  if (roleError) return res.status(500).json({ error: roleError.message })

  // 2. Update status di table aplikasi
  const { error: statusError } = await supabase
    .from('franchisor_applications')
    .update({ status: 'approved' })
    .eq('user_id', user_id)

  if (statusError) return res.status(500).json({ error: statusError.message })

  return res.status(200).json({ message: 'Approved' })
}
