import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface ProfilePayload {
  id: string;
  role: string;
}

export default function HomePage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile) {
          setRole(profile.role);
        }
      }
    };

    fetchUserRole();

    const subscription = supabase
      .channel('profiles_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        async (payload: RealtimePostgresChangesPayload<any>) => {
          if (payload.eventType !== 'DELETE' && payload.new) {
            const typedPayload = payload.new as ProfilePayload;
            const { data: { user } } = await supabase.auth.getUser();
            if (user && typedPayload.id === user.id) {
              setRole(typedPayload.role);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div>
      <h1>Selamat datang di FranchiseHub!</h1>
      <p>Status kamu: {role ?? 'Memuat...'}</p>
    </div>
  );
}
