import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

interface Application {
  id: number
  user_id: string
  brand_name: string
  description: string
  email: string
  whatsapp: string
  website: string
  logo_url: string
  ktp_url: string
  category: string
  location: string
  status: string
}

export default function FranchisorApprovals() {
  const [applications, setApplications] = useState<Application[]>([])
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('franchisor_applications')
      .select('*')

    if (error) {
      console.error('Error fetching applications:', error)
      return
    }

    setApplications(data || [])

    // Fetch signed URLs
    const urlMap: Record<string, string> = {}
    for (const app of data || []) {
      if (app.logo_url) {
        const logoRes = await supabase.storage
          .from('franchisor-assets')
          .createSignedUrl(app.logo_url, 60 * 60)
        if (logoRes.data?.signedUrl) {
          urlMap[`${app.id}-logo`] = logoRes.data.signedUrl
        }
      }

      if (app.ktp_url) {
        const ktpRes = await supabase.storage
          .from('franchisor-assets')
          .createSignedUrl(app.ktp_url, 60 * 60)
        if (ktpRes.data?.signedUrl) {
          urlMap[`${app.id}-ktp`] = ktpRes.data.signedUrl
        }
      }
    }

    setSignedUrls(urlMap)
  }

  const updateStatus = async (id: number, user_id: string, status: string) => {
    if (status === 'approved') {
      await supabase.auth.admin.updateUserById(user_id, {
        user_metadata: { role: 'Franchisor' },
      })
      await supabase
        .from('franchisor_applications')
        .update({ status })
        .eq('id', id)
    }

    if (status === 'rejected') {
      await supabase.from('franchisor_applications').delete().eq('user_id', user_id)
    }

    fetchApplications()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Persetujuan Franchisor</h1>
      <table className="min-w-full table-auto border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Brand</th>
            <th className="border px-2 py-1">Deskripsi</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">WhatsApp</th>
            <th className="border px-2 py-1">Kategori</th>
            <th className="border px-2 py-1">Lokasi</th>
            <th className="border px-2 py-1">Logo</th>
            <th className="border px-2 py-1">KTP</th>
            <th className="border px-2 py-1">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td className="border px-2 py-1">{app.brand_name}</td>
              <td className="border px-2 py-1">{app.description}</td>
              <td className="border px-2 py-1">{app.email}</td>
              <td className="border px-2 py-1">{app.whatsapp}</td>
              <td className="border px-2 py-1">{app.category}</td>
              <td className="border px-2 py-1">{app.location}</td>
              <td className="border px-2 py-1">
                {signedUrls[`${app.id}-logo`] ? (
                  <a href={signedUrls[`${app.id}-logo`]} target="_blank" rel="noreferrer">
                    <img src={signedUrls[`${app.id}-logo`]} alt="logo" className="h-12 w-auto" />
                  </a>
                ) : (
                  'Memuat...'
                )}
              </td>
              <td className="border px-2 py-1">
                {signedUrls[`${app.id}-ktp`] ? (
                  <a href={signedUrls[`${app.id}-ktp`]} target="_blank" rel="noreferrer">
                    <img src={signedUrls[`${app.id}-ktp`]} alt="ktp" className="h-12 w-auto" />
                  </a>
                ) : (
                  'Memuat...'
                )}
              </td>
              <td className="border px-2 py-1 space-y-1">
                <button
                  onClick={() => updateStatus(app.id, app.user_id, 'approved')}
                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(app.id, app.user_id, 'rejected')}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
