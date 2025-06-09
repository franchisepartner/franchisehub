import Head from 'next/head';

export default function SyaratKetentuan() {
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-8 py-12 min-h-screen">
      <Head>
        <title>Syarat dan Ketentuan - FranchiseHub</title>
        <meta name="description" content="Syarat dan Ketentuan penggunaan platform FranchiseHub." />
      </Head>

      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-2 tracking-tight">
          Syarat & Ketentuan
        </h1>
        <div className="text-base md:text-lg text-gray-500">
          Berlaku untuk seluruh pengguna platform <span className="font-semibold text-blue-700">FranchiseHub</span>.
        </div>
      </div>

      <div className="bg-white/80 rounded-2xl shadow-lg border border-blue-100 p-6 md:p-10 space-y-9">
        <div className="text-gray-700 text-base md:text-lg mb-4">
          Dengan menggunakan layanan FranchiseHub di situs <a href="https://franchisehub.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">https://franchisehub.com</a>, Anda menyetujui syarat dan ketentuan berikut ini:
        </div>
        {/* Isi S&K */}
        {[
          {
            title: "Akun dan Keanggotaan",
            content: "Pengguna wajib mendaftar menggunakan akun Google untuk mengakses layanan FranchiseHub. Anda bertanggung jawab penuh atas keamanan dan aktivitas di akun Anda."
          },
          {
            title: "Kewajiban Franchisor",
            content: "Setiap Franchisor harus memberikan informasi bisnis yang benar, lengkap, dan dokumen hukum yang valid sesuai peraturan pemerintah Indonesia."
          },
          {
            title: "Hak dan Tanggung Jawab Franchisee",
            content: "Franchisee diharapkan melakukan riset mandiri secara menyeluruh sebelum memutuskan investasi franchise, serta memahami sepenuhnya risiko dan potensi keuntungan yang ada."
          },
          {
            title: "Transaksi Pembayaran",
            content: "Semua transaksi pembayaran di FranchiseHub diproses melalui pihak payment gateway terpercaya. FranchiseHub tidak menyimpan informasi sensitif seperti detail kartu kredit atau rekening pengguna."
          },
          {
            title: "Konten dan Interaksi Pengguna",
            content: "FranchiseHub berhak mengelola, menghapus, atau memodifikasi konten pengguna yang melanggar etika, peraturan hukum, atau merugikan pengguna lain."
          },
          {
            title: "Privasi Data",
            content: "Kami berkomitmen melindungi privasi pengguna sesuai dengan Kebijakan Privasi FranchiseHub, yang dapat Anda akses melalui situs ini."
          },
          {
            title: "Kekayaan Intelektual",
            content: "Seluruh konten, merek dagang, logo, desain, kode, dan materi lainnya di FranchiseHub dilindungi oleh Undang-Undang Kekayaan Intelektual. Pengguna dilarang keras menggunakan, mengubah, atau menyebarluaskan tanpa izin tertulis dari pihak FranchiseHub."
          },
          {
            title: "Penafian Risiko Investasi",
            content: "FranchiseHub hanya sebagai platform informasi dan penghubung antara franchisor dan franchisee. Semua keputusan investasi sepenuhnya tanggung jawab pengguna. FranchiseHub tidak bertanggung jawab atas kerugian yang timbul akibat keputusan pengguna yang diambil berdasarkan informasi dalam platform ini."
          },
          {
            title: "Force Majeure",
            content: "FranchiseHub tidak bertanggung jawab atas keterlambatan, kegagalan layanan, atau dampak negatif lainnya akibat situasi di luar kendali, seperti bencana alam, perang, demonstrasi massal, gangguan teknologi, kebijakan pemerintah, atau keadaan darurat nasional."
          },
          {
            title: "Perubahan Ketentuan",
            content: "FranchiseHub berhak untuk memperbarui atau mengubah syarat ini kapan saja. Perubahan berlaku efektif sejak dipublikasikan di halaman ini."
          },
          {
            title: "Pembatasan Tanggung Jawab",
            content: "FranchiseHub tidak bertanggung jawab atas kerugian atau dampak negatif apapun yang timbul dari keputusan investasi pengguna yang didasarkan pada informasi dari platform kami."
          },
          {
            title: "Hukum dan Penyelesaian Sengketa",
            content: "Segala bentuk sengketa yang mungkin terjadi akan diselesaikan secara kekeluargaan terlebih dahulu, jika tidak menemukan kesepakatan akan dilanjutkan melalui pengadilan Indonesia berdasarkan hukum yang berlaku."
          },
          {
            title: "Kontak Kami",
            content: <>Jika memiliki pertanyaan terkait syarat dan ketentuan ini, silakan hubungi kami melalui email <a href="mailto:mesebeng17@gmail.com" className="text-blue-600 underline">mesebeng17@gmail.com</a> <span className="text-gray-500">(Senin–Jumat, pukul 09.00–17.00 WITA)</span>.</>
          }
        ].map((item, idx) => (
          <section
            key={item.title}
            className="relative group rounded-xl hover:bg-blue-50/50 transition px-2"
          >
            <div className="flex items-start gap-4">
              <span className="mt-1 min-w-[34px] h-[34px] flex items-center justify-center bg-blue-100 text-blue-700 font-extrabold rounded-full shadow text-xl">{idx + 1}</span>
              <div>
                <h2 className="font-bold text-lg md:text-xl text-blue-800 mb-1 group-hover:underline">{item.title}</h2>
                <div className="text-gray-700">{item.content}</div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
