// pages/api/check-wa.ts
import { supabase } from '@/lib/supabaseClient'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { whatsapp } = req.query

  if (!whatsapp || typeof whatsapp !== 'string') {
    return res.status(400).json({ error: 'Nomor WA tidak valid' })
  }

  const { data, error } = await supabase
    .from('franchisor_applications')
    .select('id')
    .eq('whatsapp_number', whatsapp)

  if (error) return res.status(500).json({ error: error.message })

  const exists = data.length > 0
  res.status(200).json({ exists })
}
