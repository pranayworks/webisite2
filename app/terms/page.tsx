import React from "react"
import Link from "next/link"

const MaterialIcon = ({ name }: { name: string }) => (
  <span className="material-symbols-outlined shrink-0" style={{ fontSize: 'inherit' }}>
    {name}
  </span>
)

export default function TermsPage() {
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
          <div className="text-[10px] text-[#b2f432] font-bold uppercase tracking-[0.5em] mb-4">Stewardship Charter</div>
          <h2 className="font-['Noto_Serif'] text-5xl font-bold">Terms & Conditions</h2>
          <p className="text-[#c2caaf] mt-4 text-sm font-bold uppercase tracking-widest">Last Revised: April 16, 2026</p>
        </header>

        <section className="space-y-12 leading-relaxed text-[#c2caaf]">
          <div className="space-y-4">
            <h3 className="font-['Noto_Serif'] text-2xl font-bold text-[#e3e3db]">1. Acceptance of Terms</h3>
            <p>By accessing the Green Legacy portal and initiating a tree planting sequence, you agree to bound by this Stewardship Charter. You certify that the information provided during signup and steward identity verification is accurate and true.</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-['Noto_Serif'] text-2xl font-bold text-[#e3e3db]">2. Tree Stewardship</h3>
            <p>Green Legacy acts as a bridge between stewards and physical plantation sites. While we guarantee the plantation and maintenance of your tree for its critical first 3 years, the physical ownership of the land remains with our partner institutions and agriculture colleges.</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-['Noto_Serif'] text-2xl font-bold text-[#e3e3db]">3. Certifications and Verification</h3>
            <p>All digital certificates issued by Green Legacy are legal confirmations of your environmental impact. They are non-transferable and tied to your unique Steward ID. Unauthorized reproduction of these documents for commercial gain is prohibited.</p>
          </div>

           <div className="space-y-4">
            <h3 className="font-['Noto_Serif'] text-2xl font-bold text-[#e3e3db]">4. Prohibited Conduct</h3>
            <p>Users must not interfere with the biological or digital integrity of the Green Legacy. This includes fraudulent GPS manipulation, unauthorized access to other stewardship files, or any activity that compromises the community's trust.</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-['Noto_Serif'] text-2xl font-bold text-[#e3e3db]">5. Termination</h3>
            <p>We reserve the right to suspend or terminate any stewardship account that violates this Charter. Upon termination, your digital certificates may be suspended, but the physical trees planted will continue their biological mission as part of the public forest.</p>
          </div>
        </section>

        <div className="mt-20 p-8 border border-[#424935]/10 rounded-3xl bg-[#1a1c18]/50 text-xs text-center">
          <p>© 2026 GREEN LEGACY. STRENGTH THROUGH STEWARDSHIP.</p>
        </div>
      </main>
    </div>
  )
}
