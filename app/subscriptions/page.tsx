"use client"

import { useState, Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Check, Zap, Shield, Calendar, Gift, Star, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PRODUCTS, SUBSCRIPTIONS } from "@/lib/products"
import { supabase } from "@/lib/supabase"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"

const Checkout = dynamic(() => import("@/components/checkout"), { ssr: false })

function SubscriptionsContent() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const initialPlan = searchParams.get("plan")

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

  const [dbProducts, setDbProducts] = useState<any[]>([])
  const [fetchLoading, setFetchLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [activeTab, setActiveTab] = useState<"one-time" | "subscription">("one-time")
  const [customerType, setCustomerType] = useState<"individual" | "corporate">("individual")
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState("")
  const [gstNumber, setGstNumber] = useState("")

  useEffect(() => {
    if (initialPlan) {
      setSelectedPlan(initialPlan)
      setShowCheckout(true)
    }
  }, [initialPlan])

  useEffect(() => {
    async function fetchPlans() {
      setFetchLoading(true)
      const { data, error } = await supabase
        .from('site_products')
        .select('*')
      
      if (data) {
        const formatted = data.map(p => ({
          ...p,
          priceDisplay: p.price_display, 
          points: (p.trees || 1) * 100, 
          features: Array.isArray(p.features) && p.features.length > 0 ? p.features : [
            `${p.trees || 1} Tree planted`,
            "Digital GPS certificate",
            `${(p.trees || 1) * 100} Green Points`,
            "Email updates"
          ]
        }))
        setDbProducts(formatted)
      } else if (error) {
        console.error("DB Fetch Error:", error)
      }
      setFetchLoading(false)
    }
    fetchPlans()
  }, [])

  const occasions = [
    { id: 'birthday', label: 'Birthdays', desc: 'Grow with your loved ones', icon: Gift, color: 'text-pink-400 bg-pink-400/10' },
    { id: 'anniversary', label: 'Anniversaries', desc: 'Roots as strong as your love', icon: Star, color: 'text-red-400 bg-red-400/10' },
    { id: 'new_arrival', label: 'New Arrivals', desc: 'Welcome life with life', icon: Zap, color: 'text-blue-400 bg-blue-400/10' },
    { id: 'graduation', label: 'Graduations', desc: 'Plant seeds of success', icon: Shield, color: 'text-orange-400 bg-orange-400/10' },
    { id: 'memorial', label: 'Memorials', desc: 'Living tributes that endure', icon: Calendar, color: 'text-purple-400 bg-purple-400/10' },
    { id: 'corporate', label: 'Corporate CSR', desc: 'Scale your impact', icon: Check, color: 'text-green-400 bg-green-400/10' },
    { id: 'wedding', label: 'Weddings', desc: 'Together we grow', icon: Star, color: 'text-pink-500 bg-pink-500/10' },
    { id: 'just_because', label: 'Just Because', desc: 'Every day is Earth Day', icon: Gift, color: 'text-emerald-400 bg-emerald-400/10' },
  ]

  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation()
  const { ref: benefitsRef, isVisible: benefitsVisible } = useScrollAnimation()
  const { ref: faqRef, isVisible: faqVisible } = useScrollAnimation()

  const currentProducts = dbProducts.filter(p => {
    const matchesTab = p.mode === (activeTab === 'one-time' ? 'payment' : 'subscription')
    const matchesCustomer = customerType === 'corporate' ? p.is_csr === true : p.is_csr !== true
    return matchesTab && matchesCustomer
  })

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
    setShowCheckout(true)
    setTimeout(() => {
      document.getElementById("checkout-section")?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const faqs = [
    { q: "Can I pause my subscription?", a: "Yes! You can pause your subscription at any time from your account dashboard. Your trees planted so far remain yours forever, and you can resume whenever you're ready." },
    { q: "What happens to my Green Points?", a: "Green Points never expire. You can redeem them for merchandise, additional tree plantings, or donate them to community planting drives." },
    { q: "Can I gift a subscription?", a: "Absolutely! We offer gift subscriptions for all tiers. The recipient gets a beautiful digital certificate and can track their trees growing in real-time." },
    { q: "How do I get my tax deduction receipt?", a: "All donations are eligible for tax deductions under Section 80G. Receipts are automatically emailed within 48 hours of each payment." },
    { q: "Can I visit my planted trees?", a: "Yes! Forest and Legacy plan holders get site visit invitations. We organize quarterly plantation visits at partner colleges across India." },
  ]

  const benefits = [
    { icon: Calendar, title: "Consistent Impact", desc: "Automated monthly planting ensures continuous environmental contribution" },
    { icon: Shield, title: "Tax Benefits", desc: "Automatic tax deduction receipts for every payment under Section 80G" },
    { icon: Star, title: "Priority Planting", desc: "Subscribers get priority access to premium planting locations" },
    { icon: Gift, title: "Bonus Trees", desc: "Receive bonus anniversary trees on your subscription milestones" },
    { icon: Zap, title: "Exclusive Events", desc: "Invitations to subscriber-only planting drives and community events" }
  ];

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section ref={heroRef} className="relative overflow-hidden bg-background pt-28 pb-16 md:pt-36 lg:pb-24">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--accent)/0.06)_0%,transparent_60%)]" />
          <div
            className={cn(
              "relative z-10 mx-auto max-w-4xl px-4 text-center transition-all duration-700 lg:px-8",
              heroVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            <p className="text-sm font-medium uppercase tracking-widest text-accent">Subscriptions</p>
            <h1 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl text-balance">
              Plant Trees Every Month, Build Forests Over Time
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-pretty">
              Set it and forget it - automated tree planting on your schedule. Choose a one-time package or subscribe for ongoing impact.
            </p>
          </div>
        </section>

        {/* Tab Switcher */}
        <section className="bg-background pb-8">
          <div className="mx-auto flex max-w-sm justify-center gap-1 rounded-full border border-border bg-muted p-1">
            <button
              onClick={() => { setActiveTab("one-time"); setShowCheckout(false); setSelectedPlan(null) }}
              className={cn(
                "flex-1 rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300",
                activeTab === "one-time"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              One-Time
            </button>
            <button
              onClick={() => { setActiveTab("subscription"); setShowCheckout(false); setSelectedPlan(null) }}
              className={cn(
                "flex-1 rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300",
                activeTab === "subscription"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Subscribe
            </button>
          </div>
        </section>

        {/* Global Toggle: Individual vs Corporate */}
        <section className="bg-background pb-12">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <div className="inline-flex items-center gap-3 bg-muted/50 p-1.5 rounded-2xl border border-border/50">
              <button 
                onClick={() => setCustomerType("individual")}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all",
                  customerType === "individual" ? "bg-card text-foreground shadow-lg scale-105" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Shield className="w-4 h-4" /> Stewardship (Solo)
              </button>
              <button 
                onClick={() => setCustomerType("corporate")}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all",
                  customerType === "corporate" ? "bg-card text-accent shadow-lg scale-105" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Zap className="w-4 h-4" /> Corporate CSR (Bulk)
              </button>
            </div>
            {customerType === "corporate" && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                <p className="text-xs font-black text-accent tracking-[0.2em] uppercase">
                  ⚡ Global CSR Discount Applied: 30% Off Bulk Sequestration
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium italic">GST Invoicing & Corporate Impact Certificates unlocked.</p>
              </div>
            )}
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="bg-background pb-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-6 md:grid-cols-3">
              {fetchLoading ? (
                /* Premium Skeleton Loader */
                [1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex flex-col rounded-2xl border border-border bg-card/50 p-8 min-h-[450px]">
                    <div className="h-4 w-1/3 bg-muted rounded-full mb-4" />
                    <div className="h-10 w-3/4 bg-muted rounded-lg mb-8" />
                    <div className="h-12 w-1/2 bg-muted rounded-lg mb-12" />
                    <div className="space-y-4 mb-12">
                      {[1, 2, 3, 4].map(j => <div key={j} className="h-3 w-full bg-muted rounded-full" />)}
                    </div>
                    <div className="mt-auto h-12 w-full bg-muted rounded-xl" />
                  </div>
                ))
              ) : currentProducts.length === 0 ? (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-3xl">
                  <p className="text-muted-foreground font-medium">No plans available for this category in the current registry.</p>
                </div>
              ) : (
                currentProducts.map((product, i) => (
                  <div
                    key={product.id}
                    className={cn(
                      "group relative flex flex-col rounded-2xl border bg-card p-8 transition-all duration-500 hover:shadow-xl animate-fade-in-up",
                      product.popular ? "border-primary shadow-lg md:scale-105" : "border-border hover:-translate-y-1",
                      selectedPlan === product.id && "ring-2 ring-primary"
                    )}
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    {product.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground whitespace-nowrap">
                          {product.badge}
                        </span>
                      </div>
                    )}
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-card-foreground">{product.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-foreground">
                        {(() => {
                          const raw = String(product.priceDisplay || "0")
                          const numericPart = raw.match(/\d+/) ? raw.replace(/,/g, '').match(/\d+/)?.[0] : "0"
                          const numericValue = parseInt(numericPart || "0")
                          return customerType === "corporate" ? `₹${Math.floor(numericValue * 0.7)}` : (product.priceDisplay || "₹0")
                        })()}
                      </span>
                      {product.mode === "payment" && (
                        <span className="ml-1 text-sm text-muted-foreground">
                          {customerType === "corporate" ? "/ block" : "one-time"}
                        </span>
                      )}
                    </div>
                    <div className="mb-4 flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="font-semibold text-foreground">{product.trees}</span> trees
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-semibold text-foreground">{product.points.toLocaleString()}</span> pts
                      </span>
                    </div>
                    <ul className="mb-8 flex-1 space-y-3">
                      {product.features?.map((f: string) => (
                        <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleSelectPlan(product.id)}
                      className={cn(
                        "w-full rounded-xl py-5 transition-all duration-300",
                        product.popular || selectedPlan === product.id
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-muted text-foreground hover:bg-primary hover:text-primary-foreground"
                      )}
                    >
                      {selectedPlan === product.id ? "Selected" : `Choose ${product.name}`}
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Corporate Subscription */}
            {activeTab === "subscription" && (
              <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center animate-fade-in-up" style={{ animationDelay: "450ms" }}>
                <h3 className="text-xl font-semibold text-card-foreground">Corporate Subscription</h3>
                <p className="mt-2 text-muted-foreground">
                  Custom plans for organizations. Flexible tree quantity, monthly CSR reports, employee engagement portal, and dedicated account manager.
                </p>
                <Link href="/contact">
                  <Button variant="outline" className="mt-4 rounded-full border-border bg-transparent text-foreground hover:bg-muted">
                    Contact for Custom Pricing
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Occasions Section */}
        <section className="bg-background py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-sm font-medium uppercase tracking-widest text-accent mb-2">OCCASIONS</p>
              <h2 className="font-serif text-4xl font-bold text-foreground">Plant for Every Precious Moment</h2>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {occasions.map((occ) => (
                <button
                  key={occ.id}
                  onClick={() => setSelectedOccasion(occ.id)}
                  className={cn(
                    "flex flex-col items-start p-6 rounded-2xl border text-left transition-all duration-300 hover:shadow-md",
                    selectedOccasion === occ.id 
                      ? "border-accent bg-accent/5 ring-1 ring-accent" 
                      : "border-border bg-card hover:border-accent/40"
                  )}
                >
                  <div className={cn("p-3 rounded-xl mb-4", occ.color)}>
                    <occ.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{occ.label}</h3>
                  <p className="text-xs text-muted-foreground">{occ.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
        {showCheckout && selectedPlan && (
          <section id="checkout-section" className="scroll-mt-20 bg-muted/30 py-16">
            <div className="mx-auto max-w-2xl px-4 lg:px-8">
              <h2 className="mb-4 text-center font-serif text-2xl font-bold text-foreground">
                Complete Your Purchase
              </h2>
              {!selectedOccasion && (
                <div className="mb-6 p-4 rounded-xl bg-orange-400/10 border border-orange-400/20 text-orange-400 text-sm text-center font-medium">
                   Please select an occasion above before continuing.
                </div>
              )}
              <div className={cn("rounded-2xl border border-border bg-card p-6 shadow-lg transition-opacity", !selectedOccasion && "opacity-40 pointer-events-none")}>
                {customerType === "corporate" && (
                  <div className="mb-8 p-6 bg-accent/5 rounded-2xl border border-accent/20 space-y-4">
                    <h4 className="text-sm font-bold text-accent uppercase tracking-widest">CSR Validation Info</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Company Name</label>
                        <input 
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full bg-muted border-none rounded-lg px-4 py-2 text-sm outline-none" 
                          placeholder="Required for Tax Receipt" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">GST Identification No.</label>
                        <input 
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value)}
                          className="w-full bg-muted border-none rounded-lg px-4 py-2 text-sm outline-none" 
                          placeholder="Required for B2B Benefits" 
                        />
                      </div>
                    </div>
                  </div>
                )}
                <Checkout 
                  productId={selectedPlan} 
                  occasion={selectedOccasion} 
                  isCsr={customerType === "corporate"} 
                  companyName={companyName}
                  gstNumber={gstNumber}
                />
              </div>
            </div>
          </section>
        )}

        {/* Why Subscribe */}
        <section ref={benefitsRef} className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div
              className={cn(
                "text-center transition-all duration-700",
                benefitsVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              )}
            >
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl text-balance">
                Why Choose Green Legacy?
              </h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((b, i) => (
                <div
                  key={b.title}
                  className={cn(
                    "group rounded-2xl border border-border bg-card p-6 transition-all duration-500 hover:shadow-lg hover:-translate-y-1",
                    benefitsVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  )}
                  style={{ transitionDelay: benefitsVisible ? `${i * 100}ms` : "0ms" }}
                >
                  <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <b.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-card-foreground">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section ref={faqRef} className="bg-muted/30 py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-4 lg:px-8">
            <div
              className={cn(
                "text-center transition-all duration-700",
                faqVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              )}
            >
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl text-balance">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="mt-12 space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-xl border border-border bg-card overflow-hidden transition-all duration-500",
                    faqVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  )}
                  style={{ transitionDelay: faqVisible ? `${i * 100}ms` : "0ms" }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between p-5 text-left"
                    aria-expanded={openFaq === i}
                  >
                    <span className="font-medium text-card-foreground">{faq.q}</span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300",
                        openFaq === i && "rotate-180"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      openFaq === i ? "max-h-40 pb-5" : "max-h-0"
                    )}
                  >
                    <p className="px-5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                  </div>
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

export default function SubscriptionsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <SubscriptionsContent />
    </Suspense>
  )
}
