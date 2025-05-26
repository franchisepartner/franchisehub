import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const back = localStorage.getItem('redirectAfterLogin') || '/'
        router.replace(back)
      }
    })
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <button onClick={handleGoogleLogin} className="bg-blue-600 text-white px-6 py-3 rounded">
        Masuk dengan Google
      </button>
    </div>
  )
}
