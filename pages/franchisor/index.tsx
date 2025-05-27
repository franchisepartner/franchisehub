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
    whatsapp: '',
    website: '',
    logo_url: '',
    ktp_url: ''
  })

  const [loading, setLoading] = useState(false)

  const uploadFile = async (file: File, type: 'logo' | 'ktp') => {
    const path = `${type}s/${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage
      .from('franchisor-assets')
      .upload(path, file)

    if (error) {
      alert(`Upload ${type} gagal.`)
      return ''
    }

    const { data: urlData } = supabase.storage
      .from('franchisor-assets')
      .getPublicUrl(path)
    return urlData?.publicUrl || ''
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'ktp') => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadFile(file, type)
    if (!url) return

    setFormData(prev => ({
      ...prev,
      [type === 'logo' ? 'logo_url' : 'ktp_url']: url
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const missingField = Object.entries(formData).find(([_, value]) => !value.trim())
    if (missingField) {
      alert(`Field '${missingField[0]}' tidak boleh kosong.`)
      return
    }

    setLoading(true)
    const { error } = await supabase
      .from('franchisor_applications')
      .insert([{ ...formData }])

    setLoading(false)

    if (error) {
      alert('Gagal mengirim data.')
    } else {
      alert('Berhasil mengirim pengajuan.')
      router.push('/')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Formulir Pengajuan Jadi Franchisor</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nama Usaha" className="w-full border p-2 rounded"
          value={formData.brand_name} onChange={e => setFormData({ ...formData, brand_name: e.target.value })} />
        <textarea placeholder="Deskripsi Usaha" className="w-full border p-2 rounded"
          value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
        <input type="email" placeholder="Email Aktif / Usaha" className="w-full border p-2 rounded"
          value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
        <input type="text" placeholder="Nomor WhatsApp" className="w-full border p-2 rounded"
          value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} />
        <input type="text" placeholder="Link Website / Sosial Media" className="w-full border p-2 rounded"
          value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} />

        <div>
          <label className="block mb-1">Upload Logo Usaha</label>
          <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'logo')} />
        </div>

        <div>
          <label className="block mb-1">Upload Foto KTP</label>
          <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'ktp')} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
        </button>
      </form>
    </div>
  )
}
