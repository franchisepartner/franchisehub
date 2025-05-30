import { useEffect, FormEvent } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

export default function FranchisorPage() {
  const supabase = useSupabaseClient();
  const user = useUser();

  useEffect(() => {
    if (!user) return;

    const checkStatus = async () => {
      // Periksa apakah profil user sudah ada di tabel 'profiles'
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id);

      if (error) {
        console.error('Terjadi kesalahan saat memeriksa profil:', error);
        return;
      }

      if (!profiles || profiles.length === 0) {
        // Jika profil belum ada, buat profil baru dengan role 'franchisee' default
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: user.id, role: 'franchisee' });

        if (insertError) {
          console.error('Terjadi kesalahan saat membuat profil default:', insertError);
        }
      }
    };

    checkStatus();
  }, [supabase, user]);

  const handlePaymentComplete = async (e: FormEvent) => {
    e.preventDefault();

    // Update peran user menjadi 'franchisor' setelah pembayaran sukses
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'franchisor' })
      .eq('id', user.id);

    if (error) {
      console.error('Terjadi kesalahan saat memperbarui peran pengguna:', error);
    } else {
      alert('Pembayaran berhasil, peran pengguna diperbarui menjadi franchisor.');
    }
  };

  return (
    <div>
      <h1>Jadi Franchisor</h1>
      <form onSubmit={handlePaymentComplete}>
        {/* ... form fields untuk pembayaran ... */}
        <button type="submit">Selesaikan Pembayaran</button>
      </form>
    </div>
  );
}
