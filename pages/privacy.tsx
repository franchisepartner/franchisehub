import Head from 'next/head';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Head>
        <title>Kebijakan Privasi - FranchiseHub</title>
        <meta name="description" content="Kebijakan Privasi penggunaan platform FranchiseHub." />
      </Head>

      <h1 className="text-3xl font-bold mb-6">Kebijakan Privasi FranchiseHub</h1>

      <section className="space-y-6 text-gray-700">
        <h2 className="font-semibold text-xl">1. Informasi yang Kami Kumpulkan</h2>
        <p>
          Kami mengumpulkan informasi berikut:
          <ul className="list-disc pl-6">
            <li><strong>Informasi Akun:</strong> Nama, email, foto profil, dan informasi lain yang Anda berikan saat membuat akun melalui autentikasi Google.</li>
            <li><strong>Informasi Franchise:</strong> Detail bisnis franchise yang Anda unggah sebagai franchisor.</li>
            <li><strong>Data Transaksi:</strong> Informasi pembayaran melalui pihak ketiga seperti nama, nomor rekening atau akun e-wallet. Namun, kami tidak menyimpan data kartu kredit atau informasi sensitif pembayaran.</li>
            <li><strong>Interaksi Platform:</strong> Informasi aktivitas Anda di platform kami, termasuk komentar, posting di forum, dan blog.</li>
          </ul>
        </p>

        <h2 className="font-semibold text-xl">2. Penggunaan Informasi</h2>
        <p>
          Informasi pribadi yang kami kumpulkan digunakan untuk menyediakan layanan platform, memproses transaksi pembayaran, mengelola dan meningkatkan layanan, serta menghubungi pengguna terkait aktivitas akun, notifikasi, promosi, atau informasi penting lainnya.
        </p>

        <h2 className="font-semibold text-xl">3. Perlindungan Informasi</h2>
        <p>
          Kami menerapkan langkah-langkah keamanan teknologi, administratif, dan fisik untuk melindungi data Anda dari akses, penggunaan, atau pengungkapan yang tidak sah.
        </p>

        <h2 className="font-semibold text-xl">4. Berbagi Informasi dengan Pihak Ketiga</h2>
        <p>
          FranchiseHub tidak menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga. Kami hanya berbagi data dengan penyedia layanan pembayaran, pihak berwenang jika diwajibkan oleh hukum, dan penyedia layanan teknis yang membantu operasional platform kami.
        </p>

        <h2 className="font-semibold text-xl">5. Hak Pengguna</h2>
        <p>
          Anda berhak mengakses, memperbarui atau menghapus informasi pribadi Anda dari sistem kami, kecuali data yang kami wajib simpan untuk kepatuhan hukum.
        </p>

        <h2 className="font-semibold text-xl">6. Cookies</h2>
        <p>
          Kami menggunakan cookies untuk meningkatkan pengalaman pengguna di platform kami, seperti menyimpan preferensi pengguna, analisis penggunaan platform, dan memberikan fitur personalisasi.
        </p>

        <h2 className="font-semibold text-xl">7. Perubahan Kebijakan Privasi</h2>
        <p>
          FranchiseHub dapat memperbarui Kebijakan Privasi ini kapan saja. Perubahan akan langsung berlaku saat dipublikasikan di halaman ini. Kami menyarankan agar Anda secara berkala memeriksa halaman ini untuk informasi terkini.
        </p>

        <h2 className="font-semibold text-xl">8. Kontak Kami</h2>
        <p>
          Jika Anda memiliki pertanyaan terkait Kebijakan Privasi ini, silakan menghubungi kami melalui email: <strong>support@franchisehub.com</strong> (Senin–Jumat, 09.00–17.00 WITA).
        </p>
      </section>
    </div>
  );
}
