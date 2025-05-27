// pages/franchisor/index.tsx

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function FranchisorForm() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    brand_name: '',
    description: '',
    email: '',
    whatsapp_number: '',
    website: '',
    category: '',
    location: '',
    logo_url: '',
    ktp_url: '',
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
  }, [])

  useEffect(() => {
    const checkExistingSubmission = async () => {
      if (!session?.user?.id) return
      const { data } = await supabase
        .from('franchisor_applications')
        .select('id')
        .eq('user_id', session.user.id)
        .single()
      if (data) setSubmitted(true)
    }
    checkExistingSubmission()
  }, [session])

  const uploadFile = async (file: File, type: 'logo' | 'ktp') => {
    const ext = file.name.split('.').pop()
    const path = `${type}s/${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('franchisor-assets')
      .upload(path, file)

    if (error) {
      alert(`Upload ${type} gagal: ${error.message}`)
      return null
    }

    const { data } = supabase.storage
      .from('franchisor-assets')
      .getPublicUrl(path)

    return data.publicUrl
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = async (e: any, type: 'logo' | 'ktp') => {
    const file = e.target.files[0]
    if (!file) return
    const url = await uploadFile(file, type)
    if (!url) return
    setFormData(prev => ({
      ...prev,
      ...(type === 'logo' ? { logo_url: url } : { ktp_url: url }),
    }))
  }

  const handleSubmit = async () => {
    const {
      brand_name,
      description,
      email,
      whatsapp_number,
      website,
      category,
      location,
      logo_url,
      ktp_url,
    } = formData

    if (
      !brand_name ||
      !description ||
      !email ||
      !whatsapp_number ||
      !website ||
      !category ||
      !location ||
      !logo_url ||
      !ktp_url
    ) {
      alert('Semua kolom wajib diisi.')
      return
    }

    const { error } = await supabase.from('franchisor_applications').insert({
      user_id: session?.user?.id,
      brand_name,
      description,
      email,
      whatsapp_number,
      website,
      category,
      location,
      logo_url,
      ktp_url,
      submitted_at: new Date(),
    })

    if (error) {
      alert(`Gagal mengirim data: ${error.message}`)
    } else {
      alert('Pengajuan berhasil dikirim. Mohon tunggu pemeriksaan admin.')
      setSubmitted(true)
    }
  }

  if (!session) return null

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Form Pengajuan Jadi Franchisor</h1>

      {submitted ? (
        <p className="text-blue-600 font-medium">
          Pengajuan Anda sedang diperiksa oleh Administrator.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="brand_name" placeholder="Nama Brand" value={formData.brand_name} onChange={handleChange} className="border p-2" />
          <input type="text" name="description" placeholder="Deskripsi Usaha" value={formData.description} onChange={handleChange} className="border p-2" />
          <input type="email" name="email" placeholder="Email Aktif" value={formData.email} onChange={handleChange} className="border p-2" />
          <input type="text" name="whatsapp_number" placeholder="Nomor WhatsApp" value={formData.whatsapp_number} onChange={handleChange} className="border p-2" />
          <input type="text" name="website" placeholder="Link Website/Sosial Media" value={formData.website} onChange={handleChange} className="border p-2" />
          <input type="text" name="category" placeholder="Kategori Usaha" value={formData.category} onChange={handleChange} className="border p-2" />
          <input type="text" name="location" placeholder="Lokasi Usaha" value={formData.location} onChange={handleChange} className="border p-2" />

          <div className="col-span-2">
            <label className="block mb-1">Upload Logo Usaha</label>
            <input type="file" onChange={(e) => handleFileChange(e, 'logo')} />
          </div>

          <div className="col-span-2">
            <label className="block mb-1">Upload Foto KTP</label>
            <input type="file" onChange={(e) => handleFileChange(e, 'ktp')} />
          </div>

          <div className="col-span-2">
            <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Kirim Pengajuan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
