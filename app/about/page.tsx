import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { cn } from "@/lib/utils"

const teamMembers = [
  {
    name: "Pranay",
    role: "Founder & Director",
    desc: "A visionary environmentalist with two decades of experience in conservation strategy and ecological restoration.",
    img: "https://res.cloudinary.com/dqgqdszk2/image/upload/q_auto/f_auto/v1775438058/WhatsApp_Image_2026-04-06_at_6.38.31_AM_sxtmuk.jpg",
    mt: false
  },
  {
    name: "Sai Kumar",
    role: "CEO",
    desc: "Specializing in sustainable logistics, Sai Kumar ensures our mission is executed with clinical precision across three continents.",
    img: "https://res.cloudinary.com/dqgqdszk2/image/upload/q_auto/f_auto/v1766557531/Screenshot_2025-10-05_113652_fihp8k.png",
    mt: true
  },
  {
    name: "Marcus Chen",
    role: "Lead Ecologist",
    desc: "A doctorate holder in Botany, Marcus oversees the selection of species to ensure maximum biodiversity and resilience.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfLIjlb_vFUkF3_c8AA1J9fbfEch2b4zt-Ycup_-8DpI6vLd3Gx2LOeyDmRE3P1rHGQKo86Je4PpyPGQwTtnp5SpD_Gpb0OtgVf5XC5B1uGm-IzRFVzzdUYKqQL8hClK7MS-4_l0PEtcxydBreGmCS1GHe-rnbFsSaQFq2IJSB2Cf3SiEWsDFsACNxpupyXmfnSYP5aqAgceNcq6GqMSM5FgA3oLOUx-cHylYAfWWLG_vfgdoItntdhxBDOnccOhEDECIyYevWYgA7",
    mt: false
  },
  {
    name: "Aria Sterling",
    role: "Head of Impact",
    desc: "Aria measures the ripple effects of our growth, translating biological data into meaningful human stories of transformation.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4ixdXPweLPirumN0qv_eP-fu8d5giMpUrT7iqg1EDDfKbMrrWrcmWlPEld8iQBoR7FfJgPDQMIOgPXwGSQDm_4S2oKruya-S_zrTa0ZKC-582yofqiwNA1ciUgPjBOWjplyGraZSwDIOxHu5FY27sXSQ0QY5m44-Ul070lmLUvfibPE6p2vLvFqUkedcnZbGPe_nIio5cUqpNIC6YjDT0Ku_-6HfR2LNLjQRSk2egEs9g4f6su7AevX9LL5d-bEkHB13B8mW5qRzN",
    mt: false
  },
  {
    name: "Simon Brooks",
    role: "Field Director",
    desc: "On the ground every day, Simon leads our planting teams with a deep respect for the land and those who tend to it.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDnMluS6sQdFRKMNBJ45IC0GMJgZGMV18q2H4Qi79nyUg1fOAtgsEOv4JhVDsN2KepaZF9_LcJFneF43jJe_dfxGv-FdJftbeAilWl3lKlJnvv_RqIIPPFJKGg6-kE7VnGpMCu5uNjKPJ-VxyzmzCP1EH0ZxLNCvJXR6PFEVdB9r-xpM5OVKUC1Z2_Omf-P8uf1oocd5urhWaN3Cbqqt4V6hx1rHg_HpaVQbErpaxMChKHI3kYRcRBsOyyYiK2ubS1zkwhyM-D7Jc5",
    mt: true
  }
]

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero Section */}
        <section className="relative h-[921px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0 bg-background">
            <img
              className="w-full h-full object-cover opacity-20 dark:opacity-40 transition-opacity"
              alt="expansive view of a dense ancient forest with sunlight filtering through tall redwood trees"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtHzMNvMVQ3rxUSn02gGKaO5yfOG-1x4LuLCJlT3-sR5DDg1P2cwPfmvO70DfQ_C2FRuezc72We6w8nI8c7zCfjChZLX2DtJ9UbF8XAsiTBChjn0y4KjA8ktbx4QOFHckKp-EQw3ib34hQOHKkl1BsIxOZyUXhBEJJTR1v7h5QPQB-F3hlzat4xQgdpqIegjubZOC9ZNM-z8803YtJnNB4GOFi1gBSBHKuZeFODl7ibphwQZqhRKlYH4VwckDmR9COs6EQ4SFL2dOu"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-transparent to-background"></div>
          </div>
          <div className="relative z-10 text-center px-6 pt-28 md:pt-32">
            <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl tracking-tighter text-foreground mb-8 max-w-5xl mx-auto">
              The Guardians <br /> <span className="italic font-normal">of</span> Growth
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed opacity-90">
              A digital arboretum dedicated to preserving the biological heritage of our planet through transparency, technology, and timeless stewardship.
            </p>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-32 px-8 bg-background">
          <div className="max-w-screen-xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
              <div className="md:col-span-4">
                <span className="uppercase tracking-widest text-primary text-sm font-bold">The Narrative</span>
                <h2 className="font-serif text-5xl mt-6 leading-tight text-foreground">Our Roots</h2>
              </div>
              <div className="md:col-span-8">
                <div className="space-y-12 text-muted-foreground text-xl leading-[1.8] font-light">
                  <p>
                    Green Legacy began not in a boardroom, but in a silent clearing deep within the Pacific Northwest. We observed a disconnect between the digital acceleration of our era and the slow, essential rhythms of the natural world.
                  </p>
                  <p>
                    Our mission is to bridge that divide. We treat environmental conservation not as a charitable afterthought, but as a premium legacy—a high-end investment in the survival and flourishing of our global ecosystem.
                  </p>
                  <p className="text-foreground italic border-l-4 border-primary pl-8 py-2">
                    "We don't just plant trees; we build the architectural framework for future forests."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Team Section */}
        <section className="py-32 px-8 bg-muted/30">
          <div className="max-w-screen-2xl mx-auto">
            <div className="mb-24 text-center">
              <span className="uppercase tracking-widest text-primary text-sm font-bold">The Collective</span>
              <h2 className="font-serif text-6xl mt-4 text-foreground">Core Team</h2>
            </div>

            {/* Team Grid: Asymmetrical Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
              {teamMembers.map((member) => (
                <div key={member.name} className={cn("group", member.mt && "lg:mt-24")}>
                  <div className="aspect-[4/5] overflow-hidden mb-8 bg-muted rounded-2xl">
                    <img
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      alt={`Portrait of ${member.name}`}
                      src={member.img}
                    />
                  </div>
                  <h3 className="font-serif text-3xl mb-1 text-foreground">{member.name}</h3>
                  <p className="uppercase tracking-widest text-primary text-xs font-bold mb-4">{member.role}</p>
                  <p className="text-muted-foreground text-base leading-relaxed">{member.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-40 px-8 relative overflow-hidden bg-background">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="font-serif text-5xl md:text-7xl mb-12 text-foreground">Join the Legacy</h2>
            <p className="text-xl text-muted-foreground mb-16 max-w-2xl mx-auto leading-relaxed">
              Be part of a global movement redefining what it means to protect our future. Your contribution seeds the forests of the next century.
            </p>
            <a href="/get-involved">
              <button className="bg-primary text-primary-foreground px-12 py-5 rounded-full font-bold text-lg tracking-tight hover:opacity-90 transition-all active:scale-95 shadow-2xl shadow-primary/20">
                Become a Guardian
              </button>
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
