import { supabase } from '../../lib/supabaseClient';

const baseUrl = 'https://franchisenusantara.com';

export default async function handler(req, res) {
  try {
    const staticPages = [
      '',
      'franchisor',
      'franchisor/manage-listings',
      'admin',
      'admin/franchisor-approvals',
      'announcement',
      'blog',
      'login',
    ];

    const { data: listings, error } = await supabase
      .from('franchise_listings')
      .select('slug');

    if (error) {
      console.error('Error fetching franchise_listings:', error);
      res.status(500).end();
      return;
    }

    const urls = staticPages.map(page => `${baseUrl}/${page}`);

    if (listings && listings.length > 0) {
      listings.forEach(({ slug }) => {
        urls.push(`${baseUrl}/listing/${slug}`);
      });
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      url => `
  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('')}
</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(sitemap);
  } catch (err) {
    console.error('Error generating sitemap:', err);
    res.status(500).end();
  }
}
