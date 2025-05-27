// pages/franchisor/index.tsx

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function FranchisorForm() {
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
  const [error, setError] = useState('')
  const router = useRouter()

  const uploadFile = async (file: File, type: 'logo' | 'ktp') => {
    const filePath = `${type}/${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage
      .from('franchisor_assets')
      .upload(filePath, file)
    if (error) throw error
    const { data: publicUrl } = supabase.storage
      .from('franchisor_assets')
      .getPublicUrl(filePath)
    return publicUrl.publicUrl
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'ktp') => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadFile(file, type)
    setFormData(prev => ({
      ...prev,
      [type === 'logo' ? 'logo_url' : 'ktp_url']: url || ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validasi wajib isi
    const { brand_name, description, email, whatsapp, website, logo_url, ktp_url } = formData
    if (!brand_name || !description || !email || !whatsapp || !website || !logo_url || !ktp_url) {
      setError('Semua kolom wajib diisi.')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await supabase.from('franchisor_applications').insert([
      {
        ...formData
      }
    ])

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      alert('Pengajuan berhasil dikirim!')
      router.push('/')
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-4">Form Pengajuan Jadi Franchisor</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nama Brand" className="input" value={formData.brand_name} onChange={e => setFormData({ ...formData, brand_name: e.target.value })} />
        <textarea placeholder="Deskripsi Usaha" className="input" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
        <input type="email" placeholder="Email Aktif" className="input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
        <input type="text" placeholder="Nomor WhatsApp" className="input" value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} />
        <input type="text" placeholder="Link Website/Sosial Media" className="input" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} />

        <div>
          <label className="block text-sm mb-1">Upload Logo Usaha</label>
          <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'logo')} />
          {formData.logo_url && <p className="text-green-600 text-xs mt-1">Logo berhasil diunggah</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Upload Foto KTP</label>
          <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'ktp')} />
          {formData.ktp_url && <p className="text-green-600 text-xs mt-1">KTP berhasil diunggah</p>}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
        </button>
      </form>
    </div>
  )
}
