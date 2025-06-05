import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

interface Blog {
  id: string;
  slug: string;
  title: string;
  created_at: string;
  author?: string;
  created_by: string;
}

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function fetchBlogs() {
    const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });

    if (!error) setBlogs(data);
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Daftar Blog</h1>

      {blogs.map(blog => (
        <div key={blog.id} className="border-b py-2">
          <Link href={`/detail/${blog.slug}`}>
            <h2 className="text-xl text-blue-600 cursor-pointer hover:underline">{blog.title}</h2>
          </Link>
          <small className="text-gray-500">Ditulis oleh {blog.author || blog.created_by} pada {new Date(blog.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}
