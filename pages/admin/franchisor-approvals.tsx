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
  status: string;
  admin_message?: string;
}

export default function FranchisorApprovals() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [messageDraft, setMessageDraft] = useState<Record<string, string>>({}); // Untuk edit pesan

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData?.user;
      if (userError || !user) {
        setErrorMessage('Gagal mengambil data pengguna.');
        setIsAuthorized(false);
        setLoading(false);
        router.push('/');
        return;
      }
      // Validasi admin
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      if (profileError || !profileData?.is_admin) {
        setIsAuthorized(false);
        setLoading(false);
        router.push('/');
        return;
      }
      setIsAuthorized(true);

      // Ambil semua pengajuan pending
      const { data: appsData, error: appsError } = await supabase
        .from('franchisor_applications')
        .select('*')
        .eq('status', 'pending');
      if (appsError || !appsData) {
        setErrorMessage('Gagal memuat data pengajuan.');
        setLoading(false);
        return;
      }
      setApplications(appsData);

      // Siapkan draft pesan
      const draft: Record<string, string> = {};
      appsData.forEach((app: Application) => {
        draft[app.id] = app.admin_message || '';
      });
      setMessageDraft(draft);

      // Buat signed URL
      const paths = appsData.flatMap(item => [item.logo_url, item.ktp_url]);
      const { data: signedData } = await supabase.storage
        .from('franchisor-assets')
        .createSignedUrls(paths, 60 * 60);  // 1 jam
      const urls: Record<string, string> = {};
      signedData?.forEach(obj => {
        if (obj.path && obj.signedUrl) {
          urls[obj.path] = obj.signedUrl;
        }
      });
      setImageUrls(urls);
      setLoading(false);
    };
    fetchData();
  }, [router]);

  // Handler Approve
  const handleApprove = async (user_id: string, email: string) => {
    try {
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
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menghubungi server.');
    }
  };

  // Handler Reject (hapus data + file Storage)
  const handleReject = async (app: Application) => {
    // Hapus file logo & KTP dari Storage (opsional, boleh hapus jika tidak mau)
    await supabase.storage.from('franchisor-assets').remove([app.logo_url, app.ktp_url]);
    // Hapus data dari DB
    const { error: rejectError } = await supabase
      .from('franchisor_applications')
      .delete()
      .eq('user_id', app.user_id);
    if (rejectError) {
      alert('Gagal menghapus data.');
    } else {
      alert('Data pengajuan berhasil dihapus.');
      setApplications(applications.filter(a => a.user_id !== app.user_id));
    }
  };

  // Simpan pesan admin
  const handleSaveMessage = async (app: Application) => {
    const msg = messageDraft[app.id]?.trim() || '';
    const { error } = await supabase
      .from('franchisor_applications')
      .update({ admin_message: msg })
      .eq('id', app.id);
    if (!error) {
      alert('Pesan disimpan.');
      setApplications(applications.map(a => a.id === app.id ? { ...a, admin_message: msg } : a));
    } else {
      alert('Gagal menyimpan pesan.');
    }
  };

  if (loading) return <p>Memuat...</p>;
  if (!isAuthorized) return <p className="text-red-500">Tidak memiliki akses.</p>;
  if (errorMessage) return <p className="text-red-500">{errorMessage}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard Administrator: Persetujuan Franchisor</h1>
      {applications.length === 0 ? (
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
                <th className="p-2 border">Pesan Admin</th>
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
                          className="w-10 h-10 object-cover mx-auto rounded" 
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
                          className="w-10 h-10 object-cover mx-auto rounded" 
                        />
                      </a>
                    ) : (
                      'Memuat...'
                    )}
                  </td>
                  <td className="p-2 border">
                    <textarea
                      className="w-40 p-1 rounded border border-gray-200 text-xs"
                      rows={2}
                      value={messageDraft[app.id] ?? ''}
                      onChange={e => setMessageDraft(m => ({ ...m, [app.id]: e.target.value }))}
                      placeholder="Pesan untuk user (opsional)..."
                    />
                    <button
                      onClick={() => handleSaveMessage(app)}
                      className="block w-full mt-1 bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 rounded"
                    >
                      Simpan Pesan
                    </button>
                  </td>
                  <td className="p-2 border space-x-1">
                    <button 
                      onClick={() => handleApprove(app.user_id, app.email)} 
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mr-1"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleReject(app)} 
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
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
