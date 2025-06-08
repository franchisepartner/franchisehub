import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Application {
  id: string;
  name: string;
  email: string;
  company_name: string;
}

export default function Dashboard() {
  const [applications, setApplications] = useState<Application[]>([]);

  async function fetchApplications() {
    try {
      const res = await fetch('/api/admin/franchisor-applications');
      const data: Application[] = await res.json();
      setApplications(data);
    } catch (err) {
      console.error('Fetch error:', err);
      alert('Gagal mengambil data.');
    }
  }

  useEffect(() => {
    fetchApplications();
  }, []);

  async function handleApprove(id: string) {
    try {
      const res = await fetch('/api/admin/approve-franchisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (res.ok) {
        alert(result.message);
        fetchApplications();
      } else {
        alert(result.error || 'Gagal menyetujui pengajuan.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat memproses permintaan.');
    }
  }

  async function handleReject(id: string) {
    try {
      const res = await fetch('/api/admin/reject-franchisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (res.ok) {
        alert(result.message);
        fetchApplications();
      } else {
        alert(result.error || 'Gagal menolak pengajuan.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat memproses permintaan.');
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard Administrator</h1>
      
      {/* Tombol Kelola Banner */}
      <div className="mb-6 flex gap-3">
        <Link href="/admin/manage-homepage-banners">
          <a className="flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow">
            <span className="mr-2 text-xl">🎨</span>
            Kelola Banner Homepage
          </a>
        </Link>
        {/* Tambah tombol admin lain jika butuh */}
      </div>

      <div className="bg-white rounded-xl shadow p-6 overflow-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Nama</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Perusahaan</th>
              <th className="px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app.id} className="border-t">
                <td className="px-4 py-2">{app.name}</td>
                <td className="px-4 py-2">{app.email}</td>
                <td className="px-4 py-2">{app.company_name}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => handleApprove(app.id)}
                    className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(app.id)}
                    className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-500 py-6">
                  Tidak ada pengajuan franchisor yang menunggu persetujuan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
