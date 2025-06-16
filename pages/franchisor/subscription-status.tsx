import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { FiMessageSquare } from "react-icons/fi";

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
    <form onSubmit={handleRedeem} className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg border mt-8 flex flex-col items-center gap-3">
      <h2 className="text-xl font-bold mb-1 text-blue-700">Redeem Voucher / Kode Promo</h2>
      <input
        className="w-full px-4 py-3 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 mb-1"
        placeholder="Masukkan kode voucher atau promo di sini"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
        autoFocus
      />
      <button
        type="submit"
        disabled={loading || !code || !userId}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold shadow w-full mt-1 transition"
      >
        {loading ? "Memproses..." : "Tukarkan"}
      </button>
      {message && (
        <div className={`mt-2 text-sm font-semibold ${message.includes("Sukses") ? "text-green-600" : "text-red-600"}`}>
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

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 to-cyan-50 flex items-center justify-center py-10">
      <div className="w-full max-w-xl mx-auto bg-white/95 backdrop-blur rounded-3xl shadow-2xl px-7 py-10 border border-blue-100">
        <h1 className="text-3xl font-bold text-blue-700 mb-4 text-center tracking-tight">Status Langganan</h1>

        {/* Tombol WhatsApp selalu muncul */}
        <div className="flex flex-col items-center mb-7">
          <a
            href="https://wa.me/6281238796380"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-7 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full shadow-lg text-lg transition-all"
            style={{minWidth:220, justifyContent:"center"}}
          >
            <FiMessageSquare className="text-xl" /> Hubungi Tim Administrator
          </a>
          <span className="mt-1 text-sm text-gray-500 text-center">
            Bantuan pendaftaran, info pembayaran, dan paket promo silakan klik tombol di atas.
          </span>
        </div>

        {/* Status dan logic login */}
        {loading ? (
          <div className="py-12 text-center text-blue-600 text-lg font-semibold">Memuat status langganan...</div>
        ) : !user ? (
          <div className="py-12 text-center">
            <p className="mb-3 text-lg font-semibold text-gray-700">Silakan login untuk melihat status langganan.</p>
            <a href="/login" className="bg-blue-500 text-white px-6 py-3 rounded-xl mt-2 inline-block font-bold shadow-lg">Login</a>
          </div>
        ) : !subscription ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2 text-blue-800">Belum Berlangganan</h2>
            <p className="mb-4 text-gray-500">Kamu belum memiliki paket langganan aktif.</p>
            {/* <a href="/franchisor/plans" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold shadow mb-3 inline-block">
              Lihat Paket & Daftar
            </a> */}
            <VoucherRedeem onSuccess={refreshSubscription} />
          </div>
        ) : (
          <div>
            <div className="bg-white rounded-2xl shadow p-6 mb-4 border max-w-md mx-auto">
              <div className="mb-2 text-lg flex justify-between items-center">
                <span className="font-bold">Paket:</span> <span>{subscription.plan_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Mulai:</span>
                <span>
                  {new Date(subscription.starts_at).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Berakhir:</span>
                <span>
                  {new Date(subscription.ends_at).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center my-2">
                <span className="font-semibold">Status:</span>
                {new Date(subscription.ends_at) < new Date() ? (
                  <span className="text-red-600 font-bold">Expired</span>
                ) : (
                  <span className="text-green-600 font-bold">Aktif</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Sisa Waktu:</span>
                <span className={new Date(subscription.ends_at) < new Date() ? "text-red-500 font-bold" : "text-blue-600 font-bold"}>
                  {countdown}
                </span>
              </div>
            </div>
            <VoucherRedeem onSuccess={refreshSubscription} />
          </div>
        )}
      </div>
    </div>
  );
}
