// pages/api/sitemap.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

const SITE_URL = 'https://franchisenusantara.com';

function generateSiteMap({ franchises, blogs, threads }: { franchises: { slug: string }[]; blogs: { slug: string }[]; threads: { slug: string }[] }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${franchises
    .map(({ slug }) => `
  <url>
    <loc>${SITE_URL}/listing/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  `)
    .join('')}
  ${blogs
    .map(({ slug }) => `
  <url>
    <loc>${SITE_URL}/blog/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  `)
    .join('')}
  ${threads
    .map(({ slug }) => `
  <url>
    <loc>${SITE_URL}/forum/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  `)
    .join('')}
</urlset>`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data: franchisesRaw } = await supabase.from('franchises').select('slug');
  const { data: blogsRaw } = await supabase.from('blogs').select('slug');
  const { data: threadsRaw } = await supabase.from('forum_threads').select('id');

  const franchises = franchisesRaw ?? [];
  const blogs = blogsRaw ?? [];
  const threads = (threadsRaw ?? []).map(t => ({ slug: t.id }));

  const sitemap = generateSiteMap({ franchises, blogs, threads });

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(sitemap);
}
