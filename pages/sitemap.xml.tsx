// /pages/sitemap.xml.tsx

import { GetServerSideProps } from 'next';
import { supabase } from '../../lib/supabaseClient';

const SITE_URL = 'https://franchisenusantara.com';

function generateSiteMap({ franchises, blogs, threads }: {
  franchises: { slug: string }[],
  blogs: { slug: string }[],
  threads: { id: string }[]
}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- STATIC PAGES -->
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/franchisor</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/blog</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/forum</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/announcement</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <!-- FRANCHISE LISTINGS -->
  ${franchises
    .map(
      ({ slug }) => `
  <url>
    <loc>${SITE_URL}/listing/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
    `
    )
    .join('')}
  <!-- BLOG -->
  ${blogs
    .map(
      ({ slug }) => `
  <url>
    <loc>${SITE_URL}/blog/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
    `
    )
    .join('')}
  <!-- FORUM THREADS -->
  ${threads
    .map(
      ({ id }) => `
  <url>
    <loc>${SITE_URL}/forum/${id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
    `
    )
    .join('')}
</urlset>
  `;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Ambil slug franchise
  const { data: franchises } = await supabase
    .from('franchises')
    .select('slug')
    .limit(500);

  // Ambil slug blog
  const { data: blogs } = await supabase
    .from('blogs')
    .select('slug')
    .limit(500);

  // Ambil thread forum
  const { data: threads } = await supabase
    .from('forum_threads')
    .select('id')
    .limit(500);

  const sitemap = generateSiteMap({
    franchises: franchises || [],
    blogs: blogs || [],
    threads: threads || [],
  });

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return { props: {} };
};

const Sitemap = () => null;
export default Sitemap;
