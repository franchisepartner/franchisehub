// pages/admin/dashboard.tsx
import { useState, useEffect } from 'react';

interface Application {
  id: string;
  name: string;
  email: string;
  company_name: string; // sesuaikan field dengan tabel Anda
  // tambahkan field lain sesuai kebutuhan
}

export default function Dashboard() {
  const [applications, setApplications] = useState<Application[]>([]);

  // Fungsi untuk mengambil data pengajuan dari API
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

  // Fungsi untuk approve
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
        fetchApplications(); // refresh data
      } else {
        alert(result.error || 'Gagal menyetujui pengajuan.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat memproses permintaan.');
    }
  }

  // Fungsi untuk reject
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
        fetchApplications(); // refresh data
      } else {
        alert(result.error || 'Gagal menolak pengajuan.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat memproses permintaan.');
    }
  }

  return (
    <div>
      <h1>Dashboard Admin</h1>
      <table>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Email</th>
            <th>Perusahaan</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(app => (
            <tr key={app.id}>
              <td>{app.name}</td>
              <td>{app.email}</td>
              <td>{app.company_name}</td>
              <td>
                <button onClick={() => handleApprove(app.id)}>Approve</button>
                <button onClick={() => handleReject(app.id)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
