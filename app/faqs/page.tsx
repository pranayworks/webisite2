import React from "react"
import Link from "next/link"

const MaterialIcon = ({ name }: { name: string }) => (
  <span className="material-symbols-outlined shrink-0" style={{ fontSize: 'inherit' }}>
    {name}
  </span>
)

export default function FAQPage() {
  const faqs = [
    {
      q: "How does my tree plantation contribute to the environment?",
      a: "Every tree planted through Green Legacy is a verified biological asset. One mature tree can absorb approximately 22kg of CO2 per year and produce enough oxygen for two people. Your contribution directly offsets carbon and restores local biodiversity."
    },
    {
      q: "Can I visit my tree in person?",
      a: "Yes! We encourage 'Physical Stewardship.' After your tree reaches its 6-month establishment milestone, we provide precise GPS coordinates and can facilitate guided visits to our partner agriculture college sites."
    },
    {
      q: "What species of trees are planted?",
      a: "We prioritize native species such as Neem, Peepal, Banyan, and Gulmohar. These species are selected for their high survival rates, ecological compatibility, and cultural significance in the Indian landscape."
    },
    {
      q: "How do I get my certificate?",
      a: "Certificates are generated instantly once your steward identity is verified. You can find and download your high-resolution official PDF certificates directly from your Dashboard."
    },
    {
      q: "What happens if a tree doesn't survive?",
      a: "We guarantee survival. If a sapling fails during the first 3 years of its growth, our field partners automatically replace it with a new healthy specimen at no extra cost to the steward."
    }
  ]

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

      <main className="pt-32 pb-20 px-8 max-w-4xl mx-auto">
        <header className="text-center space-y-4 mb-16">
          <h2 className="font-['Noto_Serif'] text-5xl font-bold">Frequently Asked Questions</h2>
          <p className="text-[#c2caaf] text-lg max-w-2xl mx-auto">Your guide to digital stewardship and ecological restoration.</p>
        </header>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-[#1a1c18] border border-[#424935]/10 rounded-2xl p-8 hover:border-[#b2f432]/30 transition-all group">
              <h3 className="font-['Noto_Serif'] text-xl font-bold mb-4 flex gap-4 text-[#e3e3db] group-hover:text-[#b2f432] transition-colors">
                <span className="text-sm border border-[#b2f432]/30 rounded-full h-8 w-8 flex items-center justify-center shrink-0">0{index + 1}</span>
                {faq.q}
              </h3>
              <p className="text-[#c2caaf] leading-relaxed pl-12">{faq.a}</p>
            </div>
          ))}
        </div>

        <section className="mt-20 bg-[#b2f432] p-12 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-4 text-center md:text-left text-[#233600]">
            <h3 className="font-['Noto_Serif'] text-3xl font-bold">Still have questions?</h3>
            <p className="font-medium opacity-80">Our Master Stewards are ready to assist you in the field.</p>
          </div>
          <Link href="/contact">
            <button className="bg-[#233600] text-[#b2f432] px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
              Contact Support
            </button>
          </Link>
        </section>
      </main>

      <footer className="py-12 border-t border-[#424935]/10 text-center">
        <p className="text-[#c2caaf]/40 text-xs uppercase tracking-widest">© 2026 THE DIGITAL ARBORETUM. PROTECTED BY STEWARDSHIP PROTOCOLS.</p>
      </footer>
    </div>
  )
}
