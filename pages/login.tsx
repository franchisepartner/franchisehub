import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const back = localStorage.getItem('redirectAfterLogin') || '/';
        router.replace(back);
      }
    });
  }, [router]);

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      {/* Background Image */}
      <Image
        src="/google-login.jpg"
        alt="Google Login Background"
        fill
        className="object-cover"
      />

      {/* Overlay transparan */}
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <button
          onClick={handleGoogleLogin}
          className="bg-blue-600 text-white px-6 py-3 rounded shadow-lg font-semibold hover:bg-blue-700 transition"
        >
          Masuk dengan Google
        </button>
      </div>
    </div>
  );
}
