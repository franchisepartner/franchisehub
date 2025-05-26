import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function Callback() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const back = localStorage.getItem('redirectAfterLogin') || '/'
        router.replace(back)
      }
    })
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Memproses login...</p>
    </div>
  )
}
