import { useEffect, useState } from 'react';

type FranchisorApplication = {
  id: number;
  user_id: string;
  name: string;
  email: string;
  document: string;
  status: string;
  created_at: string;
};

export default function FranchisorApprovals() {
  const [applications, setApplications] = useState<FranchisorApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/franchisor-applications');
    const data = await res.json();
    setApplications(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (user_id: string) => {
    const res = await fetch('/api/admin/approve-franchisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id }),
    });
    if (res.ok) {
      alert('Berhasil approve');
      fetchApplications();
    } else {
      alert('Gagal approve');
    }
  };

  const handleReject = async (user_id: string) => {
    const res = await fetch('/api/admin/reject-franchisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id }),
    });
    if (res.ok) {
      alert('Berhasil reject');
      fetchApplications();
    } else {
      alert('Gagal reject');
    }
  };

  return (
    <div>
      <h1>Franchisor Applications</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Document</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td>{app.name}</td>
                <td>{app.email}</td>
                <td>
                  {app.document ? (
                    <a href={app.document} target="_blank" rel="noopener noreferrer">
                      Lihat
                    </a>
                  ) : (
                    'Tidak ada'
                  )}
                </td>
                <td>{app.status}</td>
                <td>{new Date(app.created_at).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleApprove(app.user_id)}>Approve</button>
                  <button onClick={() => handleReject(app.user_id)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
