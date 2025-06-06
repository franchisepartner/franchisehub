import Head from 'next/head';

export default function SyaratKetentuan() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Head>
        <title>Syarat dan Ketentuan - FranchiseHub</title>
        <meta name="description" content="Syarat dan Ketentuan penggunaan platform FranchiseHub." />
      </Head>

      <h1 className="text-3xl font-bold mb-6">Syarat dan Ketentuan FranchiseHub</h1>

      <section className="space-y-6 text-gray-700">
        <p>
          Dengan menggunakan FranchiseHub, Anda menyetujui syarat dan ketentuan berikut ini:
        </p>

        <h2 className="font-semibold text-xl">1. Akun dan Keanggotaan</h2>
        <p>
          Anda harus membuat akun melalui Google OAuth untuk menggunakan FranchiseHub. Anda bertanggung jawab penuh atas akun Anda.
        </p>

        <h2 className="font-semibold text-xl">2. Kewajiban Franchisor</h2>
        <p>
          Franchisor wajib menyediakan informasi yang akurat serta dokumen legal yang lengkap.
        </p>

        <h2 className="font-semibold text-xl">3. Hak dan Tanggung Jawab Franchisee</h2>
        <p>
          Franchisee bertanggung jawab melakukan riset mendalam sebelum investasi dan memahami risiko sepenuhnya.
        </p>

        <h2 className="font-semibold text-xl">4. Transaksi Pembayaran</h2>
        <p>
          Semua pembayaran diproses melalui penyedia pihak ketiga yang terpercaya. FranchiseHub tidak menyimpan detail sensitif pembayaran Anda.
        </p>

        <h2 className="font-semibold text-xl">5. Konten dan Interaksi Pengguna</h2>
        <p>
          FranchiseHub berhak mengelola konten untuk menjaga kualitas dan keamanan platform.
        </p>

        <h2 className="font-semibold text-xl">6. Privasi Data</h2>
        <p>
          Informasi pribadi Anda dilindungi sesuai dengan Kebijakan Privasi kami.
        </p>

        <h2 className="font-semibold text-xl">7. Perubahan Ketentuan</h2>
        <p>
          FranchiseHub dapat mengubah syarat ini sewaktu-waktu, efektif sejak dipublikasikan di halaman ini.
        </p>

        <h2 className="font-semibold text-xl">8. Pembatasan Tanggung Jawab</h2>
        <p>
          FranchiseHub tidak bertanggung jawab atas segala kerugian yang terjadi karena keputusan pengguna yang diambil berdasarkan informasi di platform ini.
        </p>

        <h2 className="font-semibold text-xl">9. Hukum dan Penyelesaian Sengketa</h2>
        <p>
          Segala sengketa diselesaikan melalui musyawarah atau pengadilan Indonesia sesuai hukum yang berlaku di Indonesia.
        </p>

        <h2 className="font-semibold text-xl">10. Kontak Kami</h2>
        <p>
          Jika ada pertanyaan, hubungi kami di <strong>support@franchisehub.com</strong> (Senin–Jumat, 09.00–17.00 WITA).
        </p>
      </section>
    </div>
  );
}
