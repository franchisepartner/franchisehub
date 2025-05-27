import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'

export default function EditRolePage() {
  const router = useRouter()

  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  const [userId, setUserId] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('Franchisee')
  const [message, setMessage] = useState('')

  // Ganti ini dengan UID kamu
  const allowedAdminUID = '2fc2790c-4cac-4a66-a7b7-d68d0e328449'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      const currentUID = session?.user?.id
      const isAllowed = currentUID === allowedAdminUID

      setAuthorized(isAllowed)
      setLoading(false)

      if (!isAllowed) router.push('/')
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    const res = await fetch('/api/admin/update-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, full_name: fullName, role }),
    })

    const data = await res.json()
    if (res.ok) {
      setMessage(`✅ Berhasil mengubah role: ${fullName || 'User'} jadi ${role}`)
      setUserId('')
      setFullName('')
      setRole('Franchisee')
    } else {
      setMessage(`❌ Gagal: ${data.error}`)
    }
  }

  if (loading) return <p className="text-center mt-10">Memuat halaman admin...</p>
  if (!authorized) return null // akan diarahkan ke /

  return (
    <div className="max-w-md mx-auto mt-12 p-6 border rounded shadow">
      <h1 className="text-xl font-bold mb-4 text-center">Panel Admin (UID Tervalidasi)</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="User ID (UID Supabase)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Nama Lengkap (opsional)"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="Franchisee">Franchisee</option>
          <option value="Franchisor">Franchisor</option>
          <option value="Investor">Investor</option>
          <option value="Administrator">Administrator</option>
        </select>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-medium py-2 rounded hover:bg-blue-700"
        >
          Update Role
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
      )}
    </div>
  )
}
