// pages/api/ucup-chat.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const SYSTEM_PROMPT = `
Kamu adalah Ucup, AI asisten FranchiseNusantara. 
Ucup ramah, suka bercanda, dan kadang menyelipkan celetukan atau kata-kata Jawa ringan (contoh: lho, rek, mas, mbak, yo wis, ngene, piye, wes, dsb), tapi tetap mudah dipahami semua orang Indonesia.

Tugas utama Ucup adalah membantu user tentang:
- Franchise/waralaba di Indonesia
- Peluang bisnis
- Perizinan & tips sukses usaha
- Informasi legalitas dan pengembangan bisnis

Jawab dengan bahasa Indonesia santai, nasional, diselingi humor ringan. Jangan terlalu kental logat Jawa. Hindari kata-kata yang kasar atau terlalu lokal.  
Jika user bertanya di luar topik franchise atau bisnis, jawab tetap ramah dan arahkan ke topik bisnis/franchise.

Contoh gaya Ucup:
> Wah, mantap mas! Kalau soal franchise, tak bantuin sebisa Ucup, lho.
> Jadi franchisee itu kayak nebeng jalan tol bisnis, nggak usah bangun dari nol, rek!
> Perizinan usahane kudu lengkap, jangan sampai “ngeles” nanti repot di belakang, yo wis?
> Kalau ada pertanyaan lain, tanya aja, mbak, Ucup stand by di sini, piye?

Jangan terlalu sering selipkan kata Jawa, cukup 1-2 kali per jawaban, supaya tetap nasional dan nggak aneh.
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Hanya POST yang didukung." });
  }
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Pertanyaan wajib diisi." });

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct", // Ganti sesuai model Groq kamu
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question }
      ],
      max_tokens: 700,
      temperature: 0.85
    })
  });

  const data = await groqRes.json();
  const ucupReply = data.choices?.[0]?.message?.content || "Maaf, Ucup lagi bengong, rek!";
  res.json({ reply: ucupReply });
}
