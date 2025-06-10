// pages/pengembangan.tsx
import Image from 'next/image';
import Head from 'next/head';

export default function Pengembangan() {
  return (
    <>
      <Head>
        <title>Pengembangan & Inovasi FranchiseNusantara</title>
        <meta name="description" content="Kisah dan visi pengembangan fitur-fitur masa depan FranchiseHub. Dompet franchisor, investor, chat real-time privat, dashboard franchisee/investor, dan event tahunan." />
      </Head>
      <div className="bg-gradient-to-b from-green-100/60 to-white min-h-screen pb-24">
        {/* Hero Ilustrasi */}
        <div className="flex flex-col items-center pt-12 pb-8 px-2">
          <div className="w-full max-w-xl relative rounded-3xl shadow-xl overflow-hidden mb-8">
            <Image
              src="/CCD5FC44-D602-4286-A273-6FEDD8CFEDA2.PNG"
              alt="Ilustrasi Pengembangan FranchiseNusantara"
              width={768}
              height={768}
              className="w-full h-auto object-cover rounded-3xl"
              priority
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-2">FranchiseNusantara — Pengembangan & Inovasi Masa Depan</h1>
          <p className="max-w-2xl text-center text-gray-600 text-lg">
            FranchiseNusantara tidak sekadar situs franchise, ini adalah kisah perjalanan kita bersama untuk membangun masa depan bisnis franchise yang lebih aman, transparan, dan kolaboratif di Indonesia. Inilah beberapa fitur futuristik yang sedang, dan akan kami kembangkan bersama komunitas!
          </p>
        </div>

        {/* Roadmap Fitur */}
        <div className="max-w-3xl mx-auto px-4">
          <div className="mt-8">
            <FeatureBlock
              emoji="👛"
              title="Dompet Franchisor"
              desc="Akan hadir sistem dompet digital khusus franchisor, mendukung pencatatan investasi, pembayaran, dan monitoring revenue secara otomatis—langsung terintegrasi ke dashboard pribadi."
              badge="Segera Hadir"
            />
            <FeatureBlock
              emoji="🔓"
              title="Unlock Role Investor"
              desc="Investor akan mendapat akses eksklusif ke listing & waralaba potensial, dengan proses onboarding, verifikasi, dan dashboard performa bisnis—mewujudkan kolaborasi sehat antara franchisor dan investor."
            />
            <FeatureBlock
              emoji="💬"
              title="Chat Real-time Privat"
              desc="Supaya setiap diskusi antara franchisor, franchisee, dan investor terjamin privasinya, FranchiseHub akan menghadirkan chat real-time one-on-one yang terenkripsi dan dapat diakses langsung dari listing."
            />
            <FeatureBlock
              emoji="📊"
              title="Dashboard Franchisee & Investor"
              desc="Pengguna dengan role Franchisee dan Investor bisa mengakses dashboard statistik, tracking perkembangan bisnis, notifikasi pembayaran, hingga support center tanpa keluar platform."
            />
            <FeatureBlock
              emoji="🎉"
              title="Event Tahunan Komunitas"
              desc="Rencana pengembangan fitur komunitas dan event tahunan: virtual expo, pitching waralaba, hingga kompetisi ide bisnis terbaik yang mempertemukan franchisor dan investor di seluruh Indonesia."
            />
            <FeatureBlock
              emoji="🚀"
              title="Fitur Masa Depan Lainnya"
              desc="Kami selalu menerima masukan dari Anda! Beberapa fitur impian: franchise scoring berbasis AI, kalkulator prediksi, rating mitra, sertifikasi digital, hingga sistem escrow pembayaran untuk keamanan transaksi."
            />
          </div>
        </div>

        {/* Call To Action */}
        <div className="flex flex-col items-center mt-12 mb-6">
          <div className="text-center text-lg font-medium text-blue-700">
            <span>Ingin request fitur atau berkolaborasi dalam pengembangan FranchiseNusantara?</span>
            <br />
            <a
              href="mailto:mesebeng17@gmail.com"
              className="inline-block mt-3 px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow hover:bg-blue-700 transition"
            >
              Hubungi Tim Pengembangan 🚀
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

function FeatureBlock({
  emoji,
  title,
  desc,
  badge,
}: { emoji: string; title: string; desc: string; badge?: string }) {
  return (
    <div className="bg-white/80 rounded-2xl shadow-md p-5 mb-6 flex items-start gap-4">
      <div className="flex-shrink-0 flex flex-col items-center">
        <span className="text-4xl md:text-5xl">{emoji}</span>
        {badge && (
          <span className="mt-1 inline-block text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            {badge}
          </span>
        )}
      </div>
      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-1">{title}</h2>
        <div className="text-gray-700">{desc}</div>
      </div>
    </div>
  );
}
