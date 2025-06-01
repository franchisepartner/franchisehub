import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import type { User } from '@supabase/supabase-js';

export default function NewListing() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    franchise_name: '',
    description: '',
    category: '',
    investment_min: '',
    location: '',
    operation_mode: '',
    whatsapp_contact: '',
    email_contact: '',
    website_url: '',
    google_maps_url: '',
    dokumen_hukum_sudah_punya: false,
    dokumen_hukum_akan_diurus: false,
    notes: '',
    tags: '',
    logo_file: null,
    cover_file: null,
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
      else router.push('/login');
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked, files } = target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setForm((prev) => ({ ...prev, [name]: files![0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const uploadImage = async (file: File, pathPrefix: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${pathPrefix}/${uuidv4()}.${fileExt}`;
    const { error } = await supabase.storage.from('listing-images').upload(fileName, file);
    if (error) throw error;
    return fileName;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user?.id) {
      alert('User tidak terdeteksi. Silakan login ulang.');
      return;
    }

    if (!form.franchise_name || !form.category || !form.investment_min || isNaN(parseInt(form.investment_min))) {
      alert('Pastikan semua kolom wajib telah diisi dan investasi minimal berupa angka.');
      return;
    }
    e.preventDefault();
    setLoading(true);

    try {
      const logoPath = form.logo_file ? await uploadImage(form.logo_file, 'logo') : null;
      const coverPath = form.cover_file ? await uploadImage(form.cover_file, 'cover') : null;

      const slug = form.franchise_name.toLowerCase().replace(/\s+/g, '-');

      const { error } = await supabase.from('franchise_listings').insert({
        user_id: user?.id,
        franchise_name: form.franchise_name,
        description: form.description,
        category: form.category,
        investment_min: parseInt(form.investment_min),
        location: form.location,
        operation_mode: form.operation_mode,
        whatsapp_contact: form.whatsapp_contact,
        email_contact: form.email_contact,
        website_url: form.website_url,
        google_maps_url: form.google_maps_url,
        dokumen_hukum_sudah_punya: form.dokumen_hukum_sudah_punya,
        dokumen_hukum_akan_diurus: form.dokumen_hukum_akan_diurus,
        notes: form.notes,
        tags: form.tags,
        slug,
        logo_url: logoPath,
        cover_url: coverPath,
      });

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      alert('Listing berhasil ditambahkan');
      router.push('/franchisor/manage-listings');
    } catch (err) {
      console.error(err);
      alert('Gagal menambahkan listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Tambah Listing Franchise</h1>
      {/* form disembunyikan di sini untuk singkat */}
    </div>
  );
}
