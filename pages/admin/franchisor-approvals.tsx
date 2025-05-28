// pages/admin/franchisor-approvals.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

interface Application {
  id: string;
  user_id: string;
  email: string;
  brand_name: string;
  description: string;
  category: string;
  location: string;
  whatsapp_number: string;
  logo_url: string;
  ktp_url: string;
}

export default function FranchisorApprovals() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error('Auth error:', userError);
          setErrorMessage('Gagal mengambil data pengguna.');
          setLoading(false);
          return;
        }

        if (!user || user.user_metadata?.role !== 'administrator') {
          setIsAuthorized(false);
          setLoading(false);
          router.push('/');
          return;
        }

        setIsAuthorized(true);

        const { data, error: dataError } = await supabase
          .from('franchisor_applications')
          .select('*')
          .eq('status', 'pending');

        if (dataError) {
          console.error('Data error:', dataError);
          setErrorMessage('Gagal memuat data pengajuan.');
          setLoading(false);
          return;
        }

        console.log('Fetched Applications:', data);
        setApplications(data);

        const paths = data.flatMap((item) => [item.logo_url, item.ktp_url]);
        const { data: signedData, error: signedUrlError } = await supabase.storage
          .from('franchisor-assets')
          .createSignedUrls(paths, 3600);

        if (signedUrlError) {
          console.error('Signed URL error:', signedUrlError);
        }

        const urls: Record<string, string> = {};
        signedData?.forEach((obj) => {
          if (obj?.path && obj?.signedUrl) {
            urls[obj.path] = obj.signedUrl;
          }
        });

        setImageUrls(urls);
        setLoading(false);
      } catch (e: any) {
        console.error('Unexpected error:', e);
        setErrorMessage('Terjadi kesalahan tak terduga.');
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleApprove = async (user_id: string, email: string) => {
    const res = await fetch('/api/admin/approve-franchisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, email }),
    });

    const result = await res.json();
    if (result.success) {
      alert('Berhasil approve.');
      router.reload();
    } else {
      alert('Gagal approve: ' + result.message);
    }
  };

  const handleReject = async (user_id: string) => {
    const { error } = await supabase
      .from('franchisor_applications')
      .delete()
      .eq('user_id', user_id);

    if (error) {
      alert('Gagal reject.');
    } else {
      alert('Berhasil reject.');
      router.reload();
    }
  };

  if (isAuthorized === false) return null;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Dashboard Administrator: Persetujuan Franchisor
      </h1>

      {loading ? (
        <p>Memuat...</p>
      ) : errorMessage ? (
        <p className="text-red-500">{errorMessage}</p>
      ) : applications.length === 0 ? (
        <p className="text-gray-500">Tidak ada pengajuan franchisor yang pending.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
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
                <tr key={app.id} className="text-center">
                  <td className="p-2 border">{app.brand_name}</td>
                  <td className="p-2 border">{app.description}</td>
                  <td className="p-2 border">{app.email}</td>
                  <td className="p-2 border">{app.whatsapp_number}</td>
                  <td className="p-2 border">{app.category}</td>
                  <td className="p-2 border">{app.location}</td>
                  <td className="p-2 border">
                    {imageUrls[app.logo_url] ? (
                      <a href={imageUrls[app.logo_url]} target="_blank" rel="noopener noreferrer">
                        <img src={imageUrls[app.logo_url]} alt="Logo" className="w-10 h-10 object-cover mx-auto" />
                      </a>
                    ) : 'Memuat...'}
                  </td>
                  <td className="p-2 border">
                    {imageUrls[app.ktp_url] ? (
                      <a href={imageUrls[app.ktp_url]} target="_blank" rel="noopener noreferrer">
                        <img src={imageUrls[app.ktp_url]} alt="KTP" className="w-10 h-10 object-cover mx-auto" />
                      </a>
                    ) : 'Memuat...'}
                  </td>
                  <td className="p-2 border">
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded mr-2"
                      onClick={() => handleApprove(app.user_id, app.email)}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                      onClick={() => handleReject(app.user_id)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
