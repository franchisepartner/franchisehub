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
    // Redirect ke halaman pencarian, atau kamu bisa filter listing di halaman ini
    router.push(`/?search=${search}`)
  }

  return (
    <nav className="flex flex-col md:flex-row md:justify-between items-center gap-4 p-4 bg-white shadow-md">
      <div className="flex items-center justify-between w-full md:w-auto">
        <Link href="/" className="text-xl font-bold text-blue-600">FranchiseHub</Link>
        <button className="text-2xl ml-auto md:hidden">☰</button>
      </div>

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

      <div className="flex gap-4 items-center">
        {!session ? (
          <Link href="/login" className="text-blue-600 font-medium">Login</Link>
        ) : (
          <button onClick={handleLogout} className="text-red-500 font-medium">Logout</button>
        )}
      </div>
    </nav>
  )
}
