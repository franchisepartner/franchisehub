import { supabase } from '../../lib/supabaseClient'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { wa } = req.query

  if (!wa || typeof wa !== 'string') {
    return res.status(400).json({ error: 'Nomor WA tidak valid' })
  }

  const { data, error } = await supabase
    .from('franchisor_applications')
    .select('wa')
    .eq('wa', wa)
    .single()

  if (error) return res.status(200).json({ exists: false })

  return res.status(200).json({ exists: !!data })
}
