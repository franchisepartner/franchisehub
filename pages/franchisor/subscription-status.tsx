// pages/franchisor/subscription-status.tsx

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

// --- VoucherRedeem Component ---
function VoucherRedeem({ onSuccess }: { onSuccess?: () => void }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) setUserId(data.user.id);
    });
  }, []);

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim(), user_id: userId }),
    });

    const data = await res.json();
    setLoading(false);
    setMessage(data.message || (data.success ? "Sukses!" : "Gagal menukarkan kode"));
    if (data.success) {
      setCode("");
      if (onSuccess) onSuccess();
    }
  }

  return (
    <form onSubmit={handleRedeem} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow text-center mt-6">
      <h2 className="text-xl font-bold mb-2">Tukarkan Voucher / Kode Promo</h2>
      <input
        className="w-full px-4 py-2 border rounded mb-4"
        placeholder="Masukkan kode voucher atau promo di sini"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
        autoFocus
      />
      <button
        type="submit"
        disabled={loading || !code || !userId}
        className="bg-blue-600 text-white px-6 py-2 rounded font-semibold shadow"
      >
        {loading ? "Memproses..." : "Tukarkan"}
      </button>
      {message && (
        <div className={`mt-4 text-sm font-semibold ${message.includes("Sukses") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </div>
      )}
    </form>
  );
}

// --- SubscriptionStatus Component ---
type Subscription = {
  id: string;
  plan_name: string;
  starts_at: string;
  ends_at: string;
  status: string;
};

function formatDuration(ms: number) {
  if (ms <= 0) return "Expired";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days} hari ${hours} jam ${minutes} menit ${seconds} detik`;
}

export default function SubscriptionStatus() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [user, setUser] = useState<any>(null);
  const [countdown, setCountdown] = useState<string>("");

  // Fetch user & subscription
  const refreshSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (!user) {
      setLoading(false);
      setSubscription(null);
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

  useEffect(() => {
    setLoading(true);
    refreshSubscription();
    // eslint-disable-next-line
  }, []);

  // Countdown updater
  useEffect(() => {
    if (!subscription) return;
    const interval = setInterval(() => {
      const now = new Date();
      const endsAt = new Date(subscription.ends_at);
      const diff = endsAt.getTime() - now.getTime();
      setCountdown(formatDuration(diff));
    }, 1000);
    return () => clearInterval(interval);
  }, [subscription]);

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
        <VoucherRedeem onSuccess={refreshSubscription} />
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
          <span className="font-semibold">Mulai:</span>{" "}
          {startsAt.toLocaleString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
        <div>
          <span className="font-semibold">Berakhir:</span>{" "}
          {endsAt.toLocaleString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
        <div className="my-2">
          <span className="font-semibold">Status:</span>{" "}
          {expired ? (
            <span className="text-red-600 font-bold">Expired</span>
          ) : (
            <span className="text-green-600 font-bold">Aktif</span>
          )}
        </div>
        <div>
          <span className="font-semibold">Sisa Waktu:</span>{" "}
          <span className={expired ? "text-red-500 font-bold" : "text-blue-600 font-bold"}>
            {countdown}
          </span>
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
      {/* Form redeem voucher/promo */}
      <VoucherRedeem onSuccess={refreshSubscription} />
    </div>
  );
}
