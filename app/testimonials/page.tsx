"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"
import { Quote, MessageSquare, Star, Heart } from "lucide-react"

const stats = [
  { label: "Happy Donors", value: "5", icon: Heart, color: "text-rose-500" },
  { label: "Community Voices", value: "10", icon: MessageSquare, color: "text-sky-500" },
  { label: "Average Rating", value: "4.9/5", icon: Star, color: "text-amber-500" },
]

export default function TestimonialsPage() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation()
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation()

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative overflow-hidden bg-background pt-28 pb-16 md:pt-36 lg:pb-24"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--accent)/0.08)_0%,transparent_70%)]" />
          <div
            className={cn(
              "relative z-10 mx-auto max-w-4xl px-4 text-center transition-all duration-1000 lg:px-8",
              heroVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            )}
          >
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <Quote className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Community Voices
            </p>
            <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              Real Impact, Real <span className="text-primary italic">Stories</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
              Discover how Green Legacy is changing lives and landscapes through the words of our donors, partners, and student ambassadors.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section ref={statsRef} className="py-12 bg-muted/30 border-y border-border">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-3">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={cn(
                    "flex flex-col items-center text-center transition-all duration-700",
                    statsVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  )}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-background shadow-sm", stat.color)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Testimonials Section */}
        <div className="bg-background">
          <TestimonialsSection />
        </div>

        {/* Call to Action */}
        <section className="py-20 lg:py-32">
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground shadow-2xl lg:px-16">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)]" />
              <div className="relative z-10">
                <h2 className="font-serif text-3xl font-bold sm:text-4xl text-balance">
                  Ready to start your own legacy?
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/90">
                  Join hundreds of individuals and organizations making a real difference for our planet and future generations.
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-4">
                  <a
                    href="/subscriptions"
                    className="rounded-full bg-white px-8 py-4 text-sm font-bold text-primary transition-all hover:bg-opacity-90 hover:scale-105 active:scale-95 shadow-lg"
                  >
                    Plant Your First Tree
                  </a>
                  <a
                    href="/get-involved"
                    className="rounded-full border border-white/30 bg-white/10 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                  >
                    Partner With us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
