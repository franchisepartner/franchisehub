import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import BurgerMenu from './BurgerMenu'

export default function Navbar() {
  const [session, setSession] = useState<any>(null)
  const [deviceType, setDeviceType] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const detectDevice = () => {
      const width = window.innerWidth
      if (width <= 768) setDeviceType('Mobile')
      else if (width <= 1024) setDeviceType('Tablet')
      else setDeviceType('Desktop')
    }

    detectDevice()
    window.addEventListener('resize', detectDevice)
    return () => window.removeEventListener('resize', detectDevice)
  }, [])

  const userGreeting = session ? 'Franchisee' : 'Calon Franchisee'

  return (
    <>
      <nav className="w-full bg-white shadow-md px-4 py-3 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <div className="flex justify-between items-center w-full md:w-auto">
          <Link href="/" className="text-xl font-bold text-blue-600">FranchiseHub</Link>
          <button className="text-2xl md:hidden" onClick={() => document.getElementById('burger')?.click()}>☰</button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
          <input type="text" placeholder="Cari franchise..." className="px-3 py-1 border rounded w-full md:w-64" />
          {!session && <Link href="/login" className="text-blue-600">Login</Link>}
          {session && <button className="text-red-600" onClick={() => supabase.auth.signOut()}>Logout</button>}
          <button id="burger" onClick={() => document.getElementById('burger-menu')?.classList.toggle('translate-x-full')} className="hidden md:inline text-2xl">☰</button>
        </div>

        <p className="text-sm text-gray-500 italic mt-2 md:mt-0 text-right md:text-left">Halo, {userGreeting} ({deviceType})</p>
      </nav>
    </>
  )
}
