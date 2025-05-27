// pages/franchisor/index.tsx
import { useEffect, useState } from 'react'
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
    ktp_url: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const id = data.user?.id || null
      setUserId(id)
      if (id) {
        checkIfSubmitted(id)
      }
    })
  }, [])

  const checkIfSubmitted = async (uid: string) => {
    const { data } = await supabase
      .from('franchisor_applications')
      .select('id')
      .eq('user_id', uid)
      .maybeSingle()
    if (data) setHasSubmitted(true)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const uploadFile = async (file: File, folder: 'logo' | 'ktp') => {
    const filename = `${folder}-${Date.now()}-${file.name}`
    const { error } = await supabase.storage
      .from('franchisor-assets')
      .upload(`${folder}/${filename}`, file)
    if (error) throw error

    const { data } = supabase.storage
      .from('franchisor-assets')
      .getPublicUrl(`${folder}/${filename}`)
    return data.publicUrl
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'ktp') => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = await uploadFile(file, type)
    setFormData((prev) => ({
      ...prev,
      [`${type}_url`]: url,
    }))
  }

  const handleSubmit = async () => {
    const { brand_name, description, email, whatsapp, website, logo_url, ktp_url } = formData
    if (!brand_name || !description || !email || !whatsapp || !website || !logo_url || !ktp_url) {
      alert('Harap lengkapi semua kolom terlebih dahulu.')
      return
    }

    setIsSubmitting(true)
    const { error } = await supabase.from('franchisor_applications').insert({
      user_id: userId,
      email,
      brand_name,
      description,
      website,
      whatsapp_number: whatsapp,
      logo_url,
      ktp_url,
      submitted_at: new Date().toISOString(),
    })

    setIsSubmitting(false)
    if (error) {
      alert(`Gagal mengirim data: ${error.message}`)
    } else {
      setHasSubmitted(true)
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded-lg bg-white shadow">
      <h1 className="text-2xl font-bold mb-6">Form Pengajuan Jadi Franchisor</h1>

      <div className="grid grid-cols-2 gap-4">
        <input
          name="brand_name"
          placeholder="Nama Brand"
          value={formData.brand_name}
          onChange={handleInput}
          className="border p-2 rounded col-span-1"
        />
        <textarea
          name="description"
          placeholder="Deskripsi Usaha"
          value={formData.description}
          onChange={handleInput}
          className="border p-2 rounded col-span-1"
        />
        <input
          name="email"
          placeholder="Email Aktif"
          value={formData.email}
          onChange={handleInput}
          className="border p-2 rounded col-span-1"
        />
        <input
          name="whatsapp"
          placeholder="Nomor WhatsApp"
          value={formData.whatsapp}
          onChange={handleInput}
          className="border p-2 rounded col-span-1"
        />
        <input
          name="website"
          placeholder="Link Website/Sosial Media"
          value={formData.website}
          onChange={handleInput}
          className="border p-2 rounded col-span-2"
        />
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Upload Logo Usaha</label>
          <input type="file" onChange={(e) => handleFileUpload(e, 'logo')} />
        </div>
        <div>
          <label className="block text-sm font-medium">Upload Foto KTP</label>
          <input type="file" onChange={(e) => handleFileUpload(e, 'ktp')} />
        </div>
      </div>

      <button
        disabled={isSubmitting || hasSubmitted}
        onClick={handleSubmit}
        className={`mt-6 w-full py-2 rounded text-white font-semibold transition ${
          hasSubmitted
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {hasSubmitted ? 'Sedang Diperiksa Administrator' : 'Kirim Pengajuan'}
      </button>
    </div>
  )
}
