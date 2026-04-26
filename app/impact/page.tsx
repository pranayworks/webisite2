"use client"

import { useState, useEffect, useMemo } from "react"
import { TreePine, Wind, Droplets, Sun, Users, GraduationCap, Building2, Briefcase, TrendingUp } from "lucide-react"
import { SiteHeader } from "../../components/site-header"
import { SiteFooter } from "../../components/site-footer"
import { useScrollAnimation, useCountUp } from "../../hooks/use-scroll-animation"
import { cn } from "../../lib/utils"
import { supabase } from "../../lib/supabase"
import { calculateImpact } from "../../lib/impact"
import { useRouter } from "next/navigation"

const liveStats = [
  { icon: TreePine, label: "Trees Planted Today", value: 0, color: "text-green-500" },
  { icon: TrendingUp, label: "This Month", value: 0, color: "text-emerald-500" },
  { icon: TreePine, label: "Total Trees", value: 0, color: "text-green-600" },
  { icon: Wind, label: "CO2 Offset (Tonnes)", value: 0, color: "text-sky-500" },
  { icon: Sun, label: "O2 Produced (Tonnes)", value: 0, color: "text-amber-500" },
  { icon: Droplets, label: "Water Conserved (ML)", value: 0, color: "text-blue-500" },
]

const envData = [
  { label: "Neem", count: 1420, pct: 0 },
  { label: "Banyan", count: 980, pct: 0 },
  { label: "Teak", count: 870, pct: 0 },
  { label: "Mango", count: 760, pct: 0 },
  { label: "Peepal", count: 650, pct: 0 },
  { label: "Others", count: 1167, pct: 0 },
]

const fallbackStories = [
  { title: "From Barren Land to Green Campus", location: "Tamil Nadu Agricultural University", excerpt: "How 500 trees transformed the campus landscape and created a biodiversity corridor." },
  { title: "A Father's Legacy Lives On", location: "Anand, Gujarat", excerpt: "Rajesh planted 25 trees in memory of his father. Two years later, the small grove has become a community gathering space." },
  { title: "Corporate Impact at Scale", location: "TechCorp India, Bengaluru", excerpt: "500 trees across 5 colleges. Their CSR initiative engaged 200 employees." },
]

export default function ImpactPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"environmental" | "social" | "economic">("environmental")
  const [stats, setStats] = useState({
    today: 0,
    month: 124,
    total: 584,
    co2: 0,
    o2: 0,
    water: 0
  })

  const [speciesStats, setSpeciesStats] = useState(envData)

  useEffect(() => {
    async function fetchData() {
      const { data: allOrders } = await supabase
        .from('planting_orders')
        .select('trees, species, created_at')

      if (allOrders) {
        const totalTrees = allOrders.reduce((acc, curr) => acc + (curr.trees || 1), 0)
        const today = new Date().toISOString().split('T')[0]
        const monthStr = new Date().toISOString().substring(0, 7)

        const treesToday = allOrders
          .filter(o => o.created_at?.startsWith(today))
          .reduce((acc, curr) => acc + (curr.trees || 1), 0)

        const treesMonth = allOrders
          .filter(o => o.created_at?.startsWith(monthStr))
          .reduce((acc, curr) => acc + (curr.trees || 1), 0)

        const impact = calculateImpact(totalTrees)

        setStats({
          today: treesToday,
          month: treesMonth,
          total: totalTrees,
          co2: impact.carbonOffset,
          o2: Number((totalTrees * 2.3).toFixed(1)),
          water: Number((impact.waterSaved / 1000).toFixed(1))
        })
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation()
  const { ref: liveRef, isVisible: liveVisible } = useScrollAnimation()
  const { ref: tabRef, isVisible: tabVisible } = useScrollAnimation()
  const { ref: storiesRef, isVisible: storiesVisible } = useScrollAnimation()

  const liveStatsDynamic = useMemo(() => [
    { icon: TreePine, label: "Trees Planted Today", value: stats.today, color: "text-green-500" },
    { icon: TrendingUp, label: "This Month", value: stats.month, color: "text-emerald-500" },
    { icon: TreePine, label: "Total Trees", value: stats.total, color: "text-green-600" },
    { icon: Wind, label: "CO2 Offset (Tonnes)", value: stats.co2, color: "text-sky-500" },
    { icon: Sun, label: "O2 Produced (Tonnes)", value: stats.o2, color: "text-amber-500" },
    { icon: Droplets, label: "Water Conserved (ML)", value: stats.water, color: "text-blue-500" },
  ], [stats])

  const liveCountUps = [
    useCountUp(stats.today, 2000, liveVisible),
    useCountUp(stats.month, 2000, liveVisible),
    useCountUp(stats.total, 2000, liveVisible),
    useCountUp(stats.co2, 2000, liveVisible),
    useCountUp(stats.o2, 2000, liveVisible),
    useCountUp(stats.water, 2000, liveVisible)
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121410] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#b2f432] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
      <SiteHeader />
      <main className="bg-[#121410] text-[#e3e3db]">
        <section ref={heroRef} className="relative overflow-hidden pt-28 pb-16 md:pt-36">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(178,244,50,0.06)_0%,transparent_60%)]" />
          <div className={cn("relative z-10 mx-auto max-w-4xl px-4 text-center transition-all duration-700", heroVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0")}>
            <p className="text-sm font-medium uppercase tracking-widest text-[#b2f432]">Impact Dashboard</p>
            <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl lg:text-5xl">
              Measurable Impact, Complete Transparency
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[#c2caaf]">
              Every tree is tracked, every rupee accounted for. See the real-time impact of our collective effort.
            </p>
          </div>
        </section>

        <section ref={liveRef} className="bg-[#1a1c18] py-16 border-y border-[#b2f432]/5">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {liveStatsDynamic.map((stat, i) => (
                <div key={stat.label} className="rounded-2xl border border-[#b2f432]/10 bg-[#121410]/50 p-6 text-center backdrop-blur-sm transition-all duration-500 hover:border-[#b2f432]/30">
                  <stat.icon className={cn("mx-auto h-6 w-6 mb-3", stat.color)} />
                  <div className="text-2xl font-bold text-[#e3e3db] mb-1">{liveCountUps[i]}</div>
                  <p className="text-[10px] uppercase tracking-wider text-[#c2caaf]/40 font-bold">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section ref={tabRef} className="py-20 lg:py-28">
           <div className="mx-auto max-w-7xl px-4 lg:px-8">
             <div className="mx-auto mb-12 flex max-w-md justify-center gap-1 rounded-full border border-[#424935]/20 bg-[#1a1c18] p-1">
               {(["environmental", "social", "economic"] as const).map((tab) => (
                 <button key={tab} onClick={() => setActiveTab(tab)} className={cn("flex-1 rounded-full px-4 py-2 text-sm font-medium capitalize transition-all", activeTab === tab ? "bg-[#b2f432] text-[#233600]" : "text-[#c2caaf] hover:text-[#e3e3db]")}>
                   {tab}
                 </button>
               ))}
             </div>
             
             {activeTab === "environmental" && (
                <div className="space-y-8 max-w-2xl mx-auto">
                   <h3 className="text-center font-bold text-xl mb-8">Movement Growth</h3>
                   {speciesStats.map((d) => (
                      <div key={d.label} className="space-y-2">
                        <div className="flex justify-between text-sm">
                           <span>{d.label}</span>
                           <span className="text-[#c2caaf]">{d.count.toLocaleString()} Specimens</span>
                        </div>
                        <div className="h-2 w-full bg-[#1a1c18] rounded-full overflow-hidden border border-[#b2f432]/10">
                           <div className="h-full bg-[#b2f432] transition-all duration-1000" style={{ width: `${Math.max(5, (d.count/stats.total)*100)}%` }} />
                        </div>
                      </div>
                   ))}
                </div>
             )}
           </div>
        </section>

        <section ref={storiesRef} className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <h2 className="text-center font-serif text-3xl font-bold mb-12">Impact Stories</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {fallbackStories.map((s, i) => (
                <div key={s.title} className="p-8 rounded-2xl border border-[#b2f432]/10 bg-[#1a1c18] hover:border-[#b2f432]/30 transition-all">
                  <p className="text-[10px] uppercase font-black text-[#b2f432] tracking-widest mb-2">{s.location}</p>
                  <h3 className="text-lg font-bold mb-3">{s.title}</h3>
                  <p className="text-sm text-[#c2caaf] leading-relaxed">{s.excerpt}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
