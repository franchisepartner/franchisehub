// pages/admin/franchisor-approvals.tsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

interface Application {
  id: number
  user_id: string
  email: string
  brand_name: string
  description: string
  whatsapp_number: string
  category: string
  location: string
  logo_url: string
  ktp_url: string
  status: string
}

export default function FranchisorApprovals() {
  const [applications, setApplications] = useState<Application[]>([])
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    const { data, error } = await supabase.from('franchisor_applications').select('*')
    if (error) {
      console.error(error)
      return
    }

    setApplications(data || [])

    // Generate signed URLs
    const paths = data
      .map((item) => [item.logo_url, item.ktp_url])
      .flat()
      .filter(Boolean)

    if (paths.length === 0) return

    const { data: signedData, error: signedError } = await supabase.storage
      .from('franchisor-assets')
      .createSignedUrls(paths, 60 * 60)

    if (signedError) {
      console.error(signedError)
      return
    }

    const urlMap: Record<string, string> = {}
    signedData?.forEach((item) => {
      if (item.path) {
        urlMap[item.path] = item.signedUrl
      }
    })

    setImageUrls(urlMap)
  }

  const handleApprove = async (user_id: string, application_id: number) => {
    try {
      const res = await fetch('/api/approve-franchisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, application_id }),
      })

      if (!res.ok) throw new Error('Gagal approve user')
      await fetchApplications()
    } catch (err) {
      console.error(err)
      alert('Gagal approve.')
    }
  }

  const handleReject = async (user_id: string) => {
    await supabase.from('franchisor_applications').delete().eq('user_id', user_id)
    fetchApplications()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Persetujuan Franchisor</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">Email</th>
              <th className="border px-3 py-2">WhatsApp</th>
              <th className="border px-3 py-2">Kategori</th>
              <th className="border px-3 py-2">Lokasi</th>
              <th className="border px-3 py-2">Logo</th>
              <th className="border px-3 py-2">KTP</th>
              <th className="border px-3 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td className="border px-3 py-2">{app.email}</td>
                <td className="border px-3 py-2">{app.whatsapp_number}</td>
                <td className="border px-3 py-2">{app.category}</td>
                <td className="border px-3 py-2">{app.location}</td>
                <td className="border px-3 py-2">
                  {imageUrls[app.logo_url] ? (
                    <img
                      src={imageUrls[app.logo_url]}
                      alt="Logo"
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    'Memuat...'
                  )}
                </td>
                <td className="border px-3 py-2">
                  {imageUrls[app.ktp_url] ? (
                    <img
                      src={imageUrls[app.ktp_url]}
                      alt="KTP"
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    'Memuat...'
                  )}
                </td>
                <td className="border px-3 py-2 space-x-2">
                  <button
                    onClick={() => handleApprove(app.user_id, app.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(app.user_id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
