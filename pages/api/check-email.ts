import { supabase } from '../../lib/supabaseClient'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.query

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email tidak valid' })
  }

  const { data, error } = await supabase
    .from('franchisor_applications')
    .select('email')
    .eq('email', email)
    .single()

  if (error) return res.status(200).json({ exists: false })

  return res.status(200).json({ exists: !!data })
}
