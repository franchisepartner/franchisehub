import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression';
import {
  FaInfoCircle, FaStore, FaMapMarkerAlt, FaMoneyBillAlt, FaThList,
  FaCog, FaFileAlt, FaLink, FaImage
} from 'react-icons/fa';

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
  const [showPreview, setShowPreview] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

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

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
      else router.push('/login');
    };
    fetchUser();
  }, [router]);

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

  const FormLabel = ({ children }: { children: string }) => (
    <span className="font-medium text-gray-700 break-words">
      {children}
      <span className="inline-block text-red-500 mx-1">:</span>
    </span>
  );

  // Upload logo dengan compress
  const uploadLogoImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `logo/${uuidv4()}.${fileExt}`;
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 0.7,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
      initialQuality: 0.85,
    });
    const { error } = await supabase.storage.from('listing-images').upload(fileName, compressedFile);
    if (error) throw error;
    return fileName;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      alert('User belum login. Silakan login ulang.');
      return;
    }
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
        user_id: user.id,
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
        await Promise.all(
          showcaseFiles.map(async (file) => {
            const fileExt = file.name.split('.').pop();
            const fileName = `showcase/${uuidv4()}.${fileExt}`;
            const compressedFile = await imageCompression(file, {
              maxSizeMB: 0.7,
              maxWidthOrHeight: 1280,
              useWebWorker: true,
              initialQuality: 0.85,
            });
            const { error: uploadError } = await supabase.storage.from('listing-images').upload(fileName, compressedFile);
            if (uploadError) throw uploadError;
            await supabase.from('listing_images').insert({
              listing_id: listingId,
              image_url: fileName,
              type: 'showcase',
            });
          })
        );
      }

      alert('Listing berhasil ditambahkan!');
      router.push('/franchisor/manage-listings');
    } catch (err: any) {
      console.error('Tambah listing error:', err);
      alert(`Gagal menambahkan listing. Detail Error: ${JSON.stringify(err)}`);
    } finally {
      setLoading(false);
    }
  };

  function ModalPreview({ show, onClose }: { show: boolean, onClose: () => void }) {
    if (!show) return null;
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-2">
        <div className="relative w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-auto max-h-[96vh] px-6 py-7">
          <button className="absolute top-2 right-3 text-xl text-gray-500 hover:text-red-600" onClick={onClose}>×</button>
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <FaStore className="text-blue-500" /> {form.franchise_name || <span className="italic text-gray-400">Nama Franchise</span>}
            </h2>
            <div className="flex gap-2 mb-2 flex-wrap">
              {form.category && (
                <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm">
                  <FaThList /> {form.category}
                </span>
              )}
              {form.location && (
                <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm">
                  <FaMapMarkerAlt /> {form.location}
                </span>
              )}
              {form.investment_min && (
                <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm">
                  <FaMoneyBillAlt /> Rp {form.investment_min}
                </span>
              )}
            </div>
            <div className="mb-4 flex items-center gap-2">
              <FaCog className="text-gray-500" />
              <span className="font-semibold">{form.operation_mode === "autopilot" ? "Autopilot" : form.operation_mode === "semi" ? "Semi Autopilot" : "Mode Operasional"}</span>
              <button className="ml-1 text-blue-500" tabIndex={-1}><FaInfoCircle /></button>
            </div>
            {form.description && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-1 flex items-center gap-2"><FaInfoCircle className="text-blue-500" /> Deskripsi</h3>
                <div className="bg-gray-50 rounded-xl border px-4 py-3 text-gray-800 leading-relaxed whitespace-pre-line">{form.description}</div>
              </div>
            )}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1 flex items-center gap-2"><FaFileAlt className="text-green-600" /> Status Dokumen Hukum</h3>
              <table className="w-full border rounded-lg text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left rounded-tl-lg">Dokumen</th>
                    <th className="py-2 px-4 text-center">Sudah Punya</th>
                    <th className="py-2 px-4 text-center rounded-tr-lg">Akan/Sedang Diurus</th>
                  </tr>
                </thead>
                <tbody>
                  {LEGAL_DOCUMENTS.map(doc => {
                    const found = legalDocs.find(d => d.document_type === doc.key);
                    return (
                      <tr key={doc.key} className="border-t">
                        <td className="py-2 px-4">{doc.label}</td>
                        <td className="py-2 px-4 text-center">
                          {found?.status === 'sudah' && <span className="inline-block w-6 h-6 bg-green-500 rounded-full text-white font-bold">✓</span>}
                        </td>
                        <td className="py-2 px-4 text-center">
                          {found?.status === 'sedang' && <span className="inline-block w-6 h-6 bg-yellow-400 rounded-full text-white font-bold">⏳</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1 flex items-center gap-2"><FaLink className="text-gray-700" /> Kontak & Tautan</h3>
              <ul className="pl-2 list-disc">
                {form.whatsapp_contact && <li>WhatsApp: {form.whatsapp_contact}</li>}
                {form.email_contact && <li>Email: {form.email_contact}</li>}
                {form.website_url && <li>Website: {form.website_url}</li>}
                {form.google_maps_url && <li>Google Maps: {form.google_maps_url}</li>}
              </ul>
              {form.tags && <div className="mt-2"><span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs">#{form.tags}</span></div>}
            </div>
            {form.notes && (
              <div className="mb-3">
                <h3 className="text-lg font-semibold mb-1">Catatan Tambahan</h3>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 px-4 py-2 rounded">{form.notes}</div>
              </div>
            )}
            {showcaseFiles.length > 0 && (
              <div className="mb-3">
                <h3 className="text-lg font-semibold mb-1">Showcase</h3>
                <div className="flex gap-2 flex-wrap">
                  {showcaseFiles.map((file, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <span className="block bg-gray-200 px-2 py-1 rounded text-xs">{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold">Tambah Listing Franchise</h1>
        <button
          className="text-blue-600 hover:text-blue-900 text-xl"
          onClick={() => setShowInfo(true)}
          type="button"
          title="Tips & Info Pengisian Listing"
        >
          <FaInfoCircle />
        </button>
      </div>

      {/* POPUP INFO */}
      {showInfo && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-3" onClick={() => setShowInfo(false)}>
          <div
            className="bg-white max-w-lg w-full rounded-2xl shadow-2xl p-6 relative"
            onClick={e => e.stopPropagation()}
          >
            <button className="absolute top-3 right-5 text-xl text-gray-400 hover:text-red-600" onClick={() => setShowInfo(false)}>&times;</button>
            <h2 className="font-bold text-xl mb-3">Tips & Info Pengisian Listing</h2>
            <div className="text-gray-800 leading-relaxed">
              <ul className="list-disc pl-5 mb-2">
                <li>Isi nama, kategori, lokasi, dan deskripsi franchise dengan jelas & singkat.</li>
                <li>Upload logo serta gambar showcase menarik agar lebih dipercaya calon mitra.</li>
                <li>Pilih mode operasional yang sesuai (Autopilot/Semi Autopilot) & lengkapi dokumen hukum.</li>
                <li>Jangan lupa kontak WhatsApp/email & website jika ada.</li>
                <li>Setelah submit, admin akan meninjau data sebelum tampil publik.</li>
              </ul>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 px-4 py-2 rounded text-sm mb-2 mt-2">
                <b>PERHATIAN:</b><br />
                Franchisor <u>WAJIB mengisi status dokumen dan legalitas secara JUJUR</u>.<br />
                Data yang tidak valid, palsu, atau menyesatkan akan berakibat pada penolakan, pemblokiran, atau penghapusan listing tanpa pemberitahuan.<br />
                Pastikan semua dokumen telah benar dan sah untuk menghindari masalah hukum di kemudian hari.
              </div>
              <span className="block mt-2 text-xs text-gray-500">Data listing dummy tetap bisa untuk testing (tanpa data sensitif).</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <table className="w-full table-fixed border-separate border-spacing-y-4">
            <tbody>
              <tr>
                <td className="align-top w-[32%] pr-2"><FormLabel>Nama Franchise</FormLabel></td>
                <td className="align-middle w-[68%]">
                  <input required name="franchise_name" value={form.franchise_name} onChange={handleChange}
                    className="block w-full max-w-xl bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none transition"
                    placeholder="Tulis nama franchise..." />
                </td>
              </tr>
              <tr>
                <td className="align-top w-[32%] pr-2"><FormLabel>Kategori</FormLabel></td>
                <td className="align-middle w-[68%]">
                  <input required name="category" value={form.category} onChange={handleChange}
                    className="block w-full max-w-xl bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none transition"
                    placeholder="Pilih/isi kategori usaha" />
                </td>
              </tr>
              <tr>
                <td className="align-top w-[32%] pr-2"><FormLabel>Investasi Minimal</FormLabel></td>
                <td className="align-middle w-[68%]">
                  <div className="flex items-center gap-2">
                    <span>Rp</span>
                    <input required type="number" name="investment_min" value={form.investment_min} onChange={handleChange}
                      className="block w-full max-w-xl bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none transition"
                      placeholder="Jumlah" />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="align-top w-[32%] pr-2"><FormLabel>Lokasi</FormLabel></td>
                <td className="align-middle w-[68%]">
                  <input required name="location" value={form.location} onChange={handleChange}
                    className="block w-full max-w-xl bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none transition"
                    placeholder="Lokasi usaha" />
                </td>
              </tr>
              <tr>
                <td className="align-top w-[32%] pr-2"><FormLabel>No WhatsApp</FormLabel></td>
                <td className="align-middle w-[68%]">
                  <input required name="whatsapp_contact" value={form.whatsapp_contact} onChange={handleChange}
                    className="block w-full max-w-xl bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none transition"
                    placeholder="08xxxxxxxxxx" />
                </td>
              </tr>
              <tr>
                <td className="align-top w-[32%] pr-2"><FormLabel>Email Kontak</FormLabel></td>
                <td className="align-middle w-[68%]">
                  <input required name="email_contact" value={form.email_contact} onChange={handleChange}
                    className="block w-full max-w-xl bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none transition"
                    placeholder="nama@email.com" />
                </td>
              </tr>
              <tr>
                <td className="align-top w-[32%] pr-2"><FormLabel>Website (opsional)</FormLabel></td>
                <td className="align-middle w-[68%]">
                  <input name="website_url" value={form.website_url} onChange={handleChange}
                    className="block w-full max-w-xl bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none transition"
                    placeholder="https://" />
                </td>
              </tr>
              <tr>
                <td className="align-top w-[32%] pr-2"><FormLabel>Google Maps URL (opsional)</FormLabel></td>
                <td className="align-middle w-[68%]">
                  <input name="google_maps_url" value={form.google_maps_url} onChange={handleChange}
                    className="block w-full max-w-xl bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none transition"
                    placeholder="https://maps.google.com/..." />
                </td>
              </tr>
              <tr>
                <td className="align-top w-[32%] pr-2"><FormLabel>Tag</FormLabel></td>
                <td className="align-middle w-[68%]">
                  <input name="tags" value={form.tags} onChange={handleChange}
                    className="block w-full max-w-xl bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none transition"
                    placeholder="Pisahkan dengan koma (,) jika lebih dari satu" />
                </td>
              </tr>
              <tr>
                <td className="align-top w-[32%] pr-2 pt-2"><FormLabel>Deskripsi</FormLabel></td>
                <td className="align-top w-[68%]">
                  <textarea required name="description" value={form.description} onChange={handleChange}
                    className="block w-full max-w-xl bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none transition resize-none"
                    rows={3} placeholder="Tuliskan deskripsi usaha..." />
                </td>
              </tr>
              {/* Mode Operasional */}
              <tr>
                <td className="align-top w-[32%] pr-2"><FormLabel>Mode Operasional</FormLabel></td>
                <td className="align-middle w-[68%]">
                  <select required name="operation_mode" value={form.operation_mode} onChange={handleChange}
                    className="block w-full max-w-xl bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none transition">
                    <option value="">Pilih...</option>
                    <option value="autopilot">Autopilot</option>
                    <option value="semi">Semi Autopilot</option>
                  </select>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs flex flex-col">
                      <div className="font-bold text-blue-600 mb-1 flex items-center gap-1"><FaCog /> Autopilot</div>
                      <ul className="list-disc pl-5 mb-1">
                        <li>Mitra tidak perlu terlibat langsung dalam operasional harian.</li>
                        <li>Seluruh aktivitas dijalankan oleh tim pusat/franchisor.</li>
                        <li>Mitra tetap menerima laporan dan hasil bisnis secara rutin.</li>
                        <li>Cocok untuk investor yang ingin bisnis berjalan otomatis.</li>
                      </ul>
                      <span className="text-[11px] text-gray-500">“Autopilot berarti seluruh operasional harian bisnis dijalankan oleh tim pusat/franchisor, mitra hanya menerima laporan dan hasil.”</span>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-xs flex flex-col">
                      <div className="font-bold text-yellow-600 mb-1 flex items-center gap-1"><FaCog /> Semi Autopilot</div>
                      <ul className="list-disc pl-5 mb-1">
                        <li>Mitra menjalankan sendiri operasional harian bisnis.</li>
                        <li>Franchisor hanya sebagai pemberi dukungan teknis, pelatihan, SOP, dan pemasaran pusat.</li>
                        <li>Cocok untuk mitra yang ingin aktif terjun dan mengelola bisnis sendiri namun tetap mendapat pendampingan dari franchisor.</li>
                      </ul>
                      <span className="text-[11px] text-gray-500">“Semi-autopilot berarti mitra sebagai pihak utama yang menjalankan operasional bisnis harian, sementara franchisor hanya sebagai pemberi dukungan teknis.”</span>
                    </div>
                  </div>
                </td>
              </tr>
              {/* Checklist Dokumen Hukum */}
              <tr>
                <td className="align-top w-[32%] pr-2"><FormLabel>Checklist Dokumen Hukum</FormLabel></td>
                <td className="align-top w-[68%]">
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
                <td className="align-top w-[32%] pr-2"><FormLabel>Upload Logo</FormLabel></td>
                <td className="align-middle w-[68%]">
                  <input required type="file" name="logo_file" onChange={handleChange} className="file-input file-input-bordered w-full max-w-xl" />
                </td>
              </tr>
              {/* Upload Showcase */}
              <tr>
                <td className="align-top w-[32%] pr-2">
                  <FormLabel>
                    Upload Showcase (max 5 gambar)
                  </FormLabel>
                  <div className="flex items-center gap-2 text-xs mt-1 text-gray-500">
                    <FaImage className="text-blue-400" />
                    <span>
                      **Disarankan gambar lebar (landscape), minimal <b>1200 x 360 px</b>. <br />
                      Di halaman franchise, gambar akan dicrop otomatis dengan tinggi 220px, lebar penuh.**
                    </span>
                  </div>
                </td>
                <td className="align-top w-[68%]">
                  <input type="file" multiple accept="image/*" onChange={handleShowcaseChange} className="file-input file-input-bordered w-full max-w-xl"/>
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
                <td className="align-top w-[32%] pr-2"><FormLabel>Catatan Tambahan</FormLabel></td>
                <td className="align-top w-[68%]">
                  <textarea name="notes" value={form.notes} onChange={handleChange} className="block w-full max-w-xl bg-transparent border-0 border-b-2 border-gray-400 focus:border-blue-500 outline-none transition resize-none" rows={2} placeholder="Catatan (opsional)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button type="submit" disabled={loading} className="w-full px-4 py-2 rounded-full bg-green-600 text-white font-semibold shadow transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400">
          {loading ? 'Menyimpan...' : 'Tambah Listing'}
        </button>
        <button
          type="button"
          className="mt-6 w-full px-4 py-2 rounded-full bg-gray-700 text-white font-semibold shadow transition hover:bg-gray-900"
          onClick={() => setShowPreview(true)}
        >
          Preview Listing
        </button>
      </form>
      <ModalPreview show={showPreview} onClose={() => setShowPreview(false)} />
    </div>
  );
}
