// pages/franchisor/index.tsx
import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function FranchisorForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    brand_name: '',
    description: '',
    email: '',
    whatsapp_number: '',
    website: '',
    category: '',
    location: '',
    logo_url: '',
    ktp_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const uploadFile = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}-${Date.now()}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const { error } = await supabase.storage
      .from('franchisor-assets')
      .upload(filePath, file)

    if (error) {
      console.error('Upload error:', error.message)
      return null
    }

    const { data } = supabase.storage
      .from('franchisor-assets')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'ktp'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadFile(file, type)
    if (!url) return

    if (type === 'logo') {
      setFormData(prev => ({ ...prev, logo_url: url || '' }))
    } else {
      setFormData(prev => ({ ...prev, ktp_url: url || '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { brand_name, description, email, whatsapp_number, website, category, location, logo_url, ktp_url } = formData

    if (!brand_name || !description || !email || !whatsapp_number || !website || !category || !location || !logo_url || !ktp_url) {
      setMessage('Semua kolom wajib diisi.')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('franchisor_applications').insert([
      {
        user_id: user?.id,
        email,
        brand_name,
        description,
        category,
        location,
        website,
        whatsapp_number,
        logo_url,
        ktp_url
      }
    ])

    if (error) {
      console.error(error)
      setMessage('Gagal mengirim data.')
    } else {
      setMessage('Pengajuan berhasil dikirim!')
      setFormData({
        brand_name: '',
        description: '',
        email: '',
        whatsapp_number: '',
        website: '',
        category: '',
        location: '',
        logo_url: '',
        ktp_url: ''
      })
    }

    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Form Pengajuan Jadi Franchisor</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder="Nama Brand" className="border p-2" value={formData.brand_name} onChange={e => setFormData({ ...formData, brand_name: e.target.value })} />
          <input placeholder="Deskripsi Usaha" className="border p-2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          <input placeholder="Email Aktif" className="border p-2" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          <input placeholder="Nomor WhatsApp Aktif" className="border p-2" value={formData.whatsapp_number} onChange={e => setFormData({ ...formData, whatsapp_number: e.target.value })} />
          <input placeholder="Link Website / Sosial Media" className="border p-2" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} />
          <input placeholder="Kategori Usaha" className="border p-2" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
          <input placeholder="Lokasi Usaha" className="border p-2" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Upload Logo Usaha</label>
          <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'logo')} className="block w-full" />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Upload Foto KTP</label>
          <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'ktp')} className="block w-full" />
        </div>

        {message && <p className="text-sm text-center text-red-500">{message}</p>}

        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
        </button>
      </form>
    </div>
  )
}
