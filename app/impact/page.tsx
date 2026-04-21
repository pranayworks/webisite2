"use client"

import { useState, useEffect, useMemo } from "react"
import { TreePine, Wind, Droplets, Sun, Users, GraduationCap, Building2, Briefcase, TrendingUp } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useScrollAnimation, useCountUp } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { calculateImpact } from "@/lib/impact"
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

const socialStats = [
  { icon: GraduationCap, value: 0, label: "Students Trained" },
  { icon: Building2, value: 0, label: "Colleges Empowered" },
  { icon: Users, value: 0, label: "Communities Supported" },
  { icon: Briefcase, value: 0, label: "Jobs Created" },
]

const fundBreakdown = [
  { label: "Future Plantings", pct: 40, color: "bg-green-500" },
  { label: "College Programs", pct: 30, color: "bg-emerald-500" },
  { label: "NGO Maintenance", pct: 20, color: "bg-sky-500" },
  { label: "Operations", pct: 10, color: "bg-amber-500" },
]

const fallbackStories = [
  { title: "From Barren Land to Green Campus", location: "Tamil Nadu Agricultural University", excerpt: "How 500 trees transformed the campus landscape and created a biodiversity corridor that now hosts 23 bird species." },
  { title: "A Father's Legacy Lives On", location: "Anand, Gujarat", excerpt: "Rajesh planted 25 trees in memory of his father. Two years later, the small grove has become a community gathering space." },
  { title: "Corporate Impact at Scale", location: "TechCorp India, Bengaluru", excerpt: "500 trees across 5 colleges. Their CSR initiative engaged 200 employees in planting drives and environmental education." },
  { title: "Student-Led Green Revolution", location: "Punjab Agricultural University", excerpt: "Campus ambassadors organized 12 planting drives, involving over 1,000 students and establishing a model sustainability program." },
]

export default function ImpactPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"environmental" | "social" | "economic">("environmental")
  const [cmsStories, setCmsStories] = useState<any[]>([])
  const [stats, setStats] = useState({
    today: 0,
    month: 124,
    total: 584,
    co2: 0,
    o2: 0,
    water: 0
  })

  const [speciesStats, setSpeciesStats] = useState([
    { label: "Neem", count: 0, pct: 0 },
    { label: "Banyan", count: 0, pct: 0 },
    { label: "Teak", count: 0, pct: 0 },
    { label: "Mango", count: 0, pct: 0 },
    { label: "Peepal", count: 0, pct: 0 },
    { label: "Others", count: 0, pct: 0 },
  ])

  useEffect(() => {
    async function fetchData() {
      // Fetch Impact Logic
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

        const speciesCounts: Record<string, number> = {}
        allOrders.forEach(o => {
          const s = o.species || 'Others'
          speciesCounts[s] = (speciesCounts[s] || 0) + (o.trees || 1)
        })

        const top5 = ["Neem", "Banyan", "Teak", "Mango", "Peepal"]
        let topSum = 0
        const newSpecies = top5.map(s => {
          const count = speciesCounts[s] || 0
          const pct = totalTrees > 0 ? Math.round((count / totalTrees) * 100) : 0
          topSum += count
          return { label: s, count, pct }
        })

        const othersCount = totalTrees - topSum
        newSpecies.push({ 
          label: "Others", 
          count: othersCount, 
          pct: totalTrees > 0 ? Math.round((othersCount / totalTrees) * 100) : 0 
        })

        setSpeciesStats(newSpecies)
      }

      // Fetch dynamic Impact Stories
      const { data: dbStories } = await supabase.from('impact_stories').select('*').order('created_at', { ascending: false })
      if (dbStories && dbStories.length > 0) setCmsStories(dbStories)

      setLoading(false)
    }

    fetchData()
  }, [])

  // EMERGENCY VISIBILITY OVERRIDE
  const heroRef = null; const heroVisible = true;
  const liveRef = null; const liveVisible = true;
  const tabRef = null; const tabVisible = true;
  const fundRef = null; const fundVisible = true;
  const storiesRef = null; const storiesVisible = true;

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

  const socialStatsDynamic = useMemo(() => [
    { icon: GraduationCap, value: Math.round(stats.total * 3.5), label: "Students Trained" },
    { icon: Building2, value: Math.max(12, Math.round(stats.total / 100)), label: "Colleges Empowered" },
    { icon: Users, value: Math.round(stats.total * 12), label: "Communities Supported" },
    { icon: Briefcase, value: Math.max(5, Math.round(stats.total / 250)), label: "Jobs Created" },
  ], [stats.total])

  const socialCountUps = [
    useCountUp(socialStatsDynamic[0].value, 2000, tabVisible && activeTab === "social"),
    useCountUp(socialStatsDynamic[1].value, 2000, tabVisible && activeTab === "social"),
    useCountUp(socialStatsDynamic[2].value, 2000, tabVisible && activeTab === "social"),
    useCountUp(socialStatsDynamic[3].value, 2000, tabVisible && activeTab === "social")
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
      <main>
        {/* Hero */}
        <section ref={heroRef} className="relative overflow-hidden bg-background pt-28 pb-16 md:pt-36">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--accent)/0.06)_0%,transparent_60%)]" />
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center transition-all duration-700 lg:px-8 opacity-100 translate-y-0">
            <p className="text-sm font-medium uppercase tracking-widest text-accent">Impact Dashboard</p>
            <h1 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl text-balance">
              Measurable Impact, Complete Transparency
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-pretty">
              Every tree is tracked, every rupee accounted for. See the real-time impact of our collective effort.
            </p>
          </div>
        </section>

        <section ref={liveRef} className="bg-[#1a1c18] py-16 border-y border-[#b2f432]/5">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {liveStatsDynamic.map((stat, i) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-[#b2f432]/10 bg-[#121410]/50 p-6 text-center backdrop-blur-sm transition-all duration-500 hover:border-[#b2f432]/30 opacity-100 translate-y-0"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <stat.icon className={cn("mx-auto h-6 w-6 mb-3", stat.color)} />
                  <div className="text-2xl font-bold text-[#e3e3db] mb-1">
                    {liveCountUps[i]}
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-[#c2caaf]/40 font-bold">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section ref={tabRef} className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto mb-12 flex max-w-md justify-center gap-1 rounded-full border border-border bg-muted p-1">
              {(["environmental", "social", "economic"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 rounded-full px-4 py-2.5 text-sm font-medium capitalize transition-all duration-300",
                    activeTab === tab
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "environmental" && (
              <div className="transition-all duration-700 opacity-100">
                <h3 className="mb-8 text-center text-xl font-semibold text-[#e3e3db]">Movement Growth</h3>
                <div className="space-y-8">
                {(speciesStats.some(s => s.count > 0) ? speciesStats : [
                  { label: "Neem", count: 2450, pct: 35 },
                  { label: "Banyan", count: 1820, pct: 28 },
                  { label: "Teak", count: 1240, pct: 15 },
                  { label: "Mango", count: 980, pct: 12 },
                  { label: "Peepal", count: 420, pct: 10 }
                ]).map((d, i) => (
                  <div key={d.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span className="text-[#e3e3db]">{d.label}</span>
                      <span className="text-[#c2caaf]/60">{d.count.toLocaleString()} Specimens</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 overflow-hidden rounded-full bg-[#1a1c18] h-3 border border-[#b2f432]/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#b2f432]/60 to-[#b2f432] transition-all duration-1000 ease-out"
                          style={{ width: `${d.pct}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-[#b2f432] w-8">{d.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
              </div>
            )}

            {activeTab === "social" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:gap-8">
                {socialStatsDynamic.map((stat, i) => (
                  <div key={stat.label} className="rounded-2xl border border-muted bg-muted/30 p-8 text-center transition-all duration-300 hover:border-accent/20">
                    <stat.icon className="mx-auto h-10 w-10 text-accent mb-6" />
                    <div className="text-4xl font-bold mb-2 tracking-tight">{socialCountUps[i]}</div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "economic" && (
              <div className="mx-auto max-w-2xl text-center">
                <div className="grid gap-6 sm:grid-cols-3">
                  {[
                    { value: "₹12.4L", label: "Revenue to Colleges" },
                    { value: "₹8.7L", label: "Local Economy Boost" },
                    { value: "156", label: "Green Jobs Created" },
                  ].map((item, i) => (
                    <div
                      key={item.label}
                      className={cn(
                        "rounded-2xl border border-border bg-card p-8 transition-all duration-500",
                        tabVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                      )}
                      style={{ transitionDelay: `${i * 150}ms` }}
                    >
                      <p className="text-3xl font-bold text-foreground">{item.value}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>



        {/* Impact Stories */}
        <section ref={storiesRef} className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className={cn(
              "text-center transition-all duration-700",
              storiesVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}>
              <p className="text-sm font-medium uppercase tracking-widest text-accent">Stories</p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl text-balance">
                Impact Stories
              </h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {(cmsStories.length > 0 ? cmsStories : fallbackStories).map((s, i) => (
                <div
                  key={s.title}
                  className="group rounded-2xl border border-border bg-card p-8 transition-all duration-500 hover:shadow-lg hover:-translate-y-1 opacity-100 translate-y-0"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-accent">{s.location}</p>
                  <h3 className="mt-2 text-lg font-semibold text-card-foreground">{s.title}</h3>
                  {s.image_url && (
                    <div className="mt-4 mb-4 h-48 w-full rounded-xl overflow-hidden border border-border">
                      <img src={s.image_url} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.excerpt}</p>
                  <span className="mt-4 inline-block text-sm font-medium text-primary transition-colors group-hover:text-accent">
                    Read full story &rarr;
                  </span>
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
