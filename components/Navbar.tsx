import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Navbar() {
  const [session, setSession] = useState<any>(null)
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.reload()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/?search=${search}`)
  }

  return (
    <nav className="w-full bg-white shadow-md px-4 py-3 flex flex-col md:flex-row items-center md:justify-between gap-3 md:gap-0">
      {/* Kiri: Branding */}
      <div className="w-full md:w-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">FranchiseHub</Link>
        <button className="md:hidden text-2xl text-gray-700">☰</button>
      </div>

      {/* Tengah: Search */}
      <form onSubmit={handleSearch} className="w-full md:w-1/3 flex">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari franchise..."
          className="flex-grow border px-3 py-1 rounded-l"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded-r">Cari</button>
      </form>

      {/* Kanan: Login / Logout + Burger (desktop only) */}
      <div className="w-full md:w-auto flex justify-between md:justify-end items-center gap-4">
        {!session ? (
          <Link href="/login" className="text-blue-600 font-medium">Login</Link>
        ) : (
          <button onClick={handleLogout} className="text-red-500 font-medium">Logout</button>
        )}
        <button className="hidden md:block text-2xl text-gray-700">☰</button>
      </div>
    </nav>
  )
}
