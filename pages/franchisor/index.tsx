import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/router'

export default function FranchisorForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    brand_name: '',
    description: '',
    category: '',
    location: '',
    website_or_social: '',
    whatsapp: '',
    email: '',
    logo_url: '',
    ktp_url: '',
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [ktpFile, setKtpFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'ktp') => {
    const file = e.target.files?.[0] || null
    if (type === 'logo') setLogoFile(file)
    else setKtpFile(file)
  }

  const uploadFile = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${path}/${fileName}`

    const { error } = await supabase.storage.from('franchisor_assets').upload(filePath, file)
    if (error) throw error

    const { data: urlData } = supabase.storage.from('franchisor_assets').getPublicUrl(filePath)
    return urlData.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) throw new Error('Kamu harus login terlebih dahulu')

      const logo_url = logoFile ? await uploadFile(logoFile, 'logo') : ''
      const ktp_url = ktpFile ? await uploadFile(ktpFile, 'ktp') : ''

      const { error: insertError } = await supabase.from('franchisor_applications').insert({
        user_id: user.id,
        full_name: user.user_metadata.full_name,
        brand_name: formData.brand_name,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        website_or_social: formData.website_or_social,
        whatsapp: formData.whatsapp,
        email: formData.email,
        logo_url,
        ktp_url,
      })

      if (insertError) throw insertError

      alert('Pengajuan berhasil dikirim!')
      router.push('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Formulir Pengajuan Jadi Franchisor</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="brand_name" required placeholder="Nama Brand Franchise" onChange={handleChange} className="input" />
        <textarea name="description" required placeholder="Deskripsi Singkat" onChange={handleChange} className="input" />
        <select name="category" required onChange={handleChange} className="input">
          <option value="">Pilih Kategori Usaha</option>
          <option>F&B</option>
          <option>Ritel</option>
          <option>Jasa</option>
          <option>Lainnya</option>
        </select>
        <input name="location" required placeholder="Lokasi Pusat" onChange={handleChange} className="input" />
        <input name="website_or_social" placeholder="Link Website/Sosial Media" onChange={handleChange} className="input" />
        <input name="whatsapp" required placeholder="Nomor WhatsApp Aktif" onChange={handleChange} className="input" />
        <input name="email" required type="email" placeholder="Email Usaha/Aktif" onChange={handleChange} className="input" />
        
        <div>
          <label>Upload Logo Usaha</label>
          <input type="file" accept="image/*" required onChange={(e) => handleFileChange(e, 'logo')} />
        </div>
        <div>
          <label>Upload Foto KTP</label>
          <input type="file" accept="image/*" required onChange={(e) => handleFileChange(e, 'ktp')} />
        </div>

        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
        </button>
      </form>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
      `}</style>
    </div>
  )
}
