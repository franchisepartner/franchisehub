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
}

export default function FranchisorApprovals() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Modal Pesan
  const [messageModal, setMessageModal] = useState<{
    show: boolean;
    user_id: string;
    value: string;
  }>({ show: false, user_id: '', value: '' });

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

      // Signed URL logo & ktp
      const paths = appsData.flatMap(item => [item.logo_url, item.ktp_url]);
      const { data: signedData } = await supabase.storage
        .from('franchisor-assets')
        .createSignedUrls(paths, 60 * 60);
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

  // Approve
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
      alert('Terjadi kesalahan saat menghubungi server.');
    }
  };

  // Hapus data & file Storage
  const handleReject = async (app: Application) => {
    await supabase.storage.from('franchisor-assets').remove([app.logo_url, app.ktp_url]);
    const { error: delError } = await supabase
      .from('franchisor_applications')
      .delete()
      .eq('user_id', app.user_id);
    if (delError) {
      alert('Gagal menghapus data.');
    } else {
      alert('Data pengajuan berhasil dihapus.');
      setApplications(applications.filter(a => a.user_id !== app.user_id));
    }
  };

  // Buka modal pesan admin, ambil pesan terakhir jika ada
  const openMessageModal = async (user_id: string) => {
    const { data } = await supabase
      .from('admin_messages')
      .select('message')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    setMessageModal({
      show: true,
      user_id,
      value: data?.message || '',
    });
  };

  // Kirim pesan admin (upsert by user_id)
  const handleSaveMessage = async () => {
    const msg = messageModal.value.trim();
    if (!messageModal.user_id) return;
    if (!msg) {
      alert('Isi pesan tidak boleh kosong.');
      return;
    }
    // Upsert pesan (user_id unik)
    const { error } = await supabase
      .from('admin_messages')
      .upsert(
        [{ user_id: messageModal.user_id, message: msg }],
        { onConflict: 'user_id' } // FIX: string, bukan array
      );
    if (!error) {
      alert('Pesan berhasil dikirim.');
      setMessageModal({ show: false, user_id: '', value: '' });
    } else {
      alert('Gagal mengirim pesan: ' + error.message);
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
                  <td className="p-2 border space-y-1">
                    <button 
                      onClick={() => handleApprove(app.user_id, app.email)} 
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded w-full"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleReject(app)} 
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded w-full mt-1"
                    >
                      Hapus Data
                    </button>
                    <button 
                      onClick={() => openMessageModal(app.user_id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded w-full mt-1"
                    >
                      Kirim Pesan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Pesan Admin */}
      {messageModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-xs w-full relative">
            <button
              onClick={() => setMessageModal({ show: false, user_id: '', value: '' })}
              className="absolute top-3 right-3 text-xl text-gray-500 hover:text-red-500"
            >
              ×
            </button>
            <h2 className="text-lg font-semibold mb-2">Pesan untuk User</h2>
            <textarea
              className="w-full p-2 border rounded min-h-[80px] mb-3"
              value={messageModal.value}
              onChange={e => setMessageModal(v => ({ ...v, value: e.target.value }))}
              placeholder="Tulis pesan admin di sini..."
            />
            <button
              className="w-full py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
              onClick={handleSaveMessage}
            >
              Kirim Pesan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
