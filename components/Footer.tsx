// components/Footer.tsx

import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-4 mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Tentang Kami */}
        <div>
          <h4 className="font-semibold mb-4 text-lg">Tentang Kami</h4>
          <p className="text-sm text-gray-300">
            FranchiseHub adalah platform terdepan untuk menemukan dan mengelola peluang franchise di Indonesia. 
            Kami hadir untuk membantu Anda berkembang dan terhubung dengan berbagai peluang usaha terbaik.
          </p>
        </div>

        {/* Kontak Kami */}
        <div>
          <h4 className="font-semibold mb-4 text-lg">Kontak Kami</h4>
          <p className="text-sm text-gray-300 mb-1">Email: <a href="mailto:mesebeng17@gmail.com" className="underline hover:text-blue-300">mesebeng17@gmail.com</a></p>
          <p className="text-sm text-gray-300 mb-2">Telepon: <a href="tel:+6281238796380" className="underline hover:text-blue-300">+62 8123 8796 380</a></p>
        </div>

        {/* Dukungan & Pengembangan */}
        <div className="flex flex-col items-start">
          <h4 className="font-semibold mb-4 text-lg">Dukungan &amp; Pengembangan</h4>
          <button
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-white hover:bg-blue-100 transition text-gray-900 font-semibold shadow"
            onClick={() => window.open('mailto:mesebeng17@gmail.com', '_blank')}
            aria-label="Dukungan dan Pengembangan"
            type="button"
          >
            <Image
              src="/22C6DD46-5682-4FDD-998B-710D24A74856.png"
              alt="FranchiseHub Logo"
              width={28}
              height={28}
              className="rounded-full"
              style={{ background: "#e5e7eb" }}
            />
            <span>Dukungan FranchiseHub</span>
          </button>
        </div>
      </div>
      <div className="mt-8 text-center text-sm text-gray-400 border-t border-gray-800 pt-4">
        &copy; 2025 FranchiseHub. Semua hak dilindungi.
      </div>
    </footer>
  );
}
