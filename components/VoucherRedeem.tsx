import { useState } from "react";

export default function VoucherRedeem() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
    });

    const data = await res.json();
    setLoading(false);
    setMessage(data.message || (data.success ? "Sukses!" : "Gagal menukarkan kode"));
    if (data.success) setCode("");
  }

  return (
    <form onSubmit={handleRedeem} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow text-center">
      <h2 className="text-2xl font-bold mb-2">Tukarkan Voucher / Kode Promo</h2>
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
        disabled={loading || !code}
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
