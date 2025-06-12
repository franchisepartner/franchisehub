// pages/register.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function RegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect segera ke halaman /franchisor
    router.replace('/franchisor');
  }, [router]);

  // Optional: tampilkan loading agar tidak blank saat redirect
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20
    }}>
      Mengalihkan ke halaman Franchisor...
    </div>
  );
}
