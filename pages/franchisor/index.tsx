// pages/franchisor/index.tsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'
import { v4 as uuidv4 } from 'uuid'

export default function FranchisorForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    brand_name: '',
    description: '',
    email: '',
    whatsapp: '',
    website: '',
    logo_url: '',
    ktp_url: '',
    category: '',
    location: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  // Cek apakah user sudah mengirim pengajuan sebelumnya
  useEffect(() => {
    const checkSubmission = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('franchisor_applications')
        .select('status')
        .eq('user_id', user.id)
        .single()

      if (data?.status === 'pending') {
        setHasSubmitted(true)
      }
    }

    checkSubmission()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'ktp') => {
    const file = e.target.files?.[0]
    if (!file) return

    const path = `${type}/${uuidv4()}-${file.name}`
    const { error } = await supabase.storage.from('franchisor-assets').upload(path, file)

    if (error) {
      alert('Gagal upload file.')
      return
    }

    const url = path
    if (type === 'logo') {
      setFormData((prev) => ({ ...prev, logo_url: url }))
    } else {
      setFormData((prev) => ({ ...prev, ktp_url: url }))
    }
  }

  const handleSubmit = async () => {
    if (
      !formData.brand_name ||
      !formData.description ||
      !formData.email ||
      !formData.whatsapp ||
      !formData.website ||
      !formData.logo_url ||
      !formData.ktp_url ||
      !formData.category ||
      !formData.location
    ) {
      alert('Semua kolom wajib diisi.')
      return
    }

    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Anda belum login.')
      setSubmitting(false)
      return
    }

    const { error } = await supabase.from('franchisor_applications').insert({
      user_id: user.id,
      email: formData.email,
      brand_name: formData.brand_name,
      description: formData.description,
      whatsapp: formData.whatsapp,
      website: formData.website,
      logo_url: formData.logo_url,
      ktp_url: formData.ktp_url,
      category: formData.category,
      location: formData.location,
      status: 'pending'
    })

    if (error) {
      alert('Gagal mengirim pengajuan.')
      setSubmitting(false)
    } else {
      alert('Pengajuan berhasil dikirim.')
      setHasSubmitted(true)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Form Pengajuan Jadi Franchisor</h1>

      {hasSubmitted ? (
        <div className="text-center p-4 bg-yellow-100 border border-yellow-400 rounded">
          <p className="text-yellow-800 font-semibold">Sedang Diperiksa Administrator</p>
        </div>
      ) : (
        <>
          <input name="brand_name" value={formData.brand_name} onChange={handleChange} placeholder="Nama Brand" className="w-full border p-2" />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Deskripsi" className="w-full border p-2" />
          <input name="email" value={formData.email} onChange={handleChange} placeholder="Email Aktif" className="w-full border p-2" />
          <input name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="Nomor WhatsApp" className="w-full border p-2" />
          <input name="website" value={formData.website} onChange={handleChange} placeholder="Link Website/Sosial Media" className="w-full border p-2" />
          <input name="category" value={formData.category} onChange={handleChange} placeholder="Kategori Usaha" className="w-full border p-2" />
          <input name="location" value={formData.location} onChange={handleChange} placeholder="Lokasi Usaha" className="w-full border p-2" />

          <div>
            <label>Upload Logo Usaha:</label>
            <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'logo')} />
          </div>

          <div>
            <label>Upload Foto KTP:</label>
            <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'ktp')} />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? 'Sedang Dikirim...' : 'Kirim Pengajuan'}
          </button>
        </>
      )}
    </div>
  )
}
