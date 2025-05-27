import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

interface Application {
  id: number
  user_id: string
  brand_name: string
  description: string
  email: string
  whatsapp_number: string
  website: string
  logo_url: string
  ktp_url: string
  category: string
  location: string
  status: string
}

export default function FranchisorApprovals() {
  const [applications, setApplications] = useState<Application[]>([])
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    const { data, error } = await supabase.from('franchisor_applications').select('*')
    if (error) {
      console.error('Error fetching applications:', error)
      return
    }

    setApplications(data)

    // Fetch signed URLs
    const urls: { [key: string]: string } = {}
    for (const app of data) {
      if (app.logo_url) {
        const { data: signed } = await supabase.storage
          .from('franchisor-assets')
          .createSignedUrl(app.logo_url, 60 * 10)
        if (signed?.signedUrl) urls[`${app.id}_logo`] = signed.signedUrl
      }
      if (app.ktp_url) {
        const { data: signed } = await supabase.storage
          .from('franchisor-assets')
          .createSignedUrl(app.ktp_url, 60 * 10)
        if (signed?.signedUrl) urls[`${app.id}_ktp`] = signed.signedUrl
      }
    }

    setImageUrls(urls)
  }

  const updateStatus = async (id: number, user_id: string, status: string) => {
    if (status === 'approved') {
      await supabase.auth.admin.updateUserById(user_id, {
        user_metadata: { role: 'Franchisor' }
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
      <table className="min-w-full table-auto border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2">Brand</th>
            <th className="border px-3 py-2">Deskripsi</th>
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
              <td className="border px-3 py-2">{app.brand_name}</td>
              <td className="border px-3 py-2">{app.description}</td>
              <td className="border px-3 py-2">{app.email}</td>
              <td className="border px-3 py-2">{app.whatsapp_number}</td>
              <td className="border px-3 py-2">{app.category}</td>
              <td className="border px-3 py-2">{app.location}</td>
              <td className="border px-3 py-2">
                {imageUrls[`${app.id}_logo`] ? (
                  <a href={imageUrls[`${app.id}_logo`]} target="_blank" rel="noopener noreferrer">
                    <img src={imageUrls[`${app.id}_logo`]} alt="Logo" className="w-12 h-12 object-cover" />
                  </a>
                ) : 'Memuat...'}
              </td>
              <td className="border px-3 py-2">
                {imageUrls[`${app.id}_ktp`] ? (
                  <a href={imageUrls[`${app.id}_ktp`]} target="_blank" rel="noopener noreferrer">
                    <img src={imageUrls[`${app.id}_ktp`]} alt="KTP" className="w-12 h-12 object-cover" />
                  </a>
                ) : 'Memuat...'}
              </td>
              <td className="border px-3 py-2 flex gap-2">
                <button
                  onClick={() => updateStatus(app.id, app.user_id, 'approved')}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(app.id, app.user_id, 'rejected')}
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
  )
}
