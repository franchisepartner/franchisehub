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
        <ul className="list-disc pl-6 space-y-1 mb-2">
          <li>
            <strong>Informasi Akun:</strong> Nama, email, foto profil, dan informasi lain yang Anda berikan saat mendaftar atau login menggunakan akun Google di FranchiseHub.
          </li>
          <li>
            <strong>Informasi Franchise:</strong> Data bisnis franchise yang Anda daftarkan sebagai franchisor, termasuk dokumen legal dan informasi usaha.
          </li>
          <li>
            <strong>Data Transaksi:</strong> Informasi pembayaran seperti nama, email, nomor rekening/e-wallet, yang diproses melalui payment gateway. FranchiseHub <strong>tidak pernah menyimpan data kartu kredit atau informasi sensitif pembayaran.</strong>
          </li>
          <li>
            <strong>Aktivitas Platform:</strong> Semua aktivitas Anda di platform seperti komentar, posting forum, blog, pengajuan franchise, dan penggunaan fitur kalkulator.
          </li>
          <li>
            <strong>Data Teknis:</strong> Data perangkat, browser, alamat IP, cookies, dan data penggunaan untuk keamanan serta peningkatan layanan.
          </li>
        </ul>

        <h2 className="font-semibold text-xl">2. Penggunaan Informasi</h2>
        <p>
          Semua data yang kami kumpulkan digunakan untuk:
          <ul className="list-disc pl-6">
            <li>Mengelola dan menyediakan layanan FranchiseHub</li>
            <li>Memproses transaksi pembayaran secara aman</li>
            <li>Meningkatkan keamanan dan personalisasi fitur platform</li>
            <li>Menghubungi Anda untuk notifikasi penting, pembaruan, atau dukungan pelanggan</li>
            <li>Memenuhi kewajiban hukum dan audit platform</li>
          </ul>
        </p>

        <h2 className="font-semibold text-xl">3. Perlindungan Data dan Keamanan</h2>
        <p>
          Kami menerapkan sistem keamanan teknologi, administrasi, dan fisik untuk mencegah akses tidak sah, kehilangan, atau penyalahgunaan data pengguna. Akses ke data pribadi dibatasi hanya untuk tim FranchiseHub yang membutuhkan untuk menjalankan layanan.
        </p>

        <h2 className="font-semibold text-xl">4. Berbagi Data dengan Pihak Ketiga</h2>
        <p>
          FranchiseHub <span className="font-bold">tidak pernah menjual atau membagikan data pribadi pengguna</span> ke pihak lain tanpa izin Anda. Data hanya dibagikan jika:
          <ul className="list-disc pl-6">
            <li>Diperlukan untuk proses pembayaran dengan payment gateway resmi</li>
            <li>Diminta secara sah oleh otoritas hukum Indonesia</li>
            <li>Diperlukan untuk analisis teknis oleh penyedia layanan cloud/platform kami (dengan komitmen perlindungan data)</li>
          </ul>
        </p>

        <h2 className="font-semibold text-xl">5. Hak Pengguna</h2>
        <p>
          Anda berhak untuk mengakses, memperbarui, atau menghapus data pribadi yang tersimpan di FranchiseHub, kecuali data yang harus kami simpan sesuai hukum yang berlaku. Untuk permintaan penghapusan data, hubungi email resmi kami.
        </p>

        <h2 className="font-semibold text-xl">6. Cookies dan Teknologi Serupa</h2>
        <p>
          FranchiseHub menggunakan cookies untuk menyimpan preferensi, membantu login otomatis, analitik penggunaan, dan personalisasi tampilan. Anda dapat mengatur preferensi cookies di browser Anda.
        </p>

        <h2 className="font-semibold text-xl">7. Pembaruan Kebijakan Privasi</h2>
        <p>
          FranchiseHub dapat memperbarui kebijakan ini kapan saja. Setiap perubahan akan langsung berlaku setelah diunggah di halaman ini. Mohon cek secara berkala untuk update terbaru.
        </p>

        <h2 className="font-semibold text-xl">8. Pertanyaan dan Kontak</h2>
        <p>
          Jika ada pertanyaan, keluhan, atau permintaan terkait privasi di FranchiseHub, silakan hubungi <a href="mailto:mesebeng17@gmail.com" className="text-blue-600 underline">mesebeng17@gmail.com</a> (Senin–Jumat, 09.00–17.00 WITA).
        </p>
      </section>
    </div>
  );
}
