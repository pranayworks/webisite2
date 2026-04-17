import React from "react"
import Link from "next/link"

const MaterialIcon = ({ name }: { name: string }) => (
  <span className="material-symbols-outlined shrink-0" style={{ fontSize: 'inherit' }}>
    {name}
  </span>
)

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#121410] text-[#e3e3db] font-['Manrope'] selection:bg-[#b2f432] selection:text-[#233600]">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#121410]/70 backdrop-blur-xl border-b border-[#424935]/10 flex justify-between items-center px-8 h-20">
        <Link href="/" className="flex items-center gap-3 text-[#c2caaf] hover:text-[#b2f432] transition-colors">
          <MaterialIcon name="arrow_back" />
          <span className="font-bold text-xs uppercase tracking-widest">Back to Home</span>
        </Link>
        <Link href="/">
          <h1 className="font-['Noto_Serif'] italic text-xl text-[#b2f432]">Green Legacy</h1>
        </Link>
      </header>

      <main className="pt-32 pb-20 px-8 max-w-3xl mx-auto">
        <header className="mb-16">
          <div className="text-[10px] text-[#b2f432] font-bold uppercase tracking-[0.5em] mb-4">Stewardship Protocol</div>
          <h2 className="font-['Noto_Serif'] text-5xl font-bold">Privacy Policy</h2>
          <p className="text-[#c2caaf] mt-4 text-sm font-bold uppercase tracking-widest">Effective Date: April 16, 2026</p>
        </header>

        <section className="space-y-12 leading-relaxed text-[#c2caaf]">
          <div className="space-y-4">
            <h3 className="font-['Noto_Serif'] text-2xl font-bold text-[#e3e3db]">1. Information Collection</h3>
            <p>We collect essential data to verify your botanical heritage. This includes your name, email address, phone number, and location data related to tree stewardship. For "Sign in with Google," we receive your public profile information only.</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-['Noto_Serif'] text-2xl font-bold text-[#e3e3db]">2. Data Stewardship</h3>
            <p>Your data is not a commodity; it is part of our shared ecological registry. We use it exclusively to provide you with verified impact reports, growth updates for your trees, and secure access to your portal. We do not sell user data to advertising networks.</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-['Noto_Serif'] text-2xl font-bold text-[#e3e3db]">3. Storage and Protection</h3>
            <p>Our digital infrastructure leverages industry-standard encryption protocols (SSL/TLS) through Supabase. Profile photos are stored in secure cloud buckets with individual row-level security policies to ensure only you can manage your visual identity.</p>
          </div>

           <div className="space-y-4">
            <h3 className="font-['Noto_Serif'] text-2xl font-bold text-[#e3e3db]">4. Your Rights</h3>
            <p>As a steward of Green Legacy, you have the right to request a full transcript of your data or permanently delete your account sequence. To exercise these rights, please contact our Registry Team.</p>
          </div>
        </section>

        <div className="mt-20 p-8 border border-[#424935]/10 rounded-3xl bg-[#1a1c18]/50 text-xs text-center">
          <p>© 2026 GREEN LEGACY. PROTECTED BY SECURE BOTANICAL PROTOCOLS.</p>
        </div>
      </main>
    </div>
  )
}
