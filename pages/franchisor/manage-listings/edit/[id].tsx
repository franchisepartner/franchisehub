import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

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

export default function EditListing() {
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
    logo_url: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showcaseImages, setShowcaseImages] = useState<{ url: string; name: string; id: number; image_url: string }[]>([]);
  const [newShowcaseFiles, setNewShowcaseFiles] = useState<File[]>([]);
  const [legalDocs, setLegalDocs] = useState<{ id: number; document_type: string; status: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { id } = router.query;

  // Fetch listing, showcase, dokumen hukum
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      // Listing
      const { data, error } = await supabase
        .from('franchise_listings')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) {
        alert('Error fetching data');
        return;
      }
      setForm({
        franchise_name: data.franchise_name || '',
        description: data.description || '',
        category: data.category || '',
        investment_min: data.investment_min ? String(data.investment_min) : '',
        location: data.location || '',
        operation_mode: data.operation_mode || '',
        whatsapp_contact: data.whatsapp_contact || '',
        email_contact: data.email_contact || '',
        website_url: data.website_url || '',
        google_maps_url: data.google_maps_url || '',
        notes: data.notes || '',
        tags: data.tags || '',
        logo_url: data.logo_url || '',
      });

      // Showcase
      const { data: images } = await supabase
        .from('listing_images')
        .select('id, image_url')
        .eq('listing_id', id)
        .order('id');
      if (images) {
        setShowcaseImages(
          images.map((img) => ({
            id: img.id,
            image_url: img.image_url,
            url: supabase.storage.from('listing-images').getPublicUrl(img.image_url).data.publicUrl,
            name: img.image_url.split('/').pop(),
          }))
        );
      }

      // Dokumen Hukum
      const { data: docs } = await supabase
        .from('legal_documents')
        .select('id, document_type, status')
        .eq('listing_id', id);
      setLegalDocs(
        LEGAL_DOCUMENTS.map(doc => {
          const found = (docs || []).find(d => d.document_type === doc.key);
          return {
            id: found?.id,
            document_type: doc.key,
            status: found?.status || '',
          }
        })
      );
    };
    fetchData();
  }, [id]);

  // Handler form utama
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setLogoFile(e.target.files[0]);
  };

  // Showcase baru
  const handleNewShowcaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewShowcaseFiles(files.slice(0, Math.max(0, 5 - showcaseImages.length)));
  };

  // Hapus gambar showcase satuan
  const handleDeleteShowcase = async (imgId: number) => {
    if (!window.confirm('Hapus gambar ini dari showcase?')) return;
    setLoading(true);
    await supabase.from('listing_images').delete().eq('id', imgId);
    setShowcaseImages(prev => prev.filter(img => img.id !== imgId));
    setLoading(false);
  };

  // Handler edit dokumen hukum
  const handleLegalDocChange = (idx: number, status: string) => {
    setLegalDocs(prev => {
      const next = [...prev];
      next[idx].status = status;
      return next;
    });
  };

  const uploadLogoImage = async (file: File) => {
    const ext = file.name.split('.').pop();
    const fileName = `logo/${uuidv4()}.${ext}`;
    const { error } = await supabase.storage.from('listing-images').upload(fileName, file);
    if (error) throw error;
    return fileName;
  };

  const uploadShowcaseImage = async (file: File) => {
    const ext = file.name.split('.').pop();
    const fileName = `showcase/${uuidv4()}.${ext}`;
    const { error } = await supabase.storage.from('listing-images').upload(fileName, file);
    if (error) throw error;
    return fileName;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      let logoPath = form.logo_url;
      if (logoFile) {
        logoPath = await uploadLogoImage(logoFile);
      }
      // 1. Update listing
      const { error } = await supabase
        .from('franchise_listings')
        .update({
          ...form,
          investment_min: parseInt(form.investment_min),
          logo_url: logoPath,
        })
        .eq('id', id);
      if (error) throw error;

      // 2. Upload showcase baru jika ada (max 5 total)
      if (newShowcaseFiles.length > 0 && showcaseImages.length < 5) {
        const left = 5 - showcaseImages.length;
        for (const file of newShowcaseFiles.slice(0, left)) {
          const url = await uploadShowcaseImage(file);
          await supabase.from('listing_images').insert({
            listing_id: id,
            image_url: url,
            type: 'showcase',
          });
        }
      }

      // 3. Update dokumen hukum satuan
      for (const doc of legalDocs) {
        if (!doc.id) continue;
        await supabase
          .from('legal_documents')
          .update({ status: doc.status })
          .eq('id', doc.id);
      }

      alert('Listing berhasil diupdate!');
      router.push('/franchisor/manage-listings');
    } catch (err: any) {
      alert('Error updating listing: ' + JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Edit Listing Franchise</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="franchise_name" placeholder="Nama Franchise" required className="border p-2 w-full rounded"
          onChange={handleChange} value={form.franchise_name} />
        <textarea name="description" placeholder="Deskripsi" required className="border p-2 w-full rounded"
          onChange={handleChange} value={form.description} rows={3} />
        <input name="category" placeholder="Kategori" required className="border p-2 w-full rounded"
          onChange={handleChange} value={form.category} />
        <input name="investment_min" placeholder="Investasi Minimal" type="number" required className="border p-2 w-full rounded"
          onChange={handleChange} value={form.investment_min} />
        <input name="location" placeholder="Lokasi" required className="border p-2 w-full rounded"
          onChange={handleChange} value={form.location} />
        <select name="operation_mode" required className="border p-2 w-full rounded"
          onChange={handleChange} value={form.operation_mode}>
          <option value="">Pilih Mode Operasional</option>
          <option value="autopilot">Autopilot</option>
          <option value="semi">Semi Autopilot</option>
        </select>
        <div className="text-xs text-gray-500 mt-1 mb-3">
          <div className="mb-1 font-bold">Autopilot:</div>
          <ul className="list-disc pl-5 mb-2">
            <li>Mitra tidak perlu terlibat langsung dalam operasional harian.</li>
            <li>Aktivitas dijalankan tim pusat/franchisor, mitra terima laporan & hasil.</li>
          </ul>
          <div className="mb-1 font-bold">Semi Autopilot:</div>
          <ul className="list-disc pl-5">
            <li>Mitra menjalankan operasional harian sendiri.</li>
            <li>Franchisor sebagai pemberi dukungan teknis, pelatihan, dan pemasaran pusat.</li>
          </ul>
        </div>
        <input name="whatsapp_contact" placeholder="No WhatsApp" required className="border p-2 w-full rounded"
          onChange={handleChange} value={form.whatsapp_contact} />
        <input name="email_contact" placeholder="Email Kontak" required className="border p-2 w-full rounded"
          onChange={handleChange} value={form.email_contact} />
        <input name="website_url" placeholder="Website (opsional)" className="border p-2 w-full rounded"
          onChange={handleChange} value={form.website_url} />
        <input name="google_maps_url" placeholder="Google Maps URL (opsional)" className="border p-2 w-full rounded"
          onChange={handleChange} value={form.google_maps_url} />
        <input name="tags" placeholder="Tag (pisahkan dengan koma)" className="border p-2 w-full rounded"
          onChange={handleChange} value={form.tags} />
        <textarea name="notes" placeholder="Catatan (opsional)" className="border p-2 w-full rounded"
          onChange={handleChange} value={form.notes} rows={2} />

        {/* LOGO SECTION */}
        <div>
          <label className="block font-semibold mb-1">Logo Franchise</label>
          {form.logo_url && (
            <div className="mb-2 flex items-center gap-3">
              <img
                src={supabase.storage.from('listing-images').getPublicUrl(form.logo_url).data.publicUrl}
                alt="Logo"
                className="w-20 h-20 object-contain rounded border"
              />
              <span className="text-xs text-gray-600">{form.logo_url.split('/').pop()}</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="file-input file-input-bordered w-full max-w-xs"
          />
        </div>

        {/* SHOWCASE SECTION */}
        <div>
          <label className="block font-semibold mb-1">Showcase (max 5 gambar)</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {showcaseImages.map((img, idx) => (
              <div key={img.id} className="relative flex flex-col items-center">
                <img src={img.url} className="w-20 h-16 object-cover rounded border" alt={`Showcase ${idx + 1}`} />
                <span className="text-[10px] text-gray-600">{img.name}</span>
                <button type="button"
                  className="absolute top-0 right-0 bg-white rounded-full shadow p-1 hover:bg-red-200 transition"
                  style={{ fontSize: 10 }}
                  onClick={() => handleDeleteShowcase(img.id)}
                  title="Hapus gambar">
                  ×
                </button>
              </div>
            ))}
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleNewShowcaseChange}
            className="file-input file-input-bordered w-full max-w-xs"
            disabled={showcaseImages.length >= 5}
          />
          {newShowcaseFiles.length > 0 && (
            <div className="text-xs text-blue-600 mt-2">
              {newShowcaseFiles.length} file siap ditambahkan:{' '}
              {newShowcaseFiles.map((f) => f.name).join(', ')}
            </div>
          )}
        </div>

        {/* EDIT DOKUMEN HUKUM */}
        <div>
          <label className="block font-semibold mb-2">Checklist Dokumen Hukum</label>
          <table className="min-w-[420px] w-full bg-gray-50 rounded-2xl border border-gray-200 shadow text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-2 text-left rounded-tl-2xl">Dokumen</th>
                <th className="py-2 px-2 text-center font-semibold">Sudah Memiliki</th>
                <th className="py-2 px-2 text-center font-semibold rounded-tr-2xl">Akan/Sedang diurus</th>
              </tr>
            </thead>
            <tbody>
              {LEGAL_DOCUMENTS.map((doc, idx) => (
                <tr key={doc.key} className="border-t border-gray-200">
                  <td className="py-2 px-2">{doc.label}</td>
                  {LEGAL_STATUSES.map(status => (
                    <td key={status.key} className="py-2 px-2 text-center">
                      <input
                        type="radio"
                        name={`doc-status-${doc.key}`}
                        value={status.key}
                        checked={legalDocs[idx]?.status === status.key}
                        onChange={() => handleLegalDocChange(idx, status.key)}
                        required
                        className="form-radio h-4 w-4 text-green-600 border-gray-300 focus:ring-2 focus:ring-blue-300 transition"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
          disabled={loading}
        >
          {loading ? 'Menyimpan...' : 'Update Listing'}
        </button>
      </form>
    </div>
  );
}
