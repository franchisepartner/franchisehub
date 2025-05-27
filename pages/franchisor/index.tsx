import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function FranchisorForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    brand_name: '',
    short_description: '',
    category: '',
    headquarters_location: '',
    website_or_social: '',
    whatsapp_number: '',
    business_email: '',
    logo_url: '',
    ktp_url: ''
  })
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (data?.user?.id) setUserId(data.user.id)
    }
    fetchUser()
  }, [])

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!userId) return setError('User tidak ditemukan.')

    const { error: insertError } = await supabase.from('franchisor_applications').insert({
      user_id: userId,
      ...formData
    })

    if (insertError) {
      setError(insertError.message)
      setSuccess(false)
    } else {
      setError(null)
      setSuccess(true)
      router.push('/')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Formulir Pengajuan Jadi Franchisor</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">Pengajuan berhasil dikirim!</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="brand_name" onChange={handleChange} placeholder="Nama Brand Franchise" required className="input" />
        <textarea name="short_description" onChange={handleChange} placeholder="Deskripsi Singkat" required className="input" />
        <input name="category" onChange={handleChange} placeholder="Kategori Usaha" required className="input" />
        <input name="headquarters_location" onChange={handleChange} placeholder="Lokasi Pusat" required className="input" />
        <input name="website_or_social" onChange={handleChange} placeholder="Link Website/Sosial Media" required className="input" />
        <input name="whatsapp_number" onChange={handleChange} placeholder="Nomor WhatsApp Aktif" required className="input" />
        <input name="business_email" onChange={handleChange} placeholder="Email Usaha/Aktif" required className="input" />
        <input name="logo_url" onChange={handleChange} placeholder="Link Gambar Logo Usaha" required className="input" />
        <input name="ktp_url" onChange={handleChange} placeholder="Link Foto KTP" required className="input" />

        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Kirim Pengajuan
        </button>
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
