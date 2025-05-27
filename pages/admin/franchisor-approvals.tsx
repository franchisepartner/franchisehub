// pages/admin/franchisor-approvals.tsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'

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
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
  const router = useRouter()

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== 'Administrator') {
      router.push('/')
      return
    }

    const { data, error } = await supabase
      .from('franchisor_applications')
      .select('*')

    if (data) {
      setApplications(data)
      generateSignedUrls(data)
    }
    if (error) console.error(error)
  }

  const generateSignedUrls = async (apps: Application[]) => {
    const filePaths = apps.flatMap(app => [
      app.logo_url,
      app.ktp_url
    ].filter(Boolean))

    const { data, error } = await supabase.storage
      .from('franchisor-assets')
      .createSignedUrls(filePaths, 60 * 60)

    if (error) {
      console.error('Signed URL error:', error)
      return
    }

    const urls: Record<string, string> = {}
    data?.forEach(obj => {
      urls[obj.path] = obj.signedUrl
    })

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
    } else if (status === 'rejected') {
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
            {['Brand', 'Deskripsi', 'Email', 'WhatsApp', 'Kategori', 'Lokasi', 'Logo', 'KTP', 'Aksi'].map(h => (
              <th key={h} className="border px-3 py-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {applications.map(app => (
            <tr key={app.id}>
              <td className="border px-3 py-2">{app.brand_name}</td>
              <td className="border px-3 py-2">{app.description}</td>
              <td className="border px-3 py-2">{app.email}</td>
              <td className="border px-3 py-2">{app.whatsapp_number}</td>
              <td className="border px-3 py-2">{app.category}</td>
              <td className="border px-3 py-2">{app.location}</td>
              <td className="border px-3 py-2">
                {imageUrls[app.logo_url] ? (
                  <a href={imageUrls[app.logo_url]} target="_blank" rel="noopener noreferrer">
                    <img src={imageUrls[app.logo_url]} alt="logo" className="h-12" />
                  </a>
                ) : 'Memuat...'}
              </td>
              <td className="border px-3 py-2">
                {imageUrls[app.ktp_url] ? (
                  <a href={imageUrls[app.ktp_url]} target="_blank" rel="noopener noreferrer">
                    <img src={imageUrls[app.ktp_url]} alt="ktp" className="h-12" />
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
