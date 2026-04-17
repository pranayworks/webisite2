'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { calculateImpact } from '@/lib/impact'

export default function MetricsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState(calculateImpact(0))

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setUser({ ...user, profile })
      setMetrics(calculateImpact(profile?.trees_planted || 0))
    }
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121410] flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-[#b2f432]/20 flex items-center justify-center animate-pulse">
          <span className="material-symbols-outlined text-4xl text-[#b2f432]" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen">
      <aside className="h-screen w-72 fixed left-0 top-0 bg-surface-container-lowest flex-col py-8 px-6 space-y-8 hidden md:flex z-50">
        <div className="flex flex-col gap-1 mb-4">
          <Link href="/">
            <span className="font-serif text-xl font-black text-[#b2f432] cursor-pointer hover:opacity-80 transition-opacity">Green Legacy</span>
          </Link>
          <span className="font-body text-xs text-on-surface-variant tracking-widest uppercase">Legacy Tier: Oak</span>
        </div>
        <nav className="flex flex-col space-y-2">
          <Link href="/dashboard" className="flex items-center gap-4 py-3 px-4 text-on-surface-variant hover:bg-white/5 hover:text-[#b2f432] transition-all duration-500 ease-in-out">
            <span className="material-symbols-outlined material-icon">dashboard</span>
            <span className="font-body text-sm font-medium">Overview</span>
          </Link>
          <Link href="/dashboard/metrics" className="flex items-center gap-4 py-3 px-4 text-[#b2f432] font-bold bg-[#b2f432]/10 rounded-r-full transition-all duration-500 ease-in-out">
            <span className="material-symbols-outlined material-icon">analytics</span>
            <span className="font-body text-sm font-medium">Metrics</span>
          </Link>
          <Link href="#" className="flex items-center gap-4 py-3 px-4 text-on-surface-variant hover:bg-white/5 hover:text-[#b2f432] transition-all duration-500 ease-in-out">
            <span className="material-symbols-outlined material-icon">workspace_premium</span>
            <span className="font-body text-sm font-medium">Archive</span>
          </Link>
          <Link href="#" className="flex items-center gap-4 py-3 px-4 text-on-surface-variant hover:bg-white/5 hover:text-[#b2f432] transition-all duration-500 ease-in-out">
            <span className="material-symbols-outlined material-icon">groups</span>
            <span className="font-body text-sm font-medium">Community</span>
          </Link>
        </nav>
        <div className="mt-auto flex flex-col space-y-2">
          <Link href="/subscriptions" className="block w-full">
            <button className="w-full bg-primary text-on-primary font-bold py-3 px-6 rounded-full text-sm mb-6 active:scale-95 transition-transform">
              Plant a Tree
            </button>
          </Link>
          <Link href="/" className="flex items-center gap-4 py-2 px-4 text-on-surface-variant hover:text-[#b2f432] transition-colors">
            <span className="material-symbols-outlined material-icon">home</span>
            <span className="font-body text-sm">Home Page</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-4 py-2 px-4 text-on-surface-variant hover:text-[#b2f432] transition-colors text-left">
            <span className="material-symbols-outlined material-icon">logout</span>

          </button>
        </div>
      </aside>

      <header className="fixed top-0 right-0 left-0 md:left-72 z-40 bg-[#121410]/70 backdrop-blur-xl flex justify-between items-center px-8 h-20 max-w-none mx-auto border-b border-outline-variant/10">
        <div className="flex items-center gap-8">
          <span className="font-serif text-2xl font-bold tracking-tighter text-[#b2f432]">Green Legacy</span>
          <nav className="hidden lg:flex gap-6">
            <Link href="/dashboard" className="text-on-surface-variant hover:text-on-surface transition-colors font-body text-sm">Overview</Link>
            <Link href="/dashboard/metrics" className="text-[#b2f432] border-b-2 border-[#b2f432] pb-1 font-body text-sm">Metrics</Link>
            <Link href="#" className="text-on-surface-variant hover:text-on-surface transition-colors font-body text-sm">Archive</Link>
            <Link href="#" className="text-on-surface-variant hover:text-on-surface transition-colors font-body text-sm">Community</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm flex items-center">search</span>
            <input className="bg-surface-container-highest border-none rounded-full pl-10 pr-4 py-1.5 text-sm w-48 focus:ring-1 focus:ring-primary/40 focus:outline-none" placeholder="Search archive..." type="text" />
          </div>

        </div>
      </header>

      <main className="md:ml-72 pt-32 pb-20 px-8 lg:px-16 max-w-7xl">
        <section className="mb-16">
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-on-surface tracking-tight mb-4">Impact Dashboard</h1>
          <p className="font-body text-lg text-on-surface-variant max-w-2xl leading-relaxed">Quantifying the silent growth of our digital forest. Every data point represents a physical legacy planted for the generations to come.</p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-surface-container-low p-8 rounded-xl flex flex-col gap-2">
            <span className="font-body text-xs uppercase tracking-widest text-on-surface-variant">Carbon Sequestration</span>
            <span className="font-serif text-4xl font-bold text-on-surface">{metrics.carbonOffset}<span className="text-primary text-xl ml-1">tCO2e</span></span>
            <div className="mt-4 h-1 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${Math.min(100, (metrics.carbonOffset / 20) * 100)}%` }}></div>
            </div>
            <span className="text-[10px] text-on-surface-variant mt-1">{Math.round(Math.min(100, (metrics.carbonOffset / 20) * 100))}% of annual goal reached</span>
          </div>

          <div className="bg-surface-container-low p-8 rounded-xl flex flex-col gap-2">
            <span className="font-body text-xs uppercase tracking-widest text-on-surface-variant">Water Restored</span>
            <span className="font-serif text-4xl font-bold text-on-surface">{metrics.waterSaved}k<span className="text-primary text-xl ml-1">Liters</span></span>
            <div className="mt-4 flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-xs material-icon">trending_up</span>
              <span className="text-[10px] text-primary">Dynamic increase based on soil moisture</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-8 rounded-xl flex flex-col gap-2">
            <span className="font-body text-xs uppercase tracking-widest text-on-surface-variant">Survival Rate</span>
            <span className="font-serif text-4xl font-bold text-on-surface">{metrics.survivalRate}<span className="text-primary text-xl ml-1">%</span></span>
            <span className="text-[10px] text-on-surface-variant mt-auto">Verified via Satellite Imagery</span>
          </div>

          <div className="bg-surface-container-low p-8 rounded-xl flex flex-col gap-2">
            <span className="font-body text-xs uppercase tracking-widest text-on-surface-variant">Soil Vitality</span>
            <span className="font-serif text-4xl font-bold text-on-surface">{metrics.soilVitality}<span className="text-primary text-xl ml-1">/10</span></span>
            <span className="text-[10px] text-on-surface-variant mt-auto">Active Nitrogen Enrichment</span>
          </div>
        </section>

        <section className="mb-16">
          <div className="bg-surface-container-low rounded-2xl overflow-hidden shadow-[0_40px_40px_-5px_rgba(13,15,11,0.08)]">
            <div className="p-8 border-b border-outline-variant/10 flex justify-between items-end">
                <h2 className="font-serif text-3xl font-bold text-on-surface mb-2">Cumulative Carbon Offset Over Time</h2>
                <p className="font-body text-sm text-on-surface-variant">Metric tons of CO2 sequestered through active reforestation</p>
              <div className="flex gap-4">
                <button className="bg-surface-container-highest px-4 py-1.5 rounded-full text-xs font-medium text-on-surface">YTD</button>
                <button className="px-4 py-1.5 rounded-full text-xs font-medium text-on-surface-variant hover:text-on-surface">ALL TIME</button>
              </div>
            </div>
            <div className="p-8 h-[400px] relative">
              <div className="absolute inset-0 p-8 flex items-end gap-1">
                <div className="flex-1 bg-primary/20 h-[30%] rounded-t-lg relative group">
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-surface-container-highest px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">4.2t</div>
                </div>
                <div className="flex-1 bg-primary/30 h-[45%] rounded-t-lg"></div>
                <div className="flex-1 bg-primary/40 h-[38%] rounded-t-lg"></div>
                <div className="flex-1 bg-primary/50 h-[55%] rounded-t-lg"></div>
                <div className="flex-1 bg-primary/60 h-[62%] rounded-t-lg"></div>
                <div className="flex-1 bg-primary/70 h-[75%] rounded-t-lg"></div>
                <div className="flex-1 bg-primary/80 h-[82%] rounded-t-lg"></div>
                <div className="flex-1 bg-primary/90 h-[70%] rounded-t-lg"></div>
                <div className="flex-1 bg-primary h-full rounded-t-lg"></div>
                <div className="flex-1 bg-primary h-[88%] rounded-t-lg"></div>
                <div className="flex-1 bg-primary h-[94%] rounded-t-lg"></div>
                <div className="flex-1 bg-primary h-[98%] rounded-t-lg"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-8 flex justify-around items-center px-8 text-[10px] text-on-surface-variant uppercase tracking-tighter">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 bg-surface-container-low p-8 rounded-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="font-serif text-3xl font-bold text-on-surface mb-6">Water Restoration Metrics</h2>
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                    <span className="material-symbols-outlined material-icon">waves</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-on-surface">Groundwater Recharge</span>
                      <span className="text-sm text-primary">124,500 L</span>
                    </div>
                    <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-primary-container w-[65%]"></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined material-icon">filter_vintage</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-on-surface">Natural Filtration Vol.</span>
                      <span className="text-sm text-primary">82,100 L</span>
                    </div>
                    <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-primary-container w-[48%]"></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined material-icon">opacity</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-on-surface">Evapotranspiration Index</span>
                      <span className="text-sm text-primary">77,400 L</span>
                    </div>
                    <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-primary-container w-[42%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 opacity-5">
              <span className="material-symbols-outlined text-[300px] material-icon">water_drop</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-8 rounded-2xl flex flex-col">
            <h2 className="font-serif text-3xl font-bold text-on-surface mb-2">Biodiversity Index</h2>
            <p className="font-body text-xs text-on-surface-variant mb-8 uppercase tracking-widest">Species count by genus</p>
            <div className="flex-1 flex flex-col justify-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-primary"></div>
                <span className="font-body text-sm flex-1">Indigenous Flora</span>
                <span className="font-serif font-bold">142</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-primary/60"></div>
                <span className="font-body text-sm flex-1">Pollinator Species</span>
                <span className="font-serif font-bold">87</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-primary/30"></div>
                <span className="font-body text-sm flex-1">Soil Micro-fauna</span>
                <span className="font-serif font-bold">1.2k</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-primary/10"></div>
                <span className="font-body text-sm flex-1">Migratory Birds</span>
                <span className="font-serif font-bold">24</span>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-outline-variant/10 text-center">
              <span className="font-serif text-5xl font-bold text-on-surface">+12.4%</span>
              <p className="text-[10px] text-on-surface-variant uppercase mt-1">Net Diversity Gain</p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="bg-primary-container/10 p-12 rounded-3xl border border-primary/5 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <h2 className="font-serif text-4xl font-bold text-on-surface mb-6">Personal Contribution vs. Global Goal</h2>
              <p className="font-body text-on-surface-variant mb-10 leading-relaxed italic">&quot;The best time to plant a tree was 20 years ago. The second best time is now. Your individual effort ripples across the collective forest.&quot;</p>
              <div className="space-y-12">
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <span className="font-body text-lg font-bold text-primary">Your Dashboard</span>
                    <span className="font-serif text-2xl">1,248 Trees</span>
                  </div>
                  <div className="h-4 bg-surface-container-highest rounded-full">
                    <div className="h-full bg-primary w-[0.15%] rounded-full shadow-[0_0_20px_rgba(178,244,50,0.4)]"></div>
                  </div>
                  <div className="mt-3 flex justify-between text-[10px] uppercase tracking-widest text-on-surface-variant">
                    <span>You</span>
                    <span>Global Target: 1,000,000</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <span className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Global Impact Share</span>
                    <span className="font-serif text-3xl font-bold">0.12%</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Active Rank</span>
                    <span className="font-serif text-3xl font-bold">#4,281</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 hidden md:block">
              <img alt="Sustainable growth" className="h-full w-full object-cover grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBycYpaumJtAiknMvK9oqBs8cPcIVdQRa1Q2RXMnqlrsCZ3TFJB9EXBe6AOdBV5U9UquPbekjnuLmh-oUM8zvA3fTL9AFSfrGJvYrCbc9M1QlckD4DjqJNlpadFLLQmc9Nb3FxKzCxMk8t1fK8jISNL6sL2CGKnC3gAQ3Ll_fDDJAs9gXYuX18qEHUHX8KgmL8N3PW4qAIM0TxtVXzd9uSxP5R0xF-FzXPtX936eF8csiJ42r5gSjB3oVcUYy0NxQrcRJllesL__tvi" />
            </div>
          </div>
        </section>
      </main>

      <footer className="md:ml-72 bg-[#121410] border-t border-white/5 flex flex-col md:flex-row justify-between items-center px-12 py-16 mt-auto pb-32 md:pb-16">
        <div className="mb-8 md:mb-0 text-center md:text-left">
          <span className="font-serif italic text-on-surface text-xl mb-2 block">Green Legacy</span>
          <p className="font-sans text-on-surface-variant text-xs">© 2026 Green Legacy. Dedicated to a greener future.</p>
        </div>
        <div className="flex gap-8">
          <Link href="#" className="text-on-surface-variant hover:text-[#b2f432] transition-colors text-xs uppercase tracking-widest font-medium">Privacy Policy</Link>
          <Link href="#" className="text-on-surface-variant hover:text-[#b2f432] transition-colors text-xs uppercase tracking-widest font-medium">Ethical Sourcing</Link>
          <Link href="#" className="text-on-surface-variant hover:text-[#b2f432] transition-colors text-xs uppercase tracking-widest font-medium">Sustainability Report</Link>
        </div>
      </footer>

      {/* BottomNavBar (Mobile only Filter from Hierarchy) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#1a1c18] border-t border-[#424935]/10 flex items-center justify-around z-50">
        <Link className="flex flex-col items-center gap-1 text-[#c2caaf]" href="/dashboard">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[8px] uppercase tracking-widest font-bold">Home</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 text-[#b2f432]" href="/dashboard/metrics">
          <span className="material-symbols-outlined">analytics</span>
          <span className="text-[8px] uppercase tracking-widest">Metrics</span>
        </Link>
        <div className="-mt-8">
          <Link href="/subscriptions">
            <div className="h-14 w-14 rounded-full bg-[#b2f432] flex items-center justify-center shadow-lg hover:bg-[#97d700] transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[#233600]">add</span>
            </div>
          </Link>
        </div>
        <Link className="flex flex-col items-center gap-1 text-[#c2caaf]" href="#">
          <span className="material-symbols-outlined">workspace_premium</span>
          <span className="text-[8px] uppercase tracking-widest">Awards</span>
        </Link>

      </nav>
    </div>
  )
}
