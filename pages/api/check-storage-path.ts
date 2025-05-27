// pages/api/check-storage-path.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data: applications, error } = await supabase
    .from('franchisor_applications')
    .select('id, brand_name, logo_url, ktp_url')

  if (error) {
    return res.status(500).json({ message: 'Error fetching applications', error })
  }

  const checkFileExists = async (path: string | null) => {
    if (!path) return false
    const { data } = await supabase.storage.from('franchisor-assets').list(path.split('/')[0], {
      search: path.split('/').pop(),
    })
    return !!data?.find(file => file.name === path.split('/').pop())
  }

  const results = await Promise.all(
    (applications || []).map(async (app) => {
      const logoExists = await checkFileExists(app.logo_url)
      const ktpExists = await checkFileExists(app.ktp_url)
      return {
        id: app.id,
        brand_name: app.brand_name,
        logo_url: app.logo_url,
        logo_exists: logoExists,
        ktp_url: app.ktp_url,
        ktp_exists: ktpExists,
      }
    })
  )

  return res.status(200).json(results)
}
