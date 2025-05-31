// imports
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Inisialisasi Supabase client (gunakan env YOUR_SUPABASE_URL dan YOUR_SUPABASE_ANON_KEY)
const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Helper untuk upload file ke Supabase Storage
const uploadFile = async (
  file: File,
  bucket: string,
  path: string
): Promise<string | null> => {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) {
    console.error(`Error uploading ${file.name}:`, error.message);
    return null;
  }
  // Mengembalikan path file di storage (untuk disimpan di database atau digunakan selanjutnya)
  return data.path ?? null;
};

// Tipe data untuk field teks dalam form
interface FormFields {
  name: string;
  description: string;
  investment: string;
  operationMode: string;
  location: string;
  category: string;
  whatsapp: string;
  email: string;
  website: string;
  slug: string;
  notes: string;
}

// Tipe untuk state dokumen hukum (checklist)
interface DocState {
  checked: boolean;
  subDocs: { [subDocName: string]: boolean };
}
type DocumentsState = { [docName: string]: DocState };

// Daftar dokumen hukum dan subdokumen (dapat disesuaikan sesuai kebutuhan)
const legalDocsList = [
  { name: 'Dokumen A', subDocs: ['Subdokumen A1', 'Subdokumen A2'] },
  { name: 'Dokumen B', subDocs: ['Subdokumen B1', 'Subdokumen B2'] },
  { name: 'Dokumen C', subDocs: [] }  // contoh dokumen tanpa subdokumen
];

// Inisialisasi state awal untuk checklist dokumen (semua unchecked)
const initializeDocumentsState = (): DocumentsState => {
  const initialState: DocumentsState = {};
  legalDocsList.forEach(doc => {
    initialState[doc.name] = {
      checked: false,
      subDocs: {}
    };
    doc.subDocs.forEach(sub => {
      initialState[doc.name].subDocs[sub] = false;
    });
  });
  return initialState;
};

// Komponen form franchise (functional component)
const NewFranchiseForm: React.FC = () => {
  const router = useRouter();

  // State untuk field-field teks
  const [fields, setFields] = useState<FormFields>({
    name: '',
    description: '',
    investment: '',
    operationMode: '',
    location: '',
    category: '',
    whatsapp: '',
    email: '',
    website: '',
    slug: '',
    notes: ''
  });
  // State untuk file logo dan cover
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  // State untuk checklist dokumen hukum
  const [documents, setDocuments] = useState<DocumentsState>(initializeDocumentsState());

  // Effect: generate slug otomatis saat nama berubah
  useEffect(() => {
    const generateSlug = (text: string) => {
      return text
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\-_\s]/g, '')    // hapus karakter non-alphanumeric
        .replace(/\s+/g, '-');            // ganti spasi dengan "-"
    };
    setFields(prev => ({
      ...prev,
      slug: prev.name ? generateSlug(prev.name) : ''
    }));
  }, [fields.name]);

  // Handler untuk perubahan input teks, textarea, select, dan file
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      // Jika input file (logo/cover)
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        if (name === 'logo') setLogoFile(file);
        if (name === 'cover') setCoverFile(file);
      }
    } else {
      // Input teks, textarea, atau select
      setFields(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handler untuk checkbox dokumen utama
  const handleMainDocChange = (docName: string, checked: boolean) => {
    setDocuments(prev => {
      const newState = { ...prev };
      newState[docName].checked = checked;
      // Jika dokumen utama di-uncheck, semua subdokumen di-uncheck juga
      if (!checked) {
        Object.keys(newState[docName].subDocs).forEach(subName => {
          newState[docName].subDocs[subName] = false;
        });
      }
      return newState;
    });
  };

  // Handler untuk checkbox subdokumen
  const handleSubDocChange = (docName: string, subName: string, checked: boolean) => {
    setDocuments(prev => {
      const newState = { ...prev };
      newState[docName].subDocs[subName] = checked;
      // Jika subdokumen di-check, pastikan dokumen utama ter-check
      if (checked && !newState[docName].checked) {
        newState[docName].checked = true;
      }
      return newState;
    });
  };

  // Handler submit form
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Upload logo ke Supabase (jika ada file dipilih)
      let logoPath: string | null = null;
      if (logoFile) {
        // Tentukan path penyimpanan di bucket (gunakan slug + timestamp agar unik)
        const fileExt = logoFile.name.split('.').pop() || '';
        const fileName = fields.slug ? `${fields.slug}-logo-${Date.now()}` : `logo-${Date.now()}`;
        const storagePath = `logos/${fileName}.${fileExt}`;
        logoPath = await uploadFile(logoFile, 'franchises', storagePath);
        if (!logoPath) {
          alert('Gagal mengupload logo.');
          return;
        }
      }
      // Upload cover ke Supabase (jika ada file dipilih)
      let coverPath: string | null = null;
      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop() || '';
        const fileName = fields.slug ? `${fields.slug}-cover-${Date.now()}` : `cover-${Date.now()}`;
        const storagePath = `covers/${fileName}.${fileExt}`;
        coverPath = await uploadFile(coverFile, 'franchises', storagePath);
        if (!coverPath) {
          alert('Gagal mengupload cover.');
          return;
        }
      }

      // Siapkan data untuk disimpan (misal ke database Supabase)
      const franchiseData = {
        name: fields.name,
        description: fields.description,
        investment: fields.investment,
        operation_mode: fields.operationMode,   // contoh: menggunakan snake_case untuk DB
        location: fields.location,
        category: fields.category,
        whatsapp: fields.whatsapp,
        email: fields.email,
        website: fields.website,
        slug: fields.slug,
        notes: fields.notes,
        logo_url: logoPath,
        cover_url: coverPath,
        documents: documents  // bisa disimpan sebagai JSON di kolom database (tipe JSONB)
      };

      // Simpan data franchise ke database (Supabase)
      const { error: insertError } = await supabase.from('franchises').insert([franchiseData]);
      if (insertError) {
        throw insertError;
      }

      // Redirect atau tindakan lain setelah sukses simpan
      alert('Franchise baru berhasil disimpan!');
      router.push('/franchises');  // Arahkan ke halaman daftar franchise (sesuaikan route sesuai aplikasi)
    } catch (error: any) {
      console.error('Error submitting form:', error.message);
      alert('Terjadi kesalahan saat menyimpan data.');
    }
  };

  // Render form
  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
      {/* Nama */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="name" style={{ fontWeight: 'bold' }}>Nama Franchise</label><br/>
        <input 
          id="name"
          name="name"
          type="text"
          value={fields.name}
          onChange={handleChange}
          placeholder="Nama franchise"
          style={{ width: '100%', padding: '8px' }}
          required 
        />
      </div>

      {/* Deskripsi */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="description" style={{ fontWeight: 'bold' }}>Deskripsi</label><br/>
        <textarea 
          id="description"
          name="description"
          value={fields.description}
          onChange={handleChange}
          placeholder="Deskripsi franchise"
          style={{ width: '100%', padding: '8px' }}
          rows={4}
          required 
        />
      </div>

      {/* Investasi */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="investment" style={{ fontWeight: 'bold' }}>Investasi (Rp)</label><br/>
        <input 
          id="investment"
          name="investment"
          type="text"
          value={fields.investment}
          onChange={handleChange}
          placeholder="Contoh: 100000000" 
          style={{ width: '100%', padding: '8px' }}
          required 
        />
      </div>

      {/* Mode Operasi */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="operationMode" style={{ fontWeight: 'bold' }}>Mode Operasi</label><br/>
        <input 
          id="operationMode"
          name="operationMode"
          type="text"
          value={fields.operationMode}
          onChange={handleChange}
          placeholder="Contoh: Kemitraan / Waralaba"
          style={{ width: '100%', padding: '8px' }}
          required 
        />
      </div>

      {/* Lokasi */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="location" style={{ fontWeight: 'bold' }}>Lokasi</label><br/>
        <input 
          id="location"
          name="location"
          type="text"
          value={fields.location}
          onChange={handleChange}
          placeholder="Lokasi franchise"
          style={{ width: '100%', padding: '8px' }}
          required 
        />
      </div>

      {/* Kategori */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="category" style={{ fontWeight: 'bold' }}>Kategori</label><br/>
        <input 
          id="category"
          name="category"
          type="text"
          value={fields.category}
          onChange={handleChange}
          placeholder="Kategori franchise"
          style={{ width: '100%', padding: '8px' }}
          required 
        />
        {/* Jika ada daftar kategori tetap, bisa gunakan <select> dan opsi */}
        {/*
        <select id="category" name="category" value={fields.category} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
          <option value="">Pilih Kategori</option>
          <option value="Makanan">Makanan</option>
          <option value="Minuman">Minuman</option>
          <option value="Retail">Retail</option>
          <option value="Jasa">Jasa</option>
          ... (sesuaikan opsi kategori)
        </select>
        */}
      </div>

      {/* WhatsApp */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="whatsapp" style={{ fontWeight: 'bold' }}>WhatsApp</label><br/>
        <input 
          id="whatsapp"
          name="whatsapp"
          type="tel"
          value={fields.whatsapp}
          onChange={handleChange}
          placeholder="Nomor WhatsApp (cth: 6281234567890)"
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      {/* Email */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="email" style={{ fontWeight: 'bold' }}>Email</label><br/>
        <input 
          id="email"
          name="email"
          type="email"
          value={fields.email}
          onChange={handleChange}
          placeholder="Alamat email"
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      {/* Website */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="website" style={{ fontWeight: 'bold' }}>Website</label><br/>
        <input 
          id="website"
          name="website"
          type="url"
          value={fields.website}
          onChange={handleChange}
          placeholder="URL website"
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      {/* Slug (readonly) */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="slug" style={{ fontWeight: 'bold' }}>Slug</label><br/>
        <input 
          id="slug"
          name="slug"
          type="text"
          value={fields.slug}
          onChange={handleChange}
          style={{ width: '100%', padding: '8px', backgroundColor: '#f9f9f9' }}
          readOnly 
        />
      </div>

      {/* Upload Logo */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="logo" style={{ fontWeight: 'bold' }}>Logo</label><br/>
        <input 
          id="logo"
          name="logo"
          type="file"
          accept="image/*"
          onChange={handleChange}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      {/* Upload Cover */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="cover" style={{ fontWeight: 'bold' }}>Cover</label><br/>
        <input 
          id="cover"
          name="cover"
          type="file"
          accept="image/*"
          onChange={handleChange}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      {/* Checklist Dokumen Hukum dan Subdokumen */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontWeight: 'bold' }}>Dokumen Hukum</label>
        {legalDocsList.map(doc => (
          <div key={doc.name} style={{ marginLeft: '0.5rem', marginBottom: '4px' }}>
            {/* Checkbox dokumen utama */}
            <label>
              <input 
                type="checkbox"
                checked={documents[doc.name].checked}
                onChange={(e) => handleMainDocChange(doc.name, e.target.checked)}
              />{' '}
              {doc.name}
            </label>
            {/* Subdokumen (jika ada) */}
            {doc.subDocs.length > 0 && doc.subDocs.map(sub => (
              <div key={sub} style={{ marginLeft: '1.5rem' }}>
                <label>
                  <input 
                    type="checkbox"
                    checked={documents[doc.name].subDocs[sub]}
                    disabled={!documents[doc.name].checked}
                    onChange={(e) => handleSubDocChange(doc.name, sub, e.target.checked)}
                  />{' '}
                  {sub}
                </label>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Catatan Tambahan */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="notes" style={{ fontWeight: 'bold' }}>Catatan Tambahan</label><br/>
        <textarea 
          id="notes"
          name="notes"
          value={fields.notes}
          onChange={handleChange}
          placeholder="Catatan tambahan (opsional)"
          style={{ width: '100%', padding: '8px' }}
          rows={3}
        />
      </div>

      {/* Tombol Submit */}
      <button type="submit" style={{ fontWeight: 'bold', padding: '8px 16px' }}>
        Simpan Franchise
      </button>
    </form>
  );
};

export default NewFranchiseForm;
