import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Head from 'next/head';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function PusatBantuan() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    async function fetchFaqs() {
      const { data, error } = await supabase.from('help_center').select('*').order('created_at', { ascending: false });
      if (!error && data) setFaqs(data);
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) fetchRole(data.session.user.id);
    });

    fetchFaqs();
  }, []);

  async function fetchRole(userId: string) {
    const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (!error && data) setRole(data.role);
  }

  async function handleAddFaq() {
    const { error } = await supabase.from('help_center').insert({
      question: newQuestion,
      answer: newAnswer,
      category: newCategory,
    });
    if (!error) {
      setShowForm(false);
      setNewQuestion('');
      setNewAnswer('');
      setNewCategory('');
      fetchFaqs();
    } else alert('Gagal menambahkan FAQ: ' + error.message);
  }

  const filteredFaqs = faqs.filter(
    faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Head>
        <title>Pusat Bantuan - FranchiseHub</title>
      </Head>

      <h1 className="text-3xl font-bold mb-6">Pusat Bantuan FranchiseHub</h1>

      <input
        type="text"
        placeholder="Cari pertanyaan atau topik..."
        className="border rounded w-full py-2 px-4 mb-6"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      {role === 'administrator' && (
        <button
          className="bg-blue-600 text-white py-2 px-4 rounded mb-6"
          onClick={() => setShowForm(true)}
        >
          Tambah FAQ
        </button>
      )}

      {showForm && (
        <div className="mb-6 border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Tambah FAQ Baru</h2>
          <input
            className="border rounded w-full py-2 px-3 mb-2"
            placeholder="Pertanyaan"
            value={newQuestion}
            onChange={e => setNewQuestion(e.target.value)}
          />
          <textarea
            className="border rounded w-full py-2 px-3 mb-2"
            placeholder="Jawaban"
            value={newAnswer}
            onChange={e => setNewAnswer(e.target.value)}
          />
          <input
            className="border rounded w-full py-2 px-3 mb-2"
            placeholder="Kategori"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
          />
          <button
            className="bg-green-600 text-white py-2 px-4 rounded"
            onClick={handleAddFaq}
          >
            Simpan
          </button>
          <button
            className="ml-2 bg-gray-400 text-white py-2 px-4 rounded"
            onClick={() => setShowForm(false)}
          >
            Batal
          </button>
        </div>
      )}

      <div>
        {filteredFaqs.length === 0 ? (
          <p className="text-gray-500">Tidak ditemukan hasil pencarian.</p>
        ) : (
          filteredFaqs.map(faq => (
            <div key={faq.id} className="mb-4 border-b pb-2">
              <button
                className="w-full text-left font-semibold text-lg flex justify-between items-center"
                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
              >
                {faq.question}
                <span>{expandedFaq === faq.id ? '-' : '+'}</span>
              </button>

              {expandedFaq === faq.id && <p className="mt-2 text-gray-700">{faq.answer}</p>}

              <span className="text-xs text-gray-500">Kategori: {faq.category}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
