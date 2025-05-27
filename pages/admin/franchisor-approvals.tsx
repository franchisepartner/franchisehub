// pages/admin/franchisor-approvals.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
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
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata.role !== 'Administrator') {
      router.push('/')
    } else {
      fetchApplications()
    }
  }

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('franchisor_applications')
      .select('*')

    if (error) {
      console.error('Error fetching applications:', error)
    } else {
      setApplications(data)
      generateSignedUrls(data)
    }
  }

  const generateSignedUrls = async (apps: Application[]) => {
    const filePaths = apps.flatMap(app => [
      app.logo_url,
      app.ktp_url
    ].filter(Boolean) as string[]) // filter null/undefined

    const { data, error } = await supabase.storage
      .from('franchisor-assets')
      .createSignedUrls(filePaths, 60 * 60)

    if (error) {
      console.error('Signed URL error:', error)
      return
    }

    const urls: Record<string, string> = {}
    data?.forEach(obj => {
      if (obj.path && obj.signedUrl) {
        urls[obj.path] = obj.signedUrl
      }
    })

    setImageUrls(urls)
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
    } else if (status === 'rejected') {
      await supabase
        .from('franchisor_applications')
        .delete()
        .eq('user_id', user_id)
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
              <td className="border px-3 py-2 text-center">
                {imageUrls[app.logo_url] ? (
                  <a href={imageUrls[app.logo_url]} target="_blank" rel="noopener noreferrer">
                    <img src={imageUrls[app.logo_url]} alt="Logo" className="w-10 h-10 object-contain inline-block" />
                  </a>
                ) : 'Memuat...'}
              </td>
              <td className="border px-3 py-2 text-center">
                {imageUrls[app.ktp_url] ? (
                  <a href={imageUrls[app.ktp_url]} target="_blank" rel="noopener noreferrer">
                    <img src={imageUrls[app.ktp_url]} alt="KTP" className="w-10 h-10 object-contain inline-block" />
                  </a>
                ) : 'Memuat...'}
              </td>
              <td className="border px-3 py-2 flex gap-2 justify-center">
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
