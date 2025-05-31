import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../../../lib/supabaseClient'

export default function EditListing() {
  const [formData, setFormData] = useState({
    franchise_name: '',
    description: '',
    category: '',
    location: '',
    minimum_investment: '',
    has_legality: false,
    legality_in_progress: false,
    mode_autopilot: false,
    mode_semi_autopilot: false,
  })

  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      const { data, error } = await supabase
        .from('franchises')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        alert('Error fetching data')
        return
      }

      setFormData(data)
    }

    fetchData()
  }, [id])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, type, value } = e.target

    const isCheckbox = type === 'checkbox'
    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const { error } = await supabase
      .from('franchises')
      .update(formData)
      .eq('id', id)

    if (error) {
      alert('Error updating data')
      return
    }

    router.push('/franchisor/manage-listings')
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Edit Listing Franchise</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="franchise_name"
          placeholder="Nama Franchise"
          required
          className="border p-2 w-full mb-2"
          onChange={handleChange}
          value={formData.franchise_name}
        />

        <textarea
          name="description"
          placeholder="Deskripsi"
          required
          className="border p-2 w-full mb-2"
          onChange={handleChange}
          value={formData.description}
        />

        <input
          name="category"
          placeholder="Kategori"
          required
          className="border p-2 w-full mb-2"
          onChange={handleChange}
          value={formData.category}
        />

        <input
          name="location"
          placeholder="Lokasi"
          required
          className="border p-2 w-full mb-2"
          onChange={handleChange}
          value={formData.location}
        />

        <input
          name="minimum_investment"
          placeholder="Investasi Minimal"
          required
          className="border p-2 w-full mb-2"
          onChange={handleChange}
          value={formData.minimum_investment}
        />

        <div className="mb-4">
          <label>
            <input
              type="checkbox"
              name="has_legality"
              checked={formData.has_legality}
              onChange={handleChange}
            />{' '}
            Sudah Punya Legalitas
          </label>
        </div>

        <div className="mb-4">
          <label>
            <input
              type="checkbox"
              name="legality_in_progress"
              checked={formData.legality_in_progress}
              onChange={handleChange}
            />{' '}
            Legalitas Sedang Diurus
          </label>
        </div>

        <div className="mb-4">
          <label>
            <input
              type="checkbox"
              name="mode_autopilot"
              checked={formData.mode_autopilot}
              onChange={handleChange}
            />{' '}
            Mode Autopilot
          </label>
        </div>

        <div className="mb-4">
          <label>
            <input
              type="checkbox"
              name="mode_semi_autopilot"
              checked={formData.mode_semi_autopilot}
              onChange={handleChange}
            />{' '}
            Mode Semi Autopilot
          </label>
        </div>

        <button className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">
          Update Listing
        </button>
      </form>
    </div>
  )
}
