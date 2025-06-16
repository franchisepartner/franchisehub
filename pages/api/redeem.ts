import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function extendSubscription(user_id: string, duration: number) {
  const { data: current, error: currError } = await supabaseAdmin
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
    const { error: updateError } = await supabaseAdmin
      .from("subscriptions")
      .update({ ends_at: newEndsAt.toISOString(), status: "active" })
      .eq("id", current.id);
    if (updateError) {
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
      throw insertError;
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { code, user_id } = req.body;
  if (!code || !user_id)
    return res.status(400).json({ success: false, message: "Kode dan user wajib diisi" });

  let { data: voucher, error } = await supabaseAdmin
    .from("vouchers")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error || !voucher) {
    return res.status(404).json({ success: false, message: "Kode tidak ditemukan." });
  }

  if (voucher.type === "voucher") {
    if (voucher.is_used)
      return res.status(400).json({ success: false, message: "Kode sudah digunakan." });

    try {
      await extendSubscription(user_id, voucher.duration);
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: "Gagal update subscription.",
        detail: err.message,
      });
    }

    const { error: voucherErr } = await supabaseAdmin
      .from("vouchers")
      .update({ is_used: true, used_by: user_id, used_at: new Date().toISOString() })
      .eq("id", voucher.id);

    if (voucherErr) {
      return res.status(500).json({ success: false, message: "Gagal update status voucher." });
    }

    return res.status(200).json({ success: true, message: `Sukses! Langganan bertambah ${voucher.duration} hari.` });
  }

  if (voucher.type === "promo") {
    const { data: redeemed } = await supabaseAdmin
      .from("voucher_redemptions")
      .select("*")
      .eq("voucher_code", code)
      .eq("user_id", user_id)
      .maybeSingle();

    if (redeemed)
      return res.status(400).json({ success: false, message: "Kamu sudah pernah menukarkan kode ini." });

    if (voucher.used_count >= voucher.quota)
      return res.status(400).json({ success: false, message: "Kuota promo habis." });

    try {
      await extendSubscription(user_id, voucher.duration);
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: "Gagal update subscription.",
        detail: err.message,
      });
    }

    const { error: redemptionErr } = await supabaseAdmin.from("voucher_redemptions").insert([
      { voucher_code: code, user_id: user_id }
    ]);
    if (redemptionErr) {
      return res.status(500).json({ success: false, message: "Gagal insert voucher_redemptions." });
    }

    const { error: updatePromoErr } = await supabaseAdmin
      .from("vouchers")
      .update({ used_count: voucher.used_count + 1 })
      .eq("id", voucher.id);

    if (updatePromoErr) {
      return res.status(500).json({ success: false, message: "Gagal update kuota promo." });
    }

    return res.status(200).json({ success: true, message: `Sukses! Promo ${voucher.duration} hari aktif.` });
  }

  return res.status(400).json({ success: false, message: "Jenis kode tidak valid." });
}
