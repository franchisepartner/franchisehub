import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query
  if (!path || typeof path !== 'string') {
    return res.status(400).json({ error: 'Path is required' })
  }

  const { data, error } = await supabase.storage
    .from('franchisor-assets')
    .createSignedUrl(path, 60 * 5) // URL berlaku selama 5 menit

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ url: data?.signedUrl })
}
