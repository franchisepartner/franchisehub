import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'
import Image from 'next/image'

export default function FranchisorApprovals() {
  const router = useRouter()
  const [applications, setApplications] = useState<any[]>([])
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single()

      if (roleData?.role !== 'Administrator') {
        router.push('/')
        return
      }

      const { data, error } = await supabase
        .from('franchisor_applications')
        .select('*')
        .eq('status', 'pending')

      if (error) {
        console.error(error)
        return
      }

      setApplications(data || [])

      // Generate signed URLs
      const paths = data
        ?.flatMap(app => [app.logo_url, app.ktp_url])
        .filter(Boolean)

      const { data: signedData } = await supabase.storage
        .from('franchisor-assets')
        .createSignedUrls(paths, 60 * 60)

      const urls: Record<string, string> = {}
      signedData?.forEach(obj => {
        if (obj.signedUrl) urls[obj.path] = obj.signedUrl
      })
      setImageUrls(urls)
      setLoading(false)
    }

    fetchData()
  }, [router])

  const handleApprove = async (application: any) => {
    const response = await fetch('/api/admin/approve-franchisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: application.user_id,
        email: application.email,
      }),
    })

    if (response.ok) {
      alert('Berhasil approve.')
      router.reload()
    } else {
      alert('Gagal approve.')
    }
  }

  const handleReject = async (application: any) => {
    const { error } = await supabase
      .from('franchisor_applications')
      .update({ status: 'rejected' })
      .eq('user_id', application.user_id)

    if (!error) {
      alert('Ditolak.')
      router.reload()
    } else {
      alert('Gagal menolak.')
    }
  }

  if (loading) return <div>Memuat...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Persetujuan Franchisor</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Email</th>
              <th className="p-2 border">WhatsApp</th>
              <th className="p-2 border">Kategori</th>
              <th className="p-2 border">Lokasi</th>
              <th className="p-2 border">Logo</th>
              <th className="p-2 border">KTP</th>
              <th className="p-2 border">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td className="p-2 border">{app.email}</td>
                <td className="p-2 border">{app.whatsapp_number}</td>
                <td className="p-2 border">{app.category}</td>
                <td className="p-2 border">{app.location}</td>
                <td className="p-2 border text-center">
                  {imageUrls[app.logo_url] ? (
                    <a href={imageUrls[app.logo_url]} target="_blank" rel="noreferrer">
                      <Image
                        src={imageUrls[app.logo_url]}
                        alt="Logo"
                        width={50}
                        height={50}
                        className="object-cover"
                      />
                    </a>
                  ) : (
                    'Memuat...'
                  )}
                </td>
                <td className="p-2 border text-center">
                  {imageUrls[app.ktp_url] ? (
                    <a href={imageUrls[app.ktp_url]} target="_blank" rel="noreferrer">
                      <Image
                        src={imageUrls[app.ktp_url]}
                        alt="KTP"
                        width={50}
                        height={50}
                        className="object-cover"
                      />
                    </a>
                  ) : (
                    'Memuat...'
                  )}
                </td>
                <td className="p-2 border">
                  <button
                    className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                    onClick={() => handleApprove(app)}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-600 text-white px-2 py-1 rounded"
                    onClick={() => handleReject(app)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  Tidak ada pengajuan saat ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
