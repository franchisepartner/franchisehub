// pages/franchisor/panduan-waralaba.tsx
export default function PanduanWaralaba() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Panduan Regulasi Waralaba di Indonesia</h1>
      <p className="mb-6 text-gray-700">
        Berikut adalah daftar lengkap peraturan perundang-undangan yang mengatur waralaba di Indonesia, diurutkan dari yang terbaru hingga terlama.
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left border-b">Peraturan</th>
              <th className="p-3 text-left border-b">Ringkasan Isi/Poin Penting</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 align-top font-semibold">Peraturan Pemerintah No. 35 Tahun 2024 tentang Waralaba</td>
              <td className="p-3">PP terbaru: kriteria waralaba, STPW, penggunaan produk dalam negeri, sanksi, dsb. Mengganti PP 42/2007.</td>
            </tr>
            <tr>
              <td className="p-3 align-top font-semibold">Permendag No. 71 Tahun 2019 tentang Penyelenggaraan Waralaba</td>
              <td className="p-3">Wajib STPW, penunjukan master franchise, kemitraan UMKM, 80% produk dalam negeri, penyederhanaan aturan.</td>
            </tr>
            <tr>
              <td className="p-3 align-top font-semibold">Permendag No. 58/M-DAG/PER/9/2014 Tahun 2014</td>
              <td className="p-3">Maksimal 250 gerai makanan/minuman oleh franchisor, selebihnya wajib kemitraan.</td>
            </tr>
            <tr>
              <td className="p-3 align-top font-semibold">Permendag No. 57/M-DAG/PER/9/2014 Tahun 2014</td>
              <td className="p-3">Sederhanakan prosedur pendaftaran STPW, prospektus, pelaporan tahunan.</td>
            </tr>
            <tr>
              <td className="p-3 align-top font-semibold">Undang-Undang No. 7 Tahun 2014 tentang Perdagangan</td>
              <td className="p-3">UU utama waralaba: pendaftaran wajib, perjanjian tertulis, perlindungan hak franchisee, kemitraan UMKM.</td>
            </tr>
            <tr>
              <td className="p-3 align-top font-semibold">Permendag No. 07/M-DAG/PER/2/2013 Tahun 2013</td>
              <td className="p-3">Aturan khusus restoran/food franchise: batas 250 outlet, wajib kemitraan, pelaporan struktur kemitraan.</td>
            </tr>
            <tr>
              <td className="p-3 align-top font-semibold">Permendag No. 68/M-DAG/PER/10/2012 Tahun 2012</td>
              <td className="p-3">Batas 150 gerai toko modern, wajib kemitraan setelah itu, minimal 80% produk dalam negeri.</td>
            </tr>
            <tr>
              <td className="p-3 align-top font-semibold">Permendag No. 53/M-DAG/PER/8/2012 Tahun 2012</td>
              <td className="p-3">Persyaratan waralaba, ciri khas usaha, perjanjian, pelatihan, laporan, STPW wajib.</td>
            </tr>
            <tr>
              <td className="p-3 align-top font-semibold">Permendag No. 31/M-DAG/PER/8/2008 Tahun 2008</td>
              <td className="p-3">Pelaksanaan waralaba, wajib daftar prospektus dan perjanjian, sanksi administratif.</td>
            </tr>
            <tr>
              <td className="p-3 align-top font-semibold">Peraturan Pemerintah No. 42 Tahun 2007 tentang Waralaba</td>
              <td className="p-3">Kriteria waralaba, perjanjian wajib, STPW, penggunaan produk dalam negeri, pengawasan, sanksi. (Dicabut oleh PP 35/2024)</td>
            </tr>
            <tr>
              <td className="p-3 align-top font-semibold">Permendag No. 12/M-DAG/PER/3/2006 Tahun 2006</td>
              <td className="p-3">Prosedur penerbitan STPW, daftar perjanjian, lampiran dokumen, perpanjangan.</td>
            </tr>
            <tr>
              <td className="p-3 align-top font-semibold">Peraturan Pemerintah No. 16 Tahun 1997 tentang Waralaba</td>
              <td className="p-3">Dasar hukum waralaba, wajib pelatihan franchisee, pendaftaran, jangka waktu minimal 5 tahun.</td>
            </tr>
            <tr>
              <td className="p-3 align-top font-semibold">Kepmenperindag No. 259/MPP/Kep/7/1997 Tahun 1997</td>
              <td className="p-3">Tata cara pendaftaran waralaba, STPW, prioritas untuk usaha kecil, perjanjian dalam Bahasa Indonesia.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-8 text-gray-500 text-sm">
        Sumber: Kementerian Perdagangan RI, BPK RI, JDIH Kemendag
      </div>
    </div>
  );
}
