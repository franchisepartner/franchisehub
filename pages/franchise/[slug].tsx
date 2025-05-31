export default function FranchiseDetailPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Nama Franchise</h1>
      <img src="URL gambar" alt="Logo Franchise" />
      <p className="mt-4">Deskripsi franchise secara lengkap di sini.</p>
      <table className="mt-4">
        <tr>
          <th>Investasi Minimal</th>
          <td>Rp. [jumlah investasi minimal]</td>
        </tr>
        <tr>
          <th>Lokasi Usaha</th>
          <td>[Lokasi]</td>
        </tr>
        <tr>
          <th>Mode Operasi</th>
          <td>[Autopilot / Semi Autopilot]</td>
        </tr>
        <tr>
          <th>Status Dokumen Hukum</th>
          <td>
            <span>Sudah Punya ✅</span> atau <span>Akan Diurus 🕒</span>
          </td>
        </tr>
      </table>

      <div className="mt-4">
        <button className="bg-green-500 text-white px-4 py-2 rounded">Lihat Kontak (Login untuk membuka)</button>
      </div>
    </div>
  )
}
