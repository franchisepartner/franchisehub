import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../../../lib/supabaseClient'

export default function EditListing() {
  const router = useRouter()
  const { id } = router.query

  const [formData, setFormData] = useState<any>({
    franchise_name: '',
    description: '',
    category: '',
    investment_min: 0,
    location: '',
    logo_url: '',
    operation_mode: 'Autopilot',
    dokumen_hukum_sudah_punya: false,
    dokumen_hukum_akan_diurus: false,
    whatsapp_contact: '',
    email_contact: '',
    website_url: '',
    google_maps_url: '',
    notes: '',
    tags: '',
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchListing()
    }
  }, [id])

  const fetchListing = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('franchise_listings')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      alert('Error mengambil data listing')
      console.error(error)
    } else {
      setFormData(data)
    }

    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type, value, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const { error } = await supabase
      .from('franchise_listings')
      .update(formData)
      .eq('id', id)

    if (error) {
      alert('Error menyimpan perubahan')
      console.error(error)
    } else {
      alert('Berhasil menyimpan perubahan')
      router.push('/franchisor/manage-listings')
    }
  }

  if (loading) {
    return <div className="p-6">Memuat data listing...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Edit Listing Franchise</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="franchise_name"
          placeholder="Nama Franchise"
          value={formData.franchise_name}
          required
          className="border p-2 w-full"
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Deskripsi"
          value={formData.description}
          required
          className="border p-2 w-full h-24"
          onChange={handleChange}
        />
        <input
          name="category"
          placeholder="Kategori"
          value={formData.category}
          required
          className="border p-2 w-full"
          onChange={handleChange}
        />
        <input
          name="investment_min"
          type="number"
          placeholder="Investasi Minimal (Rp.)"
          value={formData.investment_min}
          required
          className="border p-2 w-full"
          onChange={handleChange}
        />
        <input
          name="location"
          placeholder="Lokasi"
          value={formData.location}
          required
          className="border p-2 w-full"
          onChange={handleChange}
        />
        <input
          name="logo_url"
          placeholder="URL Logo"
          value={formData.logo_url}
          className="border p-2 w-full"
          onChange={handleChange}
        />
        <select
          name="operation_mode"
          value={formData.operation_mode}
          className="border p-2 w-full"
          onChange={handleChange}
        >
          <option value="Autopilot">Autopilot</option>
          <option value="Semi Autopilot">Semi Autopilot</option>
        </select>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="dokumen_hukum_sudah_punya"
            checked={formData.dokumen_hukum_sudah_punya}
            onChange={handleChange}
          />
          Sudah Punya Dokumen Hukum
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="dokumen_hukum_akan_diurus"
            checked={formData.dokumen_hukum_akan_diurus}
            onChange={handleChange}
          />
          Akan/Sedang Diurus Dokumen Hukum
        </label>
        <input
          name="whatsapp_contact"
          placeholder="Nomor WhatsApp"
          value={formData.whatsapp_contact}
          className="border p-2 w-full"
          onChange={handleChange}
        />
        <input
          name="email_contact"
          type="email"
          placeholder="Email Kontak"
          value={formData.email_contact}
          className="border p-2 w-full"
          onChange={handleChange}
        />
        <input
          name="website_url"
          placeholder="Website"
          value={formData.website_url}
          className="border p-2 w-full"
          onChange={handleChange}
        />
        <input
          name="google_maps_url"
          placeholder="Link Google Maps"
          value={formData.google_maps_url}
          className="border p-2 w-full"
          onChange={handleChange}
        />
        <textarea
          name="notes"
          placeholder="Catatan Tambahan"
          value={formData.notes}
          className="border p-2 w-full h-20"
          onChange={handleChange}
        />
        <input
          name="tags"
          placeholder="Tags (pisahkan dengan koma)"
          value={formData.tags}
          className="border p-2 w-full"
          onChange={handleChange}
        />
        <button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white rounded"
        >
          💾 Simpan Perubahan
        </button>
      </form>
    </div>
  )
}
