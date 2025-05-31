import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/router';

interface FranchiseFormData {
  name: string;
  description: string;
  email: string;
  revenue: string;
  logo: FileList | null;
  legalDocs: FileList | null;
  agreement: boolean;
}

const NewFranchiseForm: React.FC = () => {
  const [formData, setFormData] = useState<FranchiseFormData>({
    name: '',
    description: '',
    email: '',
    revenue: '',
    logo: null,
    legalDocs: null,
    agreement: false,
  });

  // Handler event untuk perubahan input (mendukung text, email, number, checkbox, file, textarea)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const { name } = target;
    let value: string | boolean | FileList | null;
    
    if (target instanceof HTMLInputElement) {
      if (target.type === 'checkbox') {
        value = target.checked;
      } else if (target.type === 'file') {
        value = target.files;
      } else {
        value = target.value;
      }
    } else {
      // target berupa HTMLTextAreaElement
      value = target.value;
    }

    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    } as FranchiseFormData));
  };

  // Handler event untuk submit form
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Lakukan submit atau proses data form sesuai kebutuhan
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Nama:
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
        </label>
      </div>
      <div>
        <label>
          Deskripsi:
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            required 
          />
        </label>
      </div>
      <div>
        <label>
          Email:
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
          />
        </label>
      </div>
      <div>
        <label>
          Perkiraan Pendapatan:
          <input 
            type="number" 
            name="revenue" 
            value={formData.revenue} 
            onChange={handleChange} 
          />
        </label>
      </div>
      <div>
        <label>
          Logo:
          <input 
            type="file" 
            name="logo" 
            onChange={handleChange} 
            accept="image/*" 
          />
        </label>
      </div>
      <div>
        <label>
          Dokumen Legal:
          <input 
            type="file" 
            name="legalDocs" 
            onChange={handleChange} 
            multiple 
          />
        </label>
      </div>
      <div>
        <label>
          <input 
            type="checkbox" 
            name="agreement" 
            checked={formData.agreement} 
            onChange={handleChange} 
          />
          Saya menyetujui syarat dan ketentuan
        </label>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default NewFranchiseForm;
