import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function HomePage() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (data && !error) {
          setRole(data.role);
        }
      }
      setLoading(false);
    };

    fetchUserRole();

    const channel = supabase
      .channel('profiles')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}` },
        (payload) => {
          if (payload.new && payload.new.role) {
            setRole(payload.new.role);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-semibold">Selamat datang di FranchiseHub!</h1>
      <p>Status kamu: <strong>{role}</strong></p>
    </div>
  );
}
