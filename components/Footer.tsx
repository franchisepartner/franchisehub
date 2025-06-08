import Image from 'next/image';
import { useRouter } from 'next/router';

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-start md:justify-between gap-10">
        {/* Kiri: Tentang & Kontak */}
        <div className="flex-1 min-w-[220px]">
          {/* Tentang */}
          <h4 className="font-semibold mb-3">Tentang Kami</h4>
          <p className="text-sm text-gray-300 leading-relaxed mb-5">
            FranchiseHub adalah platform terdepan untuk menemukan dan mengelola peluang franchise di Indonesia.
            Kami hadir untuk membantu Anda berkembang dan terhubung dengan berbagai peluang usaha terbaik.
          </p>
          {/* Kontak */}
          <div>
            <h4 className="font-semibold mb-2">Kontak Kami</h4>
            <p className="text-sm text-gray-300">
              Email: <a href="mailto:mesebeng17@gmail.com" className="underline hover:text-blue-400">mesebeng17@gmail.com</a>
            </p>
            <p className="text-sm text-gray-300">
              Telepon: <a href="tel:+6281238796380" className="underline hover:text-blue-400">+62 8123 8796 380</a>
            </p>
          </div>
        </div>
        {/* Kanan: Dukungan & Pengembangan */}
        <div className="flex flex-col items-center md:items-end justify-center">
          <button
            className="flex flex-col items-center group focus:outline-none transition"
            aria-label="Dukungan FranchiseHub"
            onClick={() => router.push('/pengembangan')}
            type="button"
          >
            <span className="bg-white rounded-full shadow-lg p-2 mb-2 group-hover:scale-110 transition">
              <Image
                src="/22C6DD46-5682-4FDD-998B-710D24A74856.png"
                alt="Dukungan FranchiseHub"
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </span>
            <span className="text-base font-semibold text-white mb-1">
              Dukungan &amp; Pengembangan
            </span>
            <span className="text-xs text-blue-300 group-hover:text-white transition">
              franchisehub.com
            </span>
          </button>
        </div>
      </div>
      <div className="mt-10 text-center text-sm text-gray-400">
        &copy; 2025 FranchiseHub. Semua hak dilindungi.
      </div>
    </footer>
  );
}
