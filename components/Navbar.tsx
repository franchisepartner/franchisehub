import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import BurgerMenu from './BurgerMenu'

export default function Navbar() {
  const [session, setSession] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener?.subscription.unsubscribe()
  }, [])

  const handleLogin = () => {
    localStorage.setItem('redirectAfterLogin', router.asPath)
    router.push('/login')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    router.push('/')
  }

  const userGreeting = session ? 'Franchisee' : 'Calon Franchisee'

  return (
    <>
      <nav className="w-full bg-white shadow-md px-4 py-3 flex flex-wrap items-center justify-between gap-2 relative z-50">
        {/* Baris Atas: Logo + Burger */}
        <div className="flex justify-between items-center w-full">
          <Link href="/" className="text-xl font-bold text-blue-600">FranchiseHub</Link>
          <button
            onClick={() => setMenuOpen(true)}
            className="text-2xl"
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>

        {/* Search Bar */}
        <div className="w-full">
          <input
            type="text"
            placeholder="Cari franchise..."
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        {/* Login + Sapaan */}
        <div className="w-full flex justify-between items-center text-sm">
          {session ? (
            <button onClick={handleLogout} className="text-red-500 font-medium">Logout</button>
          ) : (
            <button onClick={handleLogin} className="text-blue-600 font-medium">Login</button>
          )}
          <p className="italic text-gray-500">Halo, {userGreeting}!</p>
        </div>
      </nav>

      {/* Slide Menu */}
      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
