import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { FaInfoCircle } from 'react-icons/fa';

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
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showOpInfo, setShowOpInfo] = useState(false);
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
  });

  const [legalDocs, setLegalDocs] = useState(
    LEGAL_DOCUMENTS.map(doc => ({ document_type: doc.key, status: '' }))
  );
  const allDocsFilled = legalDocs.every(doc => !!doc.status);
  const [showcaseFiles, setShowcaseFiles] = useState<File[]>([]);

  // --- UPLOAD LOGO DAN SHOWCASE ---
  const uploadLogoImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `logo/${uuidv4()}.${fileExt}`;
    const { error } = await supabase.storage.from('listing-images').upload(fileName, file);
    if (error) throw error;
    return fileName;
  };

  const uploadShowcaseImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `showcase/${uuidv4()}.${fileExt}`;
    const { error } = await supabase.storage.from('listing-images').upload(fileName, file);
    if (error) throw error;
    return fileName;
  };

  // --- HANDLER ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, files } = target;
    if (type === 'file') {
      setForm((prev) => ({ ...prev, [name]: files![0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleShowcaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setShowcaseFiles(files.slice(0, 5));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!allDocsFilled) {
      alert('Checklist dokumen hukum harus lengkap!');
      return;
    }
    if (showcaseFiles.length > 5) {
      alert('Maksimal 5 gambar untuk showcase!');
      return;
    }
    setLoading(true);

    try {
      const logoPath = form.logo_file ? await uploadLogoImage(form.logo_file) : null;
      const slug = form.franchise_name.toLowerCase().replace(/\s+/g, '-');

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
      }]).select('id').single();
      if (error) throw error;

      const listingId = data.id;

      await Promise.all(
        legalDocs.map(doc =>
          supabase.from('legal_documents').insert({
            listing_id: listingId,
            document_type: doc.document_type,
            status: doc.status
          })
        )
      );

      if (showcaseFiles.length > 0) {
        const showcasePaths = await Promise.all(
          showcaseFiles.map(file => uploadShowcaseImage(file))
        );
        await Promise.all(
          showcasePaths.map(url =>
            supabase.from('listing_images').insert({
              listing_id: listingId,
              image_url: url,
            })
          )
        );
      }

      alert('Listing berhasil ditambahkan!');
      router.push('/franchisor/manage-listings');
    } catch (err: any) {
      alert(`Gagal menambahkan listing. Detail Error: ${JSON.stringify(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // --- FORM LABEL ---
  const FormLabel = ({ children }: { children: string }) => (
    <span className="font-medium text-gray-700 break-words">
      {children}
      <span className="inline-block text-red-500 mx-1">:</span>
    </span>
  );

  // --- PREVIEW BUTTON ---
  const handlePreview = () => {
    // Simpan data ke sessionStorage, lalu buka preview
    sessionStorage.setItem('franchisePreviewData', JSON.stringify({
      ...form,
      legalDocs,
      showcaseFiles: showcaseFiles.map(f => f.name), // atau bisa base64 jika ingin benar-benar preview gambar upload
    }));
    window.open('/franchise/preview', '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Tambah Listing Franchise</h1>
      {/* Tombol Preview */}
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 font-semibold shadow"
          onClick={handlePreview}
        >
          Preview Listing
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <table className="w-full table-fixed border-separate border-spacing-y-4">
            <tbody>
              {/* --- Semua field utama form di sini --- */}
              <tr>
                <td className="align-top w-[32%] sm:w-1/4 pr-2 break-words max-w-[180px]"><FormLabel>Nama Franchise</FormLabel></td>
                <td className="align-middle w-[68%] sm:w-3/4">
                  <input
                    required
                    name="franchise_name"
                    value={form.franchise_name}
                    onChange={handleChange}
                    className="block w-full max-w-xl bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none transition"
                    placeholder="Tulis nama franchise..."
                  />
                </td>
              </tr>
              <tr>
                <td className="align-top w-[32%] sm:w-1/4 pr-2 break-words max-w-[180px] pt-2"><FormLabel>Deskripsi</FormLabel></td>
                <td className="align-top w-[68%] sm:w-3/4">
                  <textarea
                    required
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="block w-full max-w-xl bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none transition resize-none"
                    rows={3}
                    placeholder="Tuliskan deskripsi usaha..."
                  />
                </td>
              </tr>
              <tr>
                <td className="align-top w-[32%] sm:w-1/4 pr-2 break-words max-w-[180px]"><FormLabel>Kategori</FormLabel></td>
                <td className="align-middle w-[68%] sm:w-3/4">
                  <input
                    required
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="block w-full max-w-xl bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none transition"
                    placeholder="Pilih/isi kategori usaha"
                  />
                </td>
              </tr>
              <tr>
                <td className="align-top w-[32%] sm:w-1/4 pr-2 break-words max-w-[180px]"><FormLabel>Investasi Minimal</FormLabel></td>
                <td className="align-middle w-[68%] sm:w-3/4">
                  <div className="flex items-center gap-2">
                    <span>Rp</span>
                    <input
                      required
                      type="number"
                      name="investment_min"
                      value={form.investment_min}
                      onChange={handleChange}
                      className="block w-full max-w-xl bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none transition"
                      placeholder="Jumlah"
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="align-top w-[32%] sm:w-1/4 pr-2 break-words max-w-[180px]"><FormLabel>Lokasi</FormLabel></td>
                <td className="align-middle w-[68%] sm:w-3/4">
                  <input
                    required
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="block w-full max-w-xl bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none transition"
                    placeholder="Lokasi usaha"
                  />
                </td>
              </tr>
              <tr>
                <td className="align-top w-[32%] sm:w-1/4 pr-2 break-words max-w-[180px]"><FormLabel>No WhatsApp</FormLabel></td>
                <td className="align-middle w-[68%] sm:w-3/4">
                  <input
                    required
                    name="whatsapp_contact"
                    value={form.whatsapp_contact}
                    onChange={handleChange}
                    className="block w-full max-w-xl bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none transition"
                    placeholder="08xxxxxxxxxx"
                  />
                </td>
              </tr>
              <tr>
                <td className="align-top w-[32%] sm:w-1/4 pr-2 break-words max-w-[180px]"><FormLabel>Email Kontak</FormLabel></td>
                <td className="align-middle w-[68%] sm:w-3/4">
                  <input
                    required
                    name="email_contact"
                    value={form.email_contact}
                    onChange={handleChange}
                    className="block w-full max-w-xl bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none transition"
                    placeholder="nama@email.com"
                  />
                </td>
              </tr>
              <tr>
                <td className="align-top w-[32%] sm:w-1/4 pr-2 break-words max-w-[180px]"><FormLabel>Website (opsional)</FormLabel></td>
                <td className="align-middle w-[68%] sm:w-3/4">
                  <input
                    name="website_url"
                    value={form.website_url}
                    onChange={handleChange}
                    className="block w-full max-w-xl bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none transition"
                    placeholder="https://"
                  />
                </td>
              </tr>
              <tr>
                <td className="align-top w-[32%] sm:w-1/4 pr-2 break-words max-w-[180px]"><FormLabel>Google Maps URL (opsional)</FormLabel></td>
                <td className="align-middle w-[68%] sm:w-3/4">
                  <input
                    name="google_maps_url"
                    value={form.google_maps_url}
                    onChange={handleChange}
                    className="block w-full max-w-xl bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none transition"
                    placeholder="https://maps.google.com/..."
                  />
                </td>
              </tr>
              <tr>
                <td className="align-top w-[32%] sm:w-1/4 pr-2 break-words max-w-[180px]"><FormLabel>Tag</FormLabel></td>
                <td className="align-middle w-[68%] sm:w-3/4">
                  <input
                    name="tags"
                    value={form.tags}
                    onChange={handleChange}
                    className="block w-full max-w-xl bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none transition"
                    placeholder="Pisahkan dengan koma (,) jika lebih dari satu"
                  />
                </td>
              </tr>
              {/* --- Mode Operasional + Tooltip Info */}
              <tr>
                <td className="align-top w-[32%] sm:w-1/4 pr-2 break-words max-w-[180px]"><FormLabel>Mode Operasional</FormLabel></td>
                <td className="align-middle w-[68%] sm:w-3/4">
                  <div className="flex items-center gap-2 relative">
                    <select
                      required
                      name="operation_mode"
                      value={form.operation_mode}
                      onChange={handleChange}
                      className="block w-full max-w-xl bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none transition"
                    >
                      <option value="">Pilih...</option>
                      <option value="autopilot">Autopilot</option>
                      <option value="semi">Semi Autopilot</option>
                    </select>
                    <button
                      className="ml-2 p-1 rounded-full hover:bg-gray-200 transition"
                      onClick={e => { e.preventDefault(); setShowOpInfo(val => !val); }}
                      aria-label="Penjelasan Mode Operasi"
                      type="button"
                    >
                      <FaInfoCircle className="text-blue-500" />
                    </button>
                    {showOpInfo && (
                      <>
                        <div
                          className="absolute left-10 z-30 mt-2 w-80 bg-white border border-gray-300 rounded-xl shadow-lg p-4 text-sm text-gray-800"
                          style={{ top: '100%' }}
                        >
                          {form.operation_mode === 'autopilot' ? (
                            <>
                              <span className="font-bold text-blue-600 mb-1 block">Autopilot</span>
                              <ul className="list-disc pl-5 mb-1">
                                <li>Mitra tidak perlu terlibat langsung dalam operasional harian.</li>
                                <li>Seluruh aktivitas dijalankan oleh tim pusat/franchisor.</li>
                                <li>Mitra tetap menerima laporan dan hasil bisnis secara rutin.</li>
                                <li>Cocok untuk investor yang ingin bisnis berjalan otomatis.</li>
                              </ul>
                              <span className="text-xs text-gray-500">“Autopilot berarti seluruh operasional harian bisnis dijalankan oleh tim pusat/franchisor, mitra hanya menerima laporan dan hasil.”</span>
                            </>
                          ) : (
                            <>
                              <span className="font-bold text-yellow-600 mb-1 block">Semi Autopilot</span>
                              <ul className="list-disc pl-5 mb-1">
                                <li>Mitra menjalankan sendiri operasional harian bisnis.</li>
                                <li>Franchisor hanya sebagai pemberi dukungan teknis, pelatihan, SOP, dan pemasaran pusat.</li>
                                <li>Cocok untuk mitra yang ingin aktif terjun dan mengelola bisnis sendiri namun tetap mendapat pendampingan dari franchisor.</li>
                              </ul>
                              <span className="text-xs text-gray-500">“Semi-autopilot berarti mitra sebagai pihak utama yang menjalankan operasional bisnis harian, sementara franchisor hanya sebagai pemberi dukungan teknis.”</span>
                            </>
                          )}
                          <button
                            className="absolute top-1 right-2 text-gray-400 hover:text-red-400 text-lg"
                            onClick={() => setShowOpInfo(false)}
                          >×</button>
                        </div>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setShowOpInfo(false)}
                          tabIndex={-1}
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </div>
                </td>
              </tr>
              {/* --- Checklist Dokumen Hukum */}
              <tr>
                <td className="align-top w-[32%] sm:w-1/4 pr-2 break-words max-w-[180px]">
                  <FormLabel>Checklist Dokumen Hukum</FormLabel>
                </td>
                <td className="align-top w-[68%] sm:w-3/4">
                  <div className="overflow-x-auto">
                    <table className="min-w-[480px] w-full bg-gray-50 rounded-2xl border border-gray-200 shadow-md">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="py-3 px-4 text-left font-semibold rounded-tl-2xl">Dokumen</th>
                          <th className="py-3 px-4 text-center font-semibold">Sudah Memiliki</th>
                          <th className="py-3 px-4 text-center font-semibold rounded-tr-2xl">Akan/Sedang diurus</th>
                        </tr>
                      </thead>
                      <tbody>
                        {LEGAL_DOCUMENTS.map((doc, idx) => (
                          <tr key={doc.key} className="border-t border-gray-200">
                            <td className="py-3 px-4">{doc.label}</td>
                            {LEGAL_STATUSES.map(status => (
                              <td key={status.key} className="py-3 px-4 text-center">
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
                                  className="form-radio h-5 w-5 text-green-600 border-gray-300 focus:ring-2 focus:ring-blue-300 transition"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!allDocsFilled && (
                      <p className="text-red-500 text-xs mt-2">Semua dokumen harus dipilih statusnya.</p>
                    )}
                  </div>
                </td>
              </tr>
              {/* Upload Logo */}
              <tr>
                <td className="align-top w-[32%] sm:w-1/4 pr-2 break-words max-w-[180px]"><FormLabel>Upload Logo</FormLabel></td>
                <td className="align-middle w-[68%] sm:w-3/4">
                  <input
                    required
                    type="file"
                    name="logo_file"
                    onChange={handleChange}
                    className="file-input file-input-bordered w-full max-w-xl"
                  />
                </td>
              </tr>
              {/* Upload Showcase */}
              <tr>
                <td className="align-top w-[32%] sm:w-1/4 pr-2 break-words max-w-[180px]"><FormLabel>Upload Showcase (max 5 gambar)</FormLabel></td>
                <td className="align-top w-[68%] sm:w-3/4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleShowcaseChange}
                    className="file-input file-input-bordered w-full max-w-xl"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload hingga 5 gambar untuk galeri showcase franchise Anda.
                  </p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-xs text-gray-600">
                      {showcaseFiles.length} / 5 file dipilih
                    </span>
                    {showcaseFiles.map((file, idx) => (
                      <span key={idx} className="inline-block bg-gray-200 px-2 py-1 rounded text-xs">
                        {file.name}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
              {/* Catatan Tambahan */}
              <tr>
                <td className="align-top w-[32%] sm:w-1/4 pr-2 break-words max-w-[180px]"><FormLabel>Catatan Tambahan</FormLabel></td>
                <td className="align-top w-[68%] sm:w-3/4">
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    className="block w-full max-w-xl bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none transition resize-none"
                    rows={2}
                    placeholder="Catatan (opsional)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 rounded-full bg-green-600 text-white font-semibold shadow transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          {loading ? 'Menyimpan...' : 'Tambah Listing'}
        </button>
      </form>
    </div>
  );
}
