// pages/admin/edit-role.tsx
import { useState } from 'react'

export default function EditRolePage() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('Franchisee')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/update-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, full_name: fullName, role })
    })
    const data = await res.json()
    setMessage(data.message || data.error)
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-4 border rounded shadow">
      <h1 className="text-xl font-bold mb-4">Ubah Role User</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email user"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Nama lengkap"
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
      {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
    </div>
  )
}
