import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Subscription = {
  id: string;
  plan_name: string;
  starts_at: string;
  ends_at: string;
  status: string;
};

export default function SubscriptionStatus() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUserAndSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("ends_at", { ascending: false })
        .limit(1)
        .single();

      setSubscription(data);
      setLoading(false);
    };
    fetchUserAndSubscription();
  }, []);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center">
        <p>Memuat status langganan...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center">
        <p>Silakan login untuk melihat status langganan.</p>
        <a href="/login" className="bg-blue-500 text-white px-4 py-2 rounded mt-4 inline-block">Login</a>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Belum Berlangganan</h2>
        <p className="mb-4">Kamu belum memiliki paket langganan aktif.</p>
        <a href="/franchisor/plans" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold shadow">
          Lihat Paket & Daftar
        </a>
      </div>
    );
  }

  const endsAt = new Date(subscription.ends_at);
  const startsAt = new Date(subscription.starts_at);
  const now = new Date();
  const expired = endsAt < now;

  return (
    <div className="max-w-lg mx-auto p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Status Langganan</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <div className="mb-2 text-lg">
          <strong>Paket:</strong> {subscription.plan_name}
        </div>
        <div>
          <span className="font-semibold">Mulai:</span> {startsAt.toLocaleDateString("id-ID")}
        </div>
        <div>
          <span className="font-semibold">Berakhir:</span> {endsAt.toLocaleDateString("id-ID")}
        </div>
        <div className="my-2">
          <span className="font-semibold">Status:</span>{" "}
          {expired ? (
            <span className="text-red-600 font-bold">Expired</span>
          ) : (
            <span className="text-green-600 font-bold">Aktif</span>
          )}
        </div>
      </div>
      {expired ? (
        <a
          href="/franchisor/plans?renew=true"
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded font-semibold shadow"
        >
          Perpanjang Sekarang
        </a>
      ) : (
        <a
          href="/franchisor/account/billing"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-semibold shadow"
        >
          Kelola Langganan
        </a>
      )}
    </div>
  );
}
