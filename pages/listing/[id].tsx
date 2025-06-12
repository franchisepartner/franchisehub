import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default function ListingDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [listing, setListing] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    supabase
      .from('franchise_listings')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setListing(data);
        if (data) trackVisit(data);
      });

    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    async function trackVisit(listingData: any) {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      let viewerRole = 'calon_franchisee';

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        viewerRole = profile?.role || 'calon_franchisee';
      }

      await supabase.from('visit_logs').insert({
        content_type: 'listing',
        content_id: listingData.id,
        owner_id: listingData.created_by,
        viewer_role: viewerRole,
      });
    }
  }, [id]);

  if (!listing) return <p className="p-4">Loading...</p>;

  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto p-4">
        <img
          src={listing.image_url}
          alt={listing.name}
          className="w-full h-64 object-cover rounded mb-4"
          loading="lazy"
        />
        <h1 className="text-2xl font-bold mb-2">{listing.name}</h1>
        <p className="mb-4">{listing.description}</p>
        <p className="mb-2">
          <strong>Harga:</strong> Rp{listing.price}
        </p>
        <p className="mb-2">
          <strong>Status:</strong>{' '}
          {listing.autopilot ? 'Autopilot' : 'Semi-Autopilot'}
        </p>
        <ul className="list-disc ml-5 mb-4">
          {listing.checklist?.map((item: string, i: number) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p className="mb-2">
          <strong>Website:</strong>{' '}
          <Link href={listing.link} className="text-blue-600">
            {listing.link}
          </Link>
        </p>

        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Kontak Franchise</h2>
          {!session ? (
            <div className="flex items-center gap-4">
              <img src="/lock-icon.png" alt="Locked" className="w-6 h-6" loading="lazy" />
              <p>Login untuk melihat info kontak</p>
              <Link
                href="/login"
                className="ml-auto bg-blue-600 text-white px-4 py-2 rounded"
              >
                Login
              </Link>
            </div>
          ) : (
            <div>
              <p>
                <strong>Email:</strong> {listing.contact_email}
              </p>
              <Link
                href={`/franchise-inbox?receiverId=${listing.created_by}&listingId=${listing.id}`}
                className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded"
              >
                💬 Chat Inbox
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
