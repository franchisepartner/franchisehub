// pages/franchisor/index.tsx
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient
import { useRouter } from 'next/router'

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
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [ktpFile, setKtpFile] = useState<File | null>(null)

  const handleUpload = async (file: File, type: 'logo' | 'ktp') => {
    const filePath = `${type}s/${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage
      .from('franchisor-assets')
      .upload(filePath, file)

    if (error) {
      alert('Upload gagal: ' + error.message)
      return
    }

    const url = supabase.storage.from('franchisor-assets').getPublicUrl(filePath).data.publicUrl

    setFormData(prev => ({
      ...prev,
      [type === 'logo' ? 'logo_url' : 'ktp_url']: url || ''
    }))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    const requiredFields = ['brand_name', 'description', 'email', 'whatsapp', 'website', 'logo_url', 'ktp_url']
    const hasEmpty = requiredFields.some(field => !formData[field as keyof typeof formData])

    if (hasEmpty) {
      alert('Semua kolom wajib diisi.')
      return
    }

    const { error } = await supabase.from('franchisor_applications').insert([formData])
    if (error) {
      alert('Gagal mengirim data: ' + error.message)
    } else {
      alert('Pengajuan berhasil dikirim!')
      router.push('/')
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6">Form Pengajuan Jadi Franchisor</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nama Brand" value={formData.brand_name} onChange={e => setFormData({ ...formData, brand_name: e.target.value })} className="input" />
        <textarea placeholder="Deskripsi Usaha" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="input" />
        <input type="email" placeholder="Email Aktif" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="input" />
        <input type="text" placeholder="Nomor WhatsApp" value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} className="input" />
        <input type="text" placeholder="Link Website/Sosial Media" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} className="input" />

        <div>
          <label className="block mb-1 font-medium">Upload Logo Usaha</label>
          <input type="file" onChange={e => { const file = e.target.files?.[0]; setLogoFile(file || null); if (file) handleUpload(file, 'logo') }} />
        </div>

        <div>
          <label className="block mb-1 font-medium">Upload Foto KTP</label>
          <input type="file" onChange={e => { const file = e.target.files?.[0]; setKtpFile(file || null); if (file) handleUpload(file, 'ktp') }} />
        </div>

        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">Kirim Pengajuan</button>
      </form>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 0.375rem;
        }
      `}</style>
    </div>
  )
}
