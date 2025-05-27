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
    whatsapp_number: '',
    website: '',
    logo_url: '',
    ktp_url: '',
    category: '',
    location: ''
  })
  const [loading, setLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  useEffect(() => {
    const checkSubmission = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from('franchisor_applications')
        .select('status')
        .eq('user_id', user.id)
        .single()
      if (data && data.status === 'pending') {
        setHasSubmitted(true)
      }
    }
    checkSubmission()
  }, [])

  const uploadFile = async (file: File, type: 'logo' | 'ktp') => {
    const fileExt = file.name.split('.').pop()
    const path = `${type}s/${uuidv4()}.${fileExt}`
    const { error } = await supabase.storage.from('franchisor-assets').upload(path, file)
    if (error) {
      alert('Gagal mengunggah file.')
      return null
    }
    return path
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const {
      brand_name,
      description,
      email,
      whatsapp_number,
      website,
      logo_url,
      ktp_url,
      category,
      location
    } = formData

    if (
      !brand_name ||
      !description ||
      !email ||
      !whatsapp_number ||
      !website ||
      !logo_url ||
      !ktp_url ||
      !category ||
      !location
    ) {
      alert('Semua kolom wajib diisi.')
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('franchisor_applications').insert({
      user_id: user.id,
      email,
      brand_name,
      description,
      category,
      location,
      website,
      whatsapp_number,
      logo_url,
      ktp_url,
      status: 'pending',
      submitted_at: new Date().toISOString()
    })

    setLoading(false)

    if (error) {
      alert('Gagal mengirim pengajuan.')
    } else {
      setHasSubmitted(true)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'ktp') => {
    const file = e.target.files?.[0]
    if (!file) return
    const path = await uploadFile(file, type)
    if (!path) return
    setFormData(prev => ({
      ...prev,
      [`${type}_url`]: path
    }))
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Form Pengajuan Jadi Franchisor</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nama Brand"
            className="p-2 border rounded"
            value={formData.brand_name}
            onChange={e => setFormData({ ...formData, brand_name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Deskripsi Usaha"
            className="p-2 border rounded"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="email"
            placeholder="Email Aktif"
            className="p-2 border rounded"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Nomor WhatsApp"
            className="p-2 border rounded"
            value={formData.whatsapp_number}
            onChange={e => setFormData({ ...formData, whatsapp_number: e.target.value })}
          />
        </div>
        <input
          type="text"
          placeholder="Link Website/Sosial Media"
          className="w-full p-2 border rounded"
          value={formData.website}
          onChange={e => setFormData({ ...formData, website: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Kategori"
            className="p-2 border rounded"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
          />
          <input
            type="text"
            placeholder="Lokasi"
            className="p-2 border rounded"
            value={formData.location}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Upload Logo Usaha</label>
          <input type="file" onChange={e => handleFileChange(e, 'logo')} />
        </div>
        <div>
          <label className="block font-medium mb-1">Upload Foto KTP</label>
          <input type="file" onChange={e => handleFileChange(e, 'ktp')} />
        </div>
        <button
          type="submit"
          disabled={hasSubmitted || loading}
          className={`w-full py-2 text-white rounded ${
            hasSubmitted ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {hasSubmitted ? 'Sedang Diperiksa Administrator' : 'Kirim Pengajuan'}
        </button>
      </form>
    </div>
  )
}
