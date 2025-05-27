import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(
  req: import('next').NextApiRequest,
  res: import('next').NextApiResponse
) {
  if (req.method !== 'POST') return res.status(405).end()

  const { user_id, email } = req.body

  if (!user_id || !email) {
    return res.status(400).json({ message: 'Missing user_id or email' })
  }

  const { error: roleError } = await supabase.auth.admin.updateUserById(user_id, {
    user_metadata: { role: 'Franchisor' }
  })

  if (roleError) {
    console.error('Error updating role:', roleError)
    return res.status(500).json({ message: 'Failed to update user role' })
  }

  const { error: statusError } = await supabase
    .from('franchisor_applications')
    .update({ status: 'approved' })
    .eq('user_id', user_id)

  if (statusError) {
    console.error('Error updating status:', statusError)
    return res.status(500).json({ message: 'Failed to update application status' })
  }

  return res.status(200).json({ message: 'Approved successfully' })
}
