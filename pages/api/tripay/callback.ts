// pages/api/tripay/callback.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

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
    console.error('Signature tidak cocok:', { signature, computedSignature });
    return res.status(400).json({ message: 'Invalid signature' });
  }

  console.log('✅ Callback Tripay diterima:', event, body);

  // TODO: Simpan atau perbarui status transaksi di database (Supabase, dsb)

  return res.status(200).json({ success: true });
}
