import { useState, useEffect } from 'react';

type FranchisorApplication = {
  id: number;
  user_id: string;
  name: string;
  email: string;
  document: string;
};

export default function AdminFranchisorApprovals() {
  const [applications, setApplications] = useState<FranchisorApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ambil data pengajuan franchisor
  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/franchisor-applications');
      if (!res.ok) throw new Error('Gagal mengambil data pengajuan franchisor');
      const data: FranchisorApplication[] = await res.json();
      setApplications(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengambil data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (user_id: string, email: string) => {
    try {
      const res = await fetch('/api/admin/approve-franchisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, email }),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        throw new Error(result.message || 'Gagal approve franchisor');
      }
      alert('Berhasil approve franchisor');
      fetchApplications();
    } catch (err: any) {
      alert('Gagal approve franchisor: ' + err.message);
    }
  };

  // Fungsi reject bisa dibuat serupa (kamu tinggal buat API reject nya)
  const handleReject = async (user_id: string, email: string) => {
    try {
      const res = await fetch('/api/admin/reject-franchisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, email }),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        throw new Error(result.message || 'Gagal reject franchisor');
      }
      alert('Berhasil menolak pengajuan franchisor');
      fetchApplications();
    } catch (err: any) {
      alert('Gagal reject franchisor: ' + err.message);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Daftar Pengajuan Franchisor</h1>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-2 text-left">Nama</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Dokumen</th>
              <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id || app.user_id} className="border-b">
                <td className="px-4 py-2">{app.name}</td>
                <td className="px-4 py-2">{app.email}</td>
                <td className="px-4 py-2">
                  {app.document ? (
                    <a href={app.document} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      Lihat Dokumen
                    </a>
                  ) : (
                    <span className="text-gray-500">Tidak ada dokumen</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleApprove(app.user_id, app.email)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mr-2"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(app.user_id, app.email)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
