import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Navbar() {
  const [session, setSession] = useState<any>(null)
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

  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow">
      <Link href="/" className="text-xl font-bold text-blue-600">FranchiseHub</Link>
      <div className="flex gap-4 items-center">
        <button className="text-2xl">☰</button> {/* Burger icon */}
        {!session ? (
          <Link href="/login" className="text-blue-600 font-medium">Login</Link>
        ) : (
          <button onClick={handleLogout} className="text-red-500 font-medium">Logout</button>
        )}
      </div>
    </nav>
  )
}
