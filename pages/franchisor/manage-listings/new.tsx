import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import type { User } from '@supabase/supabase-js';

// --- mapping dokumen hukum & status (bisa dipindah ke lib/legalDocuments.ts) ---
const LEGAL_DOCUMENTS = [
  { key: 'stpw', label: 'STPW (Surat Tanda Pendaftaran Waralaba)' },
  { key: 'legalitas', label: 'Legalitas Badan Usaha (PT/CV, NIB, NPWP)' },
  { key: 'merek', label: 'Sertifikat Merek' },
  { key: 'prospektus', label: 'Prospektus Penawaran' },
  { key: 'perjanjian', label: 'Perjanjian Waralaba' }
] as const;

const LEGAL_STATUSES = [
  { key: 'sudah', label: 'Sudah Memiliki' },
  { key: 'sedang', label: 'Akan/Sedang diurus' }
] as const;

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
    notes: '',
    tags: '',
    logo_file: null as File | null,
    cover_file: null as File | null,
  });
  // State untuk checklist dokumen
  const [legalDocs, setLegalDocs] = useState(
    LEGAL_DOCUMENTS.map(doc => ({ document_type: doc.key, status: '' }))
  );

  // Validasi semua dokumen terisi
  const allDocsFilled = legalDocs.every(doc => !!doc.status);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
      else router.push('/login');
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, files } = target;
    if (type === 'file') {
      setForm((prev) => ({ ...prev, [name]: files![0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const uploadImage = async (file: File, pathPrefix: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${pathPrefix}/${uuidv4()}.${fileExt}`;
    const { error } = await supabase.storage.from('listing-images').upload(fileName, file);
    if (error) {
      alert(`Upload gagal: ${JSON.stringify(error)}`);
      throw error;
    }
    return fileName;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!allDocsFilled) {
      alert('Checklist dokumen hukum harus lengkap!');
      return;
    }
    setLoading(true);

    try {
      // Upload logo & cover ke Supabase Storage
      const logoPath = form.logo_file ? await uploadImage(form.logo_file, 'logo') : null;
      const coverPath = form.cover_file ? await uploadImage(form.cover_file, 'cover') : null;
      const slug = form.franchise_name.toLowerCase().replace(/\s+/g, '-');

      // Insert ke franchise_listings, ambil id-nya
      const { data, error } = await supabase.from('franchise_listings').insert([{
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
        notes: form.notes,
        tags: form.tags,
        slug,
        logo_url: logoPath,
        cover_url: coverPath,
      }]).select('id').single();

      if (error) throw error;

      // Insert checklist dokumen legal
      await Promise.all(
        legalDocs.map(doc =>
          supabase.from('legal_documents').insert({
            listing_id: data.id,
            document_type: doc.document_type,
            status: doc.status
          })
        )
      );

      alert('Listing berhasil ditambahkan!');
      router.push('/franchisor/manage-listings');
    } catch (err: any) {
      console.error('Error saat menambahkan listing:', err);
      alert(`Gagal menambahkan listing. Detail Error: ${JSON.stringify(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Tambah Listing Franchise</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <table className="w-full table-auto border-separate border-spacing-y-4">
          <tbody>
            <tr>
              <td className="w-1/3 font-medium">Nama Franchise</td>
              <td><input required name="franchise_name" value={form.franchise_name} onChange={handleChange} className="input w-full" /></td>
            </tr>
            <tr>
              <td className="font-medium">Kategori</td>
              <td><input required name="category" value={form.category} onChange={handleChange} className="input w-full" /></td>
            </tr>
            <tr>
              <td className="font-medium">Investasi Minimal</td>
              <td>
                <div className="flex items-center gap-2">
                  <span>Rp</span>
                  <input required type="number" name="investment_min" value={form.investment_min} onChange={handleChange} className="input w-full" />
                </div>
              </td>
            </tr>
            <tr>
              <td className="font-medium">Lokasi</td>
              <td><input required name="location" value={form.location} onChange={handleChange} className="input w-full" /></td>
            </tr>
            <tr>
              <td className="font-medium">No WhatsApp</td>
              <td><input required name="whatsapp_contact" value={form.whatsapp_contact} onChange={handleChange} className="input w-full" /></td>
            </tr>
            <tr>
              <td className="font-medium">Email Kontak</td>
              <td><input required name="email_contact" value={form.email_contact} onChange={handleChange} className="input w-full" /></td>
            </tr>
            <tr>
              <td className="font-medium">Website (opsional)</td>
              <td><input name="website_url" value={form.website_url} onChange={handleChange} className="input w-full" /></td>
            </tr>
            <tr>
              <td className="font-medium">Google Maps URL (opsional)</td>
              <td><input name="google_maps_url" value={form.google_maps_url} onChange={handleChange} className="input w-full" /></td>
            </tr>
            <tr>
              <td className="font-medium">Tag</td>
              <td><input name="tags" value={form.tags} onChange={handleChange} className="input w-full" /></td>
            </tr>
            <tr>
              <td className="font-medium align-top pt-2">Deskripsi</td>
              <td><textarea required name="description" value={form.description} onChange={handleChange} className="textarea w-full" rows={4} /></td>
            </tr>
            <tr>
              <td className="font-medium">Mode Operasional</td>
              <td>
                <select required name="operation_mode" value={form.operation_mode} onChange={handleChange} className="select w-full">
                  <option value="">Pilih...</option>
                  <option value="autopilot">Autopilot</option>
                  <option value="semi">Semi Autopilot</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">Autopilot berarti mitra tidak perlu ikut terlibat langsung dalam operasional harian. Semi-autopilot berarti mitra tetap punya peran namun sebagian operasional dibantu tim pusat.</p>
              </td>
            </tr>
            {/* Checklist Dokumen Hukum */}
            <tr>
              <td className="font-medium align-top">Checklist Dokumen Hukum</td>
              <td>
                <div className="flex flex-col gap-2">
                  {LEGAL_DOCUMENTS.map((doc, idx) => (
                    <div key={doc.key} className="flex items-center gap-3">
                      <span className="w-56">{doc.label}</span>
                      {LEGAL_STATUSES.map(status => (
                        <label key={status.key} className="inline-flex items-center mr-4">
                          <input
                            type="radio"
                            name={`doc-status-${doc.key}`}
                            value={status.key}
                            checked={legalDocs[idx].status === status.key}
                            onChange={() => {
                              const next = [...legalDocs];
                              next[idx].status = status.key;
                              setLegalDocs(next);
                            }}
                            required
                          />
                          <span className="ml-1">{status.label}</span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
                {!allDocsFilled && <p className="text-red-500 text-xs mt-2">Semua dokumen harus dipilih statusnya.</p>}
              </td>
            </tr>
            <tr>
              <td className="font-medium">Catatan Tambahan</td>
              <td><textarea name="notes" value={form.notes} onChange={handleChange} className="textarea w-full" rows={3} /></td>
            </tr>
            <tr>
              <td className="font-medium">Upload Logo</td>
              <td><input required type="file" name="logo_file" onChange={handleChange} className="file-input file-input-bordered w-full" /></td>
            </tr>
            <tr>
              <td className="font-medium">Upload Cover</td>
              <td><input required type="file" name="cover_file" onChange={handleChange} className="file-input file-input-bordered w-full" /></td>
            </tr>
          </tbody>
        </table>

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? 'Menyimpan...' : 'Tambah Listing'}
        </button>
      </form>
    </div>
  );
}
