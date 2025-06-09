import Head from 'next/head';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-8 py-12 min-h-screen">
      <Head>
        <title>Kebijakan Privasi - FranchiseHub</title>
        <meta name="description" content="Kebijakan Privasi penggunaan platform FranchiseHub." />
      </Head>

      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-2 tracking-tight">
          Kebijakan Privasi
        </h1>
        <div className="text-base md:text-lg text-gray-500">
          Komitmen FranchiseHub melindungi data dan privasi Anda.
        </div>
      </div>

      <div className="bg-white/90 rounded-2xl shadow-lg border border-blue-100 p-6 md:p-10 space-y-9">
        {/* Section 1 */}
        <section className="flex gap-5">
          <span className="hidden md:flex min-w-[38px] h-[38px] bg-blue-100 text-blue-700 font-extrabold rounded-full shadow justify-center items-center text-xl mt-1">1</span>
          <div>
            <h2 className="font-bold text-lg md:text-xl text-blue-800 mb-1">Informasi yang Kami Kumpulkan</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                <strong>Informasi Akun:</strong> Nama, email, foto profil, dan info lain yang Anda berikan saat login/daftar via Google.
              </li>
              <li>
                <strong>Informasi Franchise:</strong> Data bisnis franchise yang Anda unggah sebagai franchisor (termasuk dokumen legal & informasi usaha).
              </li>
              <li>
                <strong>Data Transaksi:</strong> Info pembayaran seperti nama, email, nomor rekening/e-wallet, diproses melalui payment gateway. <b>FranchiseHub tidak pernah menyimpan data kartu kredit atau data sensitif pembayaran.</b>
              </li>
              <li>
                <strong>Aktivitas Platform:</strong> Semua aktivitas Anda (komentar, posting forum, blog, pengajuan franchise, kalkulator).
              </li>
              <li>
                <strong>Data Teknis:</strong> Data perangkat, browser, alamat IP, cookies, dan data penggunaan untuk keamanan serta peningkatan layanan.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 2 */}
        <section className="flex gap-5">
          <span className="hidden md:flex min-w-[38px] h-[38px] bg-blue-100 text-blue-700 font-extrabold rounded-full shadow justify-center items-center text-xl mt-1">2</span>
          <div>
            <h2 className="font-bold text-lg md:text-xl text-blue-800 mb-1">Penggunaan Informasi</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Mengelola & menyediakan layanan FranchiseHub</li>
              <li>Memproses transaksi pembayaran dengan aman</li>
              <li>Meningkatkan keamanan & personalisasi fitur platform</li>
              <li>Menghubungi Anda untuk notifikasi, update, atau dukungan</li>
              <li>Memenuhi kewajiban hukum dan audit</li>
            </ul>
          </div>
        </section>

        {/* Section 3 */}
        <section className="flex gap-5">
          <span className="hidden md:flex min-w-[38px] h-[38px] bg-blue-100 text-blue-700 font-extrabold rounded-full shadow justify-center items-center text-xl mt-1">3</span>
          <div>
            <h2 className="font-bold text-lg md:text-xl text-blue-800 mb-1">Perlindungan Data & Keamanan</h2>
            <p className="text-gray-700">
              Kami menerapkan sistem keamanan teknologi, administrasi, dan fisik untuk mencegah akses tidak sah, kehilangan, atau penyalahgunaan data. Akses ke data pribadi dibatasi hanya untuk tim FranchiseHub yang membutuhkan untuk menjalankan layanan.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="flex gap-5">
          <span className="hidden md:flex min-w-[38px] h-[38px] bg-blue-100 text-blue-700 font-extrabold rounded-full shadow justify-center items-center text-xl mt-1">4</span>
          <div>
            <h2 className="font-bold text-lg md:text-xl text-blue-800 mb-1">Berbagi Data dengan Pihak Ketiga</h2>
            <p className="text-gray-700">
              FranchiseHub <span className="font-bold">tidak pernah menjual atau membagikan data pribadi pengguna</span> ke pihak lain tanpa izin Anda. Data hanya dibagikan jika:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Diperlukan untuk proses pembayaran dengan payment gateway resmi</li>
              <li>Diminta secara sah oleh otoritas hukum Indonesia</li>
              <li>Diperlukan untuk analisis teknis oleh penyedia layanan cloud/platform kami (dengan komitmen perlindungan data)</li>
            </ul>
          </div>
        </section>

        {/* Section 5 */}
        <section className="flex gap-5">
          <span className="hidden md:flex min-w-[38px] h-[38px] bg-blue-100 text-blue-700 font-extrabold rounded-full shadow justify-center items-center text-xl mt-1">5</span>
          <div>
            <h2 className="font-bold text-lg md:text-xl text-blue-800 mb-1">Hak Pengguna</h2>
            <p className="text-gray-700">
              Anda berhak mengakses, memperbarui, atau menghapus data pribadi yang tersimpan di FranchiseHub, kecuali data yang harus kami simpan sesuai hukum yang berlaku. Untuk permintaan penghapusan data, hubungi email resmi kami.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section className="flex gap-5">
          <span className="hidden md:flex min-w-[38px] h-[38px] bg-blue-100 text-blue-700 font-extrabold rounded-full shadow justify-center items-center text-xl mt-1">6</span>
          <div>
            <h2 className="font-bold text-lg md:text-xl text-blue-800 mb-1">Cookies & Teknologi Serupa</h2>
            <p className="text-gray-700">
              FranchiseHub menggunakan cookies untuk menyimpan preferensi, membantu login otomatis, analitik penggunaan, dan personalisasi tampilan. Anda bisa mengatur preferensi cookies di browser.
            </p>
          </div>
        </section>

        {/* Section 7 */}
        <section className="flex gap-5">
          <span className="hidden md:flex min-w-[38px] h-[38px] bg-blue-100 text-blue-700 font-extrabold rounded-full shadow justify-center items-center text-xl mt-1">7</span>
          <div>
            <h2 className="font-bold text-lg md:text-xl text-blue-800 mb-1">Pembaruan Kebijakan Privasi</h2>
            <p className="text-gray-700">
              Kebijakan ini dapat diperbarui kapan saja. Perubahan berlaku setelah diunggah di halaman ini. Mohon cek secara berkala untuk update terbaru.
            </p>
          </div>
        </section>

        {/* Section 8 */}
        <section className="flex gap-5">
          <span className="hidden md:flex min-w-[38px] h-[38px] bg-blue-100 text-blue-700 font-extrabold rounded-full shadow justify-center items-center text-xl mt-1">8</span>
          <div>
            <h2 className="font-bold text-lg md:text-xl text-blue-800 mb-1">Pertanyaan & Kontak</h2>
            <p className="text-gray-700">
              Jika ada pertanyaan, keluhan, atau permintaan terkait privasi di FranchiseHub, silakan hubungi{" "}
              <a href="mailto:mesebeng17@gmail.com" className="text-blue-600 underline">mesebeng17@gmail.com</a> <span className="text-gray-500">(Senin–Jumat, 09.00–17.00 WITA)</span>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
