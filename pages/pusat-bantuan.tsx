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
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) fetchRole(data.session.user.id);
    });
    fetchFaqs();
  }, []);

  async function fetchFaqs() {
    const { data, error } = await supabase
      .from('help_center')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setFaqs(data);
  }

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
    <div className="max-w-3xl mx-auto px-4 py-12 min-h-screen">
      <Head>
        <title>Pusat Bantuan - FranchiseHub</title>
      </Head>

      <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-2">
        Pusat Bantuan
      </h1>
      <p className="mb-8 text-gray-500">Temukan jawaban seputar FranchiseHub, fitur, dan pertanyaan umum.</p>

      {/* Search */}
      <input
        type="text"
        placeholder="Cari pertanyaan, topik, atau kategori..."
        className="w-full px-5 py-3 rounded-xl border-2 border-blue-100 focus:ring-2 focus:ring-blue-400 outline-none mb-8 text-lg bg-blue-50 font-medium shadow-inner"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      {/* Button Admin */}
      {role === 'administrator' && (
        <button
          className="mb-8 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition"
          onClick={() => setShowForm(true)}
        >
          + Tambah FAQ
        </button>
      )}

      {/* Form Tambah FAQ */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-md relative border border-blue-100 animate-fade-in max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-3 text-xl text-gray-400 hover:text-red-600"
              onClick={() => setShowForm(false)}
            >&times;</button>
            <h2 className="font-bold mb-4 text-blue-700 text-lg">Tambah FAQ Baru</h2>
            <input
              className="border border-blue-200 rounded-xl w-full py-3 px-4 mb-3 text-lg focus:ring-2 focus:ring-blue-400 outline-none font-semibold"
              placeholder="Pertanyaan"
              value={newQuestion}
              onChange={e => setNewQuestion(e.target.value)}
            />
            <textarea
              className="border border-blue-200 rounded-xl w-full py-3 px-4 mb-3 text-base focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Jawaban"
              rows={4}
              value={newAnswer}
              onChange={e => setNewAnswer(e.target.value)}
            />
            <input
              className="border border-blue-200 rounded-xl w-full py-3 px-4 mb-3 text-base focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Kategori (misal: Akun, Listing, Pembayaran, dsb)"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
            />
            <div className="flex gap-2 mt-2">
              <button
                className="bg-gradient-to-r from-green-600 to-green-400 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:scale-105 transition flex-1"
                onClick={handleAddFaq}
              >
                Simpan
              </button>
              <button
                className="bg-gray-400 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-gray-500 transition flex-1"
                onClick={() => setShowForm(false)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ List */}
      <div className="rounded-2xl border border-blue-100 shadow bg-white/80 p-2 md:p-4">
        {filteredFaqs.length === 0 ? (
          <div className="text-center text-gray-400 py-12">Tidak ditemukan hasil pencarian.</div>
        ) : (
          filteredFaqs.map(faq => (
            <div key={faq.id} className="mb-3 last:mb-0">
              <button
                className={`w-full flex justify-between items-center px-6 py-4 rounded-xl text-left font-semibold text-base md:text-lg shadow-sm border-2
                  transition bg-gradient-to-r
                  ${expandedFaq === faq.id
                    ? 'from-blue-50 to-blue-100 border-blue-300'
                    : 'from-white to-blue-50 border-blue-100 hover:bg-blue-50'}
                `}
                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
              >
                <span>{faq.question}</span>
                <span className="ml-3 text-2xl text-blue-500">{expandedFaq === faq.id ? '-' : '+'}</span>
              </button>
              <div
                className={`px-6 pt-2 pb-2 transition-all duration-300 ease-in-out overflow-hidden
                  ${expandedFaq === faq.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
                `}
                style={{ fontSize: '1rem' }}
              >
                <div className="mb-2 text-gray-700">{faq.answer}</div>
                <span className="inline-block bg-blue-100 text-blue-500 font-semibold px-3 py-1 rounded-full text-xs mb-1">Kategori: {faq.category}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
