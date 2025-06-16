import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabaseClient";

// Helper untuk extend masa aktif
async function extendSubscription(user_id: string, duration: number) {
  // Ambil data subscription user
  const { data: current } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user_id)
    .order("ends_at", { ascending: false })
    .limit(1)
    .single();

  const now = new Date();
  let newEndsAt: Date;

  if (current && new Date(current.ends_at) > now) {
    newEndsAt = new Date(current.ends_at);
    newEndsAt.setDate(newEndsAt.getDate() + duration);
  } else {
    newEndsAt = new Date();
    newEndsAt.setDate(newEndsAt.getDate() + duration);
  }

  if (current) {
    await supabase
      .from("subscriptions")
      .update({ ends_at: newEndsAt.toISOString(), status: "active" })
      .eq("id", current.id);
  } else {
    await supabase.from("subscriptions").insert([
      {
        user_id,
        plan_name: "Token/Paket",
        starts_at: new Date().toISOString(),
        ends_at: newEndsAt.toISOString(),
        status: "active",
      },
    ]);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { code } = req.body;
  if (!code) return res.status(400).json({ success: false, message: "Kode wajib diisi" });

  // Ambil user session (gunakan cookies/token supabase client-side)
  const { data: { user } } = await supabase.auth.getUser(req.cookies["sb-access-token"] || "");
  if (!user) return res.status(401).json({ success: false, message: "Kamu harus login untuk redeem kode." });

  // 1. Cek di tabel vouchers (type voucher/promo)
  let { data: voucher, error } = await supabase
    .from("vouchers")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error || !voucher) return res.status(404).json({ success: false, message: "Kode tidak ditemukan." });

  if (voucher.type === "voucher") {
    // --- Kode voucher unik ---
    if (voucher.is_used)
      return res.status(400).json({ success: false, message: "Kode sudah digunakan." });

    // Extend subscription
    await extendSubscription(user.id, voucher.duration);

    // Tandai kode sudah dipakai
    await supabase
      .from("vouchers")
      .update({ is_used: true, used_by: user.id, used_at: new Date().toISOString() })
      .eq("id", voucher.id);

    return res.status(200).json({ success: true, message: `Sukses! Langganan bertambah ${voucher.duration} hari.` });
  }

  if (voucher.type === "promo") {
    // --- Kode promo massal ---
    // 1. Cek user sudah pernah redeem kode ini?
    const { data: redeemed } = await supabase
      .from("voucher_redemptions")
      .select("*")
      .eq("voucher_code", code)
      .eq("user_id", user.id)
      .maybeSingle();

    if (redeemed)
      return res.status(400).json({ success: false, message: "Kamu sudah pernah menukarkan kode ini." });

    // 2. Cek kuota promo
    if (voucher.used_count >= voucher.quota)
      return res.status(400).json({ success: false, message: "Kuota promo habis." });

    // Extend subscription
    await extendSubscription(user.id, voucher.duration);

    // Tambahkan ke voucher_redemptions
    await supabase.from("voucher_redemptions").insert([
      { voucher_code: code, user_id: user.id }
    ]);
    // Update counter promo
    await supabase
      .from("vouchers")
      .update({ used_count: voucher.used_count + 1 })
      .eq("id", voucher.id);

    return res.status(200).json({ success: true, message: `Sukses! Promo ${voucher.duration} hari aktif.` });
  }

  return res.status(400).json({ success: false, message: "Jenis kode tidak valid." });
}
