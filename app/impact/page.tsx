"use client"

import { useState } from "react"
import { TreePine, Wind, Droplets, Sun, Users, GraduationCap, Building2, Briefcase, TrendingUp } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useScrollAnimation, useCountUp } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"

const liveStats = [
  { icon: TreePine, label: "Trees Planted Today", value: 47, color: "text-green-500" },
  { icon: TrendingUp, label: "This Month", value: 1243, color: "text-emerald-500" },
  { icon: TreePine, label: "Total Trees", value: 5847, color: "text-green-600" },
  { icon: Wind, label: "CO2 Offset (Tonnes)", value: 328, color: "text-sky-500" },
  { icon: Sun, label: "O2 Produced (Tonnes)", value: 876, color: "text-amber-500" },
  { icon: Droplets, label: "Water Conserved (ML)", value: 24, color: "text-blue-500" },
]

const envData = [
  { label: "Neem", count: 1420, pct: 24 },
  { label: "Banyan", count: 980, pct: 17 },
  { label: "Teak", count: 870, pct: 15 },
  { label: "Mango", count: 760, pct: 13 },
  { label: "Peepal", count: 650, pct: 11 },
  { label: "Others", count: 1167, pct: 20 },
]

const socialStats = [
  { icon: GraduationCap, value: 3200, label: "Students Trained" },
  { icon: Building2, value: 42, label: "Colleges Empowered" },
  { icon: Users, value: 18500, label: "Communities Supported" },
  { icon: Briefcase, value: 156, label: "Jobs Created" },
]

const fundBreakdown = [
  { label: "Future Plantings", pct: 40, color: "bg-green-500" },
  { label: "College Programs", pct: 30, color: "bg-emerald-500" },
  { label: "NGO Maintenance", pct: 20, color: "bg-sky-500" },
  { label: "Operations", pct: 10, color: "bg-amber-500" },
]

const stories = [
  { title: "From Barren Land to Green Campus", location: "Tamil Nadu Agricultural University", excerpt: "How 500 trees transformed the campus landscape and created a biodiversity corridor that now hosts 23 bird species." },
  { title: "A Father's Legacy Lives On", location: "Anand, Gujarat", excerpt: "Rajesh planted 25 trees in memory of his father. Two years later, the small grove has become a community gathering space." },
  { title: "Corporate Impact at Scale", location: "TechCorp India, Bengaluru", excerpt: "500 trees across 5 colleges. Their CSR initiative engaged 200 employees in planting drives and environmental education." },
  { title: "Student-Led Green Revolution", location: "Punjab Agricultural University", excerpt: "Campus ambassadors organized 12 planting drives, involving over 1,000 students and establishing a model sustainability program." },
]

export default function ImpactPage() {
  const [activeTab, setActiveTab] = useState<"environmental" | "social" | "economic">("environmental")
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation()
  const { ref: liveRef, isVisible: liveVisible } = useScrollAnimation()
  const { ref: tabRef, isVisible: tabVisible } = useScrollAnimation()
  const { ref: fundRef, isVisible: fundVisible } = useScrollAnimation()
  const { ref: storiesRef, isVisible: storiesVisible } = useScrollAnimation()

  const liveCountUp0 = useCountUp(liveStats[0].value, 2000, liveVisible)
  const liveCountUp1 = useCountUp(liveStats[1].value, 2000, liveVisible)
  const liveCountUp2 = useCountUp(liveStats[2].value, 2000, liveVisible)
  const liveCountUp3 = useCountUp(liveStats[3].value, 2000, liveVisible)
  const liveCountUp4 = useCountUp(liveStats[4].value, 2000, liveVisible)
  const liveCountUp5 = useCountUp(liveStats[5].value, 2000, liveVisible)
  const liveCountUps = [liveCountUp0, liveCountUp1, liveCountUp2, liveCountUp3, liveCountUp4, liveCountUp5]

  const socialCountUp0 = useCountUp(socialStats[0].value, 2000, tabVisible && activeTab === "social")
  const socialCountUp1 = useCountUp(socialStats[1].value, 2000, tabVisible && activeTab === "social")
  const socialCountUp2 = useCountUp(socialStats[2].value, 2000, tabVisible && activeTab === "social")
  const socialCountUp3 = useCountUp(socialStats[3].value, 2000, tabVisible && activeTab === "social")
  const socialCountUps = [socialCountUp0, socialCountUp1, socialCountUp2, socialCountUp3]

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section ref={heroRef} className="relative overflow-hidden bg-background pt-28 pb-16 md:pt-36">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--accent)/0.06)_0%,transparent_60%)]" />
          <div className={cn(
            "relative z-10 mx-auto max-w-4xl px-4 text-center transition-all duration-700 lg:px-8",
            heroVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}>
            <p className="text-sm font-medium uppercase tracking-widest text-accent">Impact Dashboard</p>
            <h1 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl text-balance">
              Measurable Impact, Complete Transparency
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-pretty">
              Every tree is tracked, every rupee accounted for. See the real-time impact of our collective effort.
            </p>
          </div>
        </section>

        {/* Live Stats */}
        <section ref={liveRef} className="bg-foreground py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {liveStats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={cn(
                    "rounded-2xl border border-background/10 bg-background/5 p-6 text-center backdrop-blur-sm transition-all duration-500",
                    liveVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  )}
                  style={{ transitionDelay: liveVisible ? `${i * 80}ms` : "0ms" }}
                >
                  <stat.icon className={cn("mx-auto h-6 w-6", stat.color)} />
                  <p className="mt-3 text-2xl font-bold tabular-nums text-background">
                    {liveVisible ? liveCountUps[i].toLocaleString() : stat.value.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-background/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Tabs */}
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
              <div className={cn("transition-all duration-500", tabVisible ? "opacity-100" : "opacity-0")}>
                <h3 className="mb-8 text-center text-xl font-semibold text-foreground">Species Distribution</h3>
                <div className="mx-auto max-w-2xl space-y-4">
                  {envData.map((d, i) => (
                    <div key={d.label} className="flex items-center gap-4">
                      <span className="w-16 text-right text-sm font-medium text-foreground">{d.label}</span>
                      <div className="flex-1 overflow-hidden rounded-full bg-muted h-8">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                          style={{ width: tabVisible ? `${d.pct}%` : "0%" , transitionDelay: `${i * 100}ms` }}
                        >
                          <span className="text-xs font-semibold text-primary-foreground">{d.pct}%</span>
                        </div>
                      </div>
                      <span className="w-16 text-sm text-muted-foreground">{d.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "social" && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {socialStats.map((stat, i) => (
                  <div
                    key={stat.label}
                    className={cn(
                      "group rounded-2xl border border-border bg-card p-8 text-center transition-all duration-500 hover:shadow-lg",
                      tabVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                    )}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <stat.icon className="mx-auto h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
                    <p className="mt-4 text-3xl font-bold tabular-nums text-foreground">
                      {tabVisible && activeTab === "social" ? socialCountUps[i].toLocaleString() : stat.value.toLocaleString()}+
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
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

        {/* Where Your Money Goes */}
        <section ref={fundRef} className="bg-muted/30 py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-4 lg:px-8">
            <div className={cn(
              "text-center transition-all duration-700",
              fundVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}>
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl text-balance">
                Where Your Money Goes
              </h2>
              <p className="mt-4 text-muted-foreground">Complete transparency in every rupee spent.</p>
            </div>
            <div className="mt-12 space-y-6">
              {fundBreakdown.map((item, i) => (
                <div
                  key={item.label}
                  className={cn(
                    "transition-all duration-500",
                    fundVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  )}
                  style={{ transitionDelay: fundVisible ? `${i * 100}ms` : "0ms" }}
                >
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{item.label}</span>
                    <span className="font-semibold text-foreground">{item.pct}%</span>
                  </div>
                  <div className="h-4 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full transition-all duration-1000 ease-out", item.color)}
                      style={{ width: fundVisible ? `${item.pct}%` : "0%", transitionDelay: `${i * 150}ms` }}
                    />
                  </div>
                </div>
              ))}
            </div>
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
              {stories.map((s, i) => (
                <div
                  key={s.title}
                  className={cn(
                    "group rounded-2xl border border-border bg-card p-8 transition-all duration-500 hover:shadow-lg hover:-translate-y-1",
                    storiesVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  )}
                  style={{ transitionDelay: storiesVisible ? `${i * 100}ms` : "0ms" }}
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-accent">{s.location}</p>
                  <h3 className="mt-2 text-lg font-semibold text-card-foreground">{s.title}</h3>
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
