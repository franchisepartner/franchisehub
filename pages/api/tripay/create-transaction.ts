// /pages/api/tripay/create-transaction.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const API_KEY = process.env.TRIPAY_API_KEY!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  // Ambil data dari body request
  const { payment_method, amount, customer_name, customer_email, merchant_ref, order_items } = req.body;

  try {
    const response = await fetch('https://tripay.co.id/api/transaction/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        method: payment_method,
        merchant_ref,
        amount,
        customer_name,
        customer_email,
        order_items,
        return_url: 'https://franchisenusantara.com/payment-success',
        callback_url: 'https://franchisenusantara.com/api/tripay/callback'
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({ error: data });
    }

    // Langkah selanjutnya: simpan transaksi ke Supabase
    // Bisa tambahkan kode di sini nanti

    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
