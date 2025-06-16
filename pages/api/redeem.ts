import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from '@supabase/supabase-js';

// Pakai admin client (service role) agar bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper: extend masa aktif subscription user
async function extendSubscription(user_id: string, duration: number) {
  // Ambil subscription terbaru user
  const { data: current, error: currError } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("user_id", user_id)
    .order("ends_at", { ascending: false })
    .limit(1)
    .single();

  if (currError) {
    console.error("Gagal mengambil subscription:", currError);
    throw currError;
  }

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
    const { error: updateError } = await supabaseAdmin
      .from("subscriptions")
      .update({ ends_at: newEndsAt.toISOString(), status: "active" })
      .eq("id", current.id);
    if (updateError) {
      console.error("Gagal update subscription:", updateError);
      throw updateError;
    }
  } else {
    const { error: insertError } = await supabaseAdmin.from("subscriptions").insert([
      {
        user_id,
        plan_name: "Token/Paket",
        starts_at: new Date().toISOString(),
        ends_at: newEndsAt.toISOString(),
        status: "active",
      },
    ]);
    if (insertError) {
      console.error("Gagal insert subscription:", insertError);
      throw insertError;
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { code, user_id } = req.body;
  if (!code || !user_id)
    return res.status(400).json({ success: false, message: "Kode dan user wajib diisi" });

  // 1. Cek di tabel vouchers (type voucher/promo)
  let { data: voucher, error } = await supabaseAdmin
    .from("vouchers")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error || !voucher) {
    console.error("Voucher error:", error);
    return res.status(404).json({ success: false, message: "Kode tidak ditemukan." });
  }

  if (voucher.type === "voucher") {
    // --- Kode voucher unik ---
    if (voucher.is_used)
      return res.status(400).json({ success: false, message: "Kode sudah digunakan." });

    // Extend subscription
    try {
      await extendSubscription(user_id, voucher.duration);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Gagal update subscription.", detail: err.message });
    }

    // Tandai kode sudah dipakai
    const { error: voucherErr } = await supabaseAdmin
      .from("vouchers")
      .update({ is_used: true, used_by: user_id, used_at: new Date().toISOString() })
      .eq("id", voucher.id);

    if (voucherErr) {
      console.error("Gagal update voucher:", voucherErr);
      return res.status(500).json({ success: false, message: "Gagal update status voucher." });
    }

    return res.status(200).json({ success: true, message: `Sukses! Langganan bertambah ${voucher.duration} hari.` });
  }

  if (voucher.type === "promo") {
    // --- Kode promo massal ---
    // 1. Cek user sudah pernah redeem kode ini?
    const { data: redeemed } = await supabaseAdmin
      .from("voucher_redemptions")
      .select("*")
      .eq("voucher_code", code)
      .eq("user_id", user_id)
      .maybeSingle();

    if (redeemed)
      return res.status(400).json({ success: false, message: "Kamu sudah pernah menukarkan kode ini." });

    // 2. Cek kuota promo
    if (voucher.used_count >= voucher.quota)
      return res.status(400).json({ success: false, message: "Kuota promo habis." });

    // Extend subscription
    try {
      await extendSubscription(user_id, voucher.duration);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: "Gagal update subscription.", detail: err.message });
    }

    // Tambahkan ke voucher_redemptions
    const { error: redemptionErr } = await supabaseAdmin.from("voucher_redemptions").insert([
      { voucher_code: code, user_id: user_id }
    ]);
    if (redemptionErr) {
      console.error("Gagal insert voucher_redemptions:", redemptionErr);
      return res.status(500).json({ success: false, message: "Gagal insert voucher_redemptions." });
    }

    // Update counter promo
    const { error: updatePromoErr } = await supabaseAdmin
      .from("vouchers")
      .update({ used_count: voucher.used_count + 1 })
      .eq("id", voucher.id);

    if (updatePromoErr) {
      console.error("Gagal update used_count promo:", updatePromoErr);
      return res.status(500).json({ success: false, message: "Gagal update kuota promo." });
    }

    return res.status(200).json({ success: true, message: `Sukses! Promo ${voucher.duration} hari aktif.` });
  }

  return res.status(400).json({ success: false, message: "Jenis kode tidak valid." });
}
