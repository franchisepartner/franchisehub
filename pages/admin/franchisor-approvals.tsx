// pages/admin/franchisor-approvals.tsx

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'
import Image from 'next/image'

interface Application {
  id: string
  user_id: string
  email: string
  brand_name: string
  description: string
  category: string
  location: string
  whatsapp_number: string
  logo_url: string
  ktp_url: string
}

export default function FranchisorApprovals() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const role = user?.user_metadata?.role
      if (role !== 'admin') {
        router.replace('/')
        return
      }
    }

    const fetchData = async () => {
      const { data, error } = await supabase
        .from('franchisor_applications')
        .select('*')
        .eq('status', 'pending')

      if (!error) {
        setApplications(data)
      }
      setLoading(false)
    }

    checkAdmin()
    fetchData()
  }, [router])

  const handleApprove = async (user_id: string, email: string) => {
    const res = await fetch('/api/admin/approve-franchisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, email })
    })
    const result = await res.json()

    if (result.success) {
      alert('Berhasil disetujui!')
      setApplications(applications.filter(a => a.user_id !== user_id))
    } else {
      alert('Gagal approve.')
    }
  }

  const handleReject = async (user_id: string) => {
    const { error } = await supabase
      .from('franchisor_applications')
      .delete()
      .eq('user_id', user_id)

    if (!error) {
      alert('Pengajuan ditolak.')
      setApplications(applications.filter(a => a.user_id !== user_id))
    } else {
      alert('Gagal menolak pengajuan.')
    }
  }

  const renderImage = (path: string) => {
    if (!path) return '❓'
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/franchisor-assets/${path}`
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <Image src={url} alt="preview" width={40} height={40} />
      </a>
    )
  }

  if (loading) return <p>Memuat data...</p>

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Dashboard Administrator: Persetujuan Franchisor</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Brand</th>
            <th className="border p-2">Deskripsi</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">WhatsApp</th>
            <th className="border p-2">Kategori</th>
            <th className="border p-2">Lokasi</th>
            <th className="border p-2">Logo</th>
            <th className="border p-2">KTP</th>
            <th className="border p-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(app => (
            <tr key={app.id}>
              <td className="border p-2">{app.brand_name}</td>
              <td className="border p-2">{app.description}</td>
              <td className="border p-2">{app.email}</td>
              <td className="border p-2">{app.whatsapp_number}</td>
              <td className="border p-2">{app.category}</td>
              <td className="border p-2">{app.location}</td>
              <td className="border p-2 text-center">{renderImage(app.logo_url)}</td>
              <td className="border p-2 text-center">{renderImage(app.ktp_url)}</td>
              <td className="border p-2 flex gap-1 justify-center">
                <button
                  onClick={() => handleApprove(app.user_id, app.email)}
                  className="bg-green-600 text-white px-2 py-1 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(app.user_id)}
                  className="bg-red-600 text-white px-2 py-1 rounded"
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
