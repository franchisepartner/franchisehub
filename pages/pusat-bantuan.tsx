import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Head from 'next/head';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags?: string[];
  views: number;
  helpful_count: number;
}

export default function PusatBantuan() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFaqs() {
      const { data, error } = await supabase
        .from('help_center')
        .select('*')
        .order('views', { ascending: false });
      if (!error && data) setFaqs(data);
    }

    fetchFaqs();
  }, []);

  async function incrementViews(faqId: string) {
    await supabase.rpc('increment_faq_views', { faq_id: faqId });
  }

  async function incrementHelpful(faqId: string) {
    await supabase.rpc('increment_faq_helpful', { faq_id: faqId });
    setFaqs(prev => prev.map(faq => faq.id === faqId ? { ...faq, helpful_count: faq.helpful_count + 1 } : faq));
  }

  const filteredFaqs = faqs.filter(
    faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags?.join(' ').toLowerCase().includes(searchTerm.toLowerCase())
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

      <div>
        {filteredFaqs.length === 0 ? (
          <p className="text-gray-500">Tidak ditemukan hasil pencarian.</p>
        ) : (
          filteredFaqs.map(faq => (
            <div key={faq.id} className="mb-4 border-b pb-2">
              <button
                className="w-full text-left font-semibold text-lg flex justify-between items-center"
                onClick={() => {
                  setExpandedFaq(expandedFaq === faq.id ? null : faq.id);
                  incrementViews(faq.id);
                }}
              >
                {faq.question}
                <span>{expandedFaq === faq.id ? '-' : '+'}</span>
              </button>

              {expandedFaq === faq.id && (
                <>
                  <p className="mt-2 text-gray-700">{faq.answer}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      className="text-sm text-green-600"
                      onClick={() => incrementHelpful(faq.id)}
                    >
                      👍 Membantu ({faq.helpful_count})
                    </button>
                    <button
                      className="text-sm text-blue-600"
                      onClick={() => navigator.clipboard.writeText(`${window.location.href}#${faq.id}`)}
                    >
                      📋 Salin Link
                    </button>
                  </div>
                </>
              )}

              <span className="text-xs text-gray-500">Kategori: {faq.category} • Dilihat: {faq.views} kali</span>
              {faq.tags && <div className="text-xs text-gray-400">Tags: {faq.tags.join(', ')}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
