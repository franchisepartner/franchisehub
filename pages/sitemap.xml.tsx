// /pages/sitemap.xml.tsx

import { GetServerSideProps } from 'next';
import { supabase } from '../lib/supabaseClient'; // <-- PASTIKAN path benar!

const SITE_URL = 'https://franchisenusantara.com';

function generateSiteMap({ franchises, blogs, threads }: {
  franchises: { slug: string }[],
  blogs: { slug: string }[],
  threads: { id: string }[]
}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Tambah url lain jika mau -->
  ${franchises.map(({ slug }) => `
  <url>
    <loc>${SITE_URL}/listing/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  `).join('')}
  ${blogs.map(({ slug }) => `
  <url>
    <loc>${SITE_URL}/blog/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  `).join('')}
  ${threads.map(({ id }) => `
  <url>
    <loc>${SITE_URL}/forum/${id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  `).join('')}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const { data: franchises = [] } = await supabase.from('franchises').select('slug');
  const { data: blogs = [] } = await supabase.from('blogs').select('slug');
  const { data: threads = [] } = await supabase.from('forum_threads').select('id');

  const sitemap = generateSiteMap({ franchises, blogs, threads });

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return { props: {} }; // <-- HARUS ADA!
};

// HARUS DEFAULT EXPORT FUNCTION KOSONG!
export default function Sitemap() {
  return null;
}
