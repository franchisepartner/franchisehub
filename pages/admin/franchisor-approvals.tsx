// pages/admin/franchisor-approvals.tsx

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/router';

interface Application {
  id: string;
  user_id: string;
  email: string;
  brand_name: string;
  description: string;
  whatsapp_number: string;
  category: string;
  location: string;
  logo_url: string;
  ktp_url: string;
  status: string;
}

export default function FranchisorApprovals() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user || user.user?.user_metadata.role !== 'administrator') {
      router.push('/');
      return;
    }

    const { data, error } = await supabase
      .from('franchisor_applications')
      .select('*')
      .eq('status', 'pending');

    if (error || !data) return;

    setApplications(data);

    const filePaths = data.flatMap(app => [app.logo_url, app.ktp_url]);
    const response = await fetch('/api/admin/get-signed-urls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths: filePaths }),
    });

    const signedData = await response.json();
    const urls: Record<string, string> = {};
    signedData?.forEach((obj: any) => {
      if (obj?.path && obj?.signedUrl) urls[obj.path] = obj.signedUrl;
    });

    setImageUrls(urls);
    setLoading(false);
  };

  const handleApprove = async (user_id: string, email: string) => {
    const res = await fetch('/api/admin/approve-franchisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, email }),
    });

    const result = await res.json();
    if (result.success) {
      alert('Berhasil approve.');
      fetchApplications();
    } else {
      alert('Gagal approve.');
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase.from('franchisor_applications').delete().eq('id', id);
    if (error) {
      alert('Gagal reject.');
    } else {
      alert('Berhasil reject.');
      fetchApplications();
    }
  };

  if (loading) return <p>Memuat data...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Administrator: Persetujuan Franchisor</h1>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Brand</th>
            <th className="p-2 border">Deskripsi</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">WhatsApp</th>
            <th className="p-2 border">Kategori</th>
            <th className="p-2 border">Lokasi</th>
            <th className="p-2 border">Logo</th>
            <th className="p-2 border">KTP</th>
            <th className="p-2 border">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td className="p-2 border">{app.brand_name}</td>
              <td className="p-2 border">{app.description}</td>
              <td className="p-2 border">{app.email}</td>
              <td className="p-2 border">{app.whatsapp_number}</td>
              <td className="p-2 border">{app.category}</td>
              <td className="p-2 border">{app.location}</td>
              <td className="p-2 border">
                {imageUrls[app.logo_url] ? (
                  <a href={imageUrls[app.logo_url]} target="_blank" rel="noopener noreferrer">
                    <img src={imageUrls[app.logo_url]} alt="Logo" className="h-12" />
                  </a>
                ) : 'Memuat...'}
              </td>
              <td className="p-2 border">
                {imageUrls[app.ktp_url] ? (
                  <a href={imageUrls[app.ktp_url]} target="_blank" rel="noopener noreferrer">
                    <img src={imageUrls[app.ktp_url]} alt="KTP" className="h-12" />
                  </a>
                ) : 'Memuat...'}
              </td>
              <td className="p-2 border space-x-1">
                <button
                  onClick={() => handleApprove(app.user_id, app.email)}
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(app.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
