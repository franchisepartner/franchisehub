import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export default function NewListing() {
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    franchise_name: '',
    description: '',
    price: '',
    location: '',
    mode_operation: '',
    autopilot_details: '',
    documents: [],
    legal_status: '',
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setCoverFile(e.target.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!coverFile) {
      alert('Silakan upload gambar cover terlebih dahulu!')
      return
    }

    const coverPath = `covers/${uuidv4()}_${coverFile.name}`

    const { error: coverError } = await supabase.storage
      .from('franchises-assets')
      .upload(coverPath, coverFile)

    if (coverError) {
      alert(`Upload cover gagal: ${coverError.message}`)
      return
    }

    const { error } = await supabase.from('franchises').insert({
      ...formData,
      cover_url: coverPath,
    })

    if (error) {
      alert(`Gagal menyimpan data: ${error.message}`)
    } else {
      alert('Listing franchise berhasil dibuat!')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Tambah Listing Franchise Baru</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="franchise_name"
          placeholder="Nama Franchise"
          className="border p-2 w-full mb-2"
          required
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Deskripsi Franchise"
          className="border p-2 w-full mb-2"
          required
          onChange={handleChange}
        />
        <input
          type="number"
          name="price"
          placeholder="Harga Minimal Investasi"
          className="border p-2 w-full mb-2"
          required
          onChange={handleChange}
        />
        <input
          type="text"
          name="location"
          placeholder="Lokasi"
          className="border p-2 w-full mb-2"
          required
          onChange={handleChange}
        />

        <select name="mode_operation" className="border p-2 w-full mb-2" required onChange={handleChange}>
          <option value="">Pilih Mode Operasi</option>
          <option value="Autopilot">Autopilot</option>
          <option value="Semi Autopilot">Semi Autopilot</option>
        </select>

        <textarea
          name="autopilot_details"
          placeholder="Detail Mode Operasi"
          className="border p-2 w-full mb-2"
          required
          onChange={handleChange}
        />

        <div className="mb-2">
          <label className="block font-semibold">Checklist Dokumen Hukum</label>
          <div>
            <input type="checkbox" name="documents" value="Surat Izin Usaha" onChange={handleChange} /> Surat Izin Usaha
          </div>
          <div>
            <input type="checkbox" name="documents" value="SIUP" onChange={handleChange} /> SIUP
          </div>
          <div>
            <input type="checkbox" name="documents" value="Tanda Daftar Perusahaan" onChange={handleChange} /> TDP
          </div>
          <div>
            <input type="checkbox" name="documents" value="NPWP" onChange={handleChange} /> NPWP
          </div>
        </div>

        <div className="mb-2">
          <label className="block font-semibold">Status Legal</label>
          <select name="legal_status" className="border p-2 w-full" required onChange={handleChange}>
            <option value="">Pilih Status Legal</option>
            <option value="Sudah Punya">Sudah Punya</option>
            <option value="Sedang Diurus">Sedang Diurus</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-semibold">Upload Cover Franchise</label>
          <input type="file" onChange={handleFileChange} required />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Tambah Franchise
        </button>
      </form>
    </div>
  )
}
