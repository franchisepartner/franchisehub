// pages/admin/franchisor-approvals.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY! // Jangan bocorkan ke client-side!
);

interface Application {
  id: number;
  user_id: string;
  brand_name: string;
  description: string;
  email: string;
  whatsapp_number: string;
  website: string;
  logo_url: string;
  ktp_url: string;
  category: string;
  location: string;
  status: string;
}

export default function FranchisorApprovals() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('franchisor_applications')
      .select('*');
    if (data) {
      setApplications(data);
      generateSignedUrls(data);
    }
    if (error) console.error(error);
  };

  const generateSignedUrls = async (apps: Application[]) => {
    const urls: Record<string, string> = {};
    for (const app of apps) {
      const logoPath = app.logo_url;
      const ktpPath = app.ktp_url;

      const { data: logoData } = await supabase.storage
        .from('franchisor-assets')
        .createSignedUrl(logoPath, 60 * 60);

      const { data: ktpData } = await supabase.storage
        .from('franchisor-assets')
        .createSignedUrl(ktpPath, 60 * 60);

      if (logoData?.signedUrl) {
        urls[`logo-${app.id}`] = logoData.signedUrl;
      }
      if (ktpData?.signedUrl) {
        urls[`ktp-${app.id}`] = ktpData.signedUrl;
      }
    }
    setImageUrls(urls);
  };

  const updateStatus = async (
    id: number,
    user_id: string,
    status: string
  ) => {
    if (status === 'approved') {
      await supabase.auth.admin.updateUserById(user_id, {
        user_metadata: { role: 'Franchisor' },
      });
    }

    if (status === 'rejected') {
      await supabase
        .from('franchisor_applications')
        .delete()
        .eq('user_id', user_id);
    } else {
      await supabase
        .from('franchisor_applications')
        .update({ status })
        .eq('id', id);
    }

    fetchApplications();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Persetujuan Franchisor</h1>
      <table className="min-w-full table-auto border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2">Brand</th>
            <th className="border px-3 py-2">Deskripsi</th>
            <th className="border px-3 py-2">Email</th>
            <th className="border px-3 py-2">WhatsApp</th>
            <th className="border px-3 py-2">Kategori</th>
            <th className="border px-3 py-2">Lokasi</th>
            <th className="border px-3 py-2">Logo</th>
            <th className="border px-3 py-2">KTP</th>
            <th className="border px-3 py-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td className="border px-3 py-2">{app.brand_name}</td>
              <td className="border px-3 py-2">{app.description}</td>
              <td className="border px-3 py-2">{app.email}</td>
              <td className="border px-3 py-2">{app.whatsapp_number}</td>
              <td className="border px-3 py-2">{app.category}</td>
              <td className="border px-3 py-2">{app.location}</td>
              <td className="border px-3 py-2">
                {imageUrls[`logo-${app.id}`] ? (
                  <a href={imageUrls[`logo-${app.id}`]} target="_blank">
                    <img
                      src={imageUrls[`logo-${app.id}`]}
                      alt="Logo"
                      className="w-12 h-12 object-contain"
                    />
                  </a>
                ) : (
                  'Memuat...'
                )}
              </td>
              <td className="border px-3 py-2">
                {imageUrls[`ktp-${app.id}`] ? (
                  <a href={imageUrls[`ktp-${app.id}`]} target="_blank">
                    <img
                      src={imageUrls[`ktp-${app.id}`]}
                      alt="KTP"
                      className="w-12 h-12 object-contain"
                    />
                  </a>
                ) : (
                  'Memuat...'
                )}
              </td>
              <td className="border px-3 py-2 flex gap-2">
                <button
                  onClick={() =>
                    updateStatus(app.id, app.user_id, 'approved')
                  }
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    updateStatus(app.id, app.user_id, 'rejected')
                  }
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
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
