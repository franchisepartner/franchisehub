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
  status?: string;
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
      // Cek status login user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData?.user;
      if (userError || !user) {
        setErrorMessage('Gagal mengambil data pengguna.');
        setIsAuthorized(false);
        setLoading(false);
        router.push('/');
        return;
      }
      // Validasi apakah user adalah admin
      const { data: adminCheck, error: adminError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      if (adminError || !adminCheck?.is_admin) {
        setIsAuthorized(false);
        setLoading(false);
        router.push('/');
        return;
      }
      setIsAuthorized(true);

      // Ambil data semua pengajuan franchisor yang statusnya pending
      const { data, error: dataError } = await supabase
        .from('franchisor_applications')
        .select('*')
        .eq('status', 'pending');
      if (dataError || !data) {
        setErrorMessage('Gagal memuat data pengajuan.');
        setLoading(false);
        return;
      }
      setApplications(data);

      // Dapatkan URL tanda tangan (signed URLs) untuk logo dan KTP dari bucket private
      const paths = data.flatMap(item => [item.logo_url, item.ktp_url]);
      const { data: signedData, error: signedError } = await supabase.storage
        .from('franchisor-assets')
        .createSignedUrls(paths, 3600);
      if (signedError) {
        console.error('Error createSignedUrls:', signedError);
      }
      const urls: Record<string, string> = {};
      signedData?.forEach(obj => {
        if (obj?.path && obj.signedUrl) {
          urls[obj.path] = obj.signedUrl;
        }
      });
      setImageUrls(urls);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  // Fungsi untuk menangani persetujuan franchisor
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

  // Fungsi untuk menangani penolakan franchisor
  const handleReject = async (user_id: string) => {
    const { error: rejectError } = await supabase
      .from('franchisor_applications')
      .update({ status: 'rejected' })
      .eq('user_id', user_id);
    if (rejectError) {
      alert('Gagal reject.');
    } else {
      alert('Berhasil reject.');
      router.reload();
    }
  };

  if (isAuthorized === false) {
    return null;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard Administrator: Persetujuan Franchisor</h1>

      {loading ? (
        <p>Memuat...</p>
      ) : errorMessage ? (
        <p className="text-red-500">{errorMessage}</p>
      ) : applications.length === 0 ? (
        <p>Tidak ada pengajuan franchisor yang pending.</p>
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
              {applications.map(app => (
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
                        <img
                          src={imageUrls[app.logo_url]}
                          alt="Logo"
                          className="w-10 h-10 object-cover mx-auto"
                        />
                      </a>
                    ) : (
                      'Memuat...'
                    )}
                  </td>
                  <td className="p-2 border">
                    {imageUrls[app.ktp_url] ? (
                      <a href={imageUrls[app.ktp_url]} target="_blank" rel="noopener noreferrer">
                        <img
                          src={imageUrls[app.ktp_url]}
                          alt="KTP"
                          className="w-10 h-10 object-cover mx-auto"
                        />
                      </a>
                    ) : (
                      'Memuat...'
                    )}
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
