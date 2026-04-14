"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
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
  }
]

export default function AboutPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121410] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#b2f432] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) return null
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

            {/* Centered Single Member Layout */}
            <div className="flex justify-center">
              {teamMembers.map((member) => (
                <div key={member.name} className="group max-w-sm text-center">
                  <div className="aspect-[4/5] overflow-hidden mb-8 bg-muted rounded-2xl shadow-2xl">
                    <img
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt={`Portrait of ${member.name}`}
                      src={member.img}
                    />
                  </div>
                  <h3 className="font-serif text-4xl mb-2 text-foreground">{member.name}</h3>
                  <p className="uppercase tracking-[0.3em] text-primary text-sm font-bold mb-6">{member.role}</p>
                  <p className="text-muted-foreground text-lg leading-relaxed">{member.desc}</p>
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
