// pages/api/tripay/callback.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const signature = req.headers['x-callback-signature'] as string;
  const event = req.headers['x-callback-event'] as string;
  const body = req.body;

  const privateKey = process.env.TRIPAY_PRIVATE_KEY!;
  const computedSignature = crypto
    .createHmac('sha256', privateKey)
    .update(JSON.stringify(body))
    .digest('hex');

  if (signature !== computedSignature) {
    console.error('🚫 Signature tidak cocok:', { signature, computedSignature });
    return res.status(400).json({ message: 'Invalid signature' });
  }

  console.log('✅ Callback Tripay diterima:', event, body);

  const {
    reference,
    merchant_ref,
    amount,
    status,
    payment_method,
    user_id  // opsional, bisa dikaitkan manual juga
  } = body;

  const { error } = await supabase
    .from('transactions')
    .upsert({
      user_id,
      reference,
      merchant_ref,
      amount,
      status,
      payment_method,
      event,
      raw_response: body,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'reference' });

  if (error) {
    console.error('❌ Gagal simpan transaksi:', error);
    return res.status(500).json({ message: 'Gagal simpan transaksi' });
  }

  return res.status(200).json({ success: true });
}
