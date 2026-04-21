"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowDown, Play, TreePine, GraduationCap, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCountUp } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

function Leaf({ className, delay }: { className?: string; delay: number }) {
  return (
    <div
      className={cn("absolute text-accent/30 pointer-events-none", className)}
      style={{ animationDelay: `${delay}s` }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="animate-float">
        <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
      </svg>
    </div>
  )
}

export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const [heroHeadline, setHeroHeadline] = useState("Plant a Tree, Create a Legacy")

  useEffect(() => {
    setMounted(true)
    supabase.from('site_config').select('*').eq('key', 'hero_headline').single()
      .then(({data}) => { if (data?.value) setHeroHeadline(data.value) })
  }, [])

  const treesPlanted = useCountUp(5847, 2500, mounted)
  const partnerColleges = useCountUp(42, 2000, mounted)
  const co2Offset = useCountUp(328, 2200, mounted)

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background pt-16 md:pt-20">
      {/* Background leaves */}
      <Leaf className="top-[15%] left-[10%]" delay={0} />
      <Leaf className="top-[25%] right-[15%]" delay={1.5} />
      <Leaf className="bottom-[30%] left-[20%]" delay={3} />
      <Leaf className="top-[40%] right-[25%]" delay={2} />
      <Leaf className="bottom-[20%] right-[10%]" delay={4} />
      <Leaf className="top-[60%] left-[5%]" delay={1} />

      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.08)_0%,transparent_70%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 text-center lg:px-8">
        <div
          className={cn(
            "transition-all duration-1000",
            mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Now planting across 18 states in India
          </div>
        </div>

        <h1
          className={cn(
            "mx-auto max-w-4xl font-serif text-4xl font-bold leading-tight tracking-tight text-foreground transition-all duration-1000 delay-200 sm:text-5xl md:text-6xl lg:text-7xl text-balance",
            mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}
        >
          {heroHeadline.includes(',') ? (
            <>
              {heroHeadline.split(',')[0]},{" "}
              <span className="text-primary">{heroHeadline.split(',').slice(1).join(',')}</span>
            </>
          ) : heroHeadline}
        </h1>

        <p
          className={cn(
            "mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground transition-all duration-1000 delay-400 sm:text-lg md:text-xl text-pretty",
            mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}
        >
          Transform special moments into lasting environmental impact. Every tree tells a story,
          every forest builds a future.
        </p>

        <div
          className={cn(
            "mt-10 flex flex-col items-center justify-center gap-4 transition-all duration-1000 delay-500 sm:flex-row",
            mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}
        >
          <Link href="/subscriptions">
            <Button
              size="lg"
              className="group relative overflow-hidden rounded-full bg-primary px-8 py-6 text-base font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              <span className="relative z-10">Start Planting</span>
              <span className="absolute inset-0 -z-0 bg-accent opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full border-border bg-transparent px-8 py-6 text-base font-semibold text-foreground hover:bg-muted"
            onClick={() => setVideoOpen(true)}
          >
            <Play className="mr-2 h-4 w-4" />
            Watch Our Story
          </Button>
        </div>

        {/* Live counters */}
        <div
          className={cn(
            "mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-6 transition-all duration-1000 delay-700 sm:grid-cols-3",
            mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}
        >
          {[
            { icon: TreePine, value: treesPlanted, suffix: "+", label: "Trees Planted" },
            { icon: GraduationCap, value: partnerColleges, suffix: "", label: "Partner Colleges" },
            { icon: Globe, value: co2Offset, suffix: " Tonnes", label: "CO2 Offset" },
          ].map((stat) => (
            <div key={stat.label} className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-card hover:shadow-lg">
              <stat.icon className="h-6 w-6 text-accent transition-transform duration-300 group-hover:scale-110" />
              <span className="text-3xl font-bold tabular-nums text-foreground">
                {stat.value.toLocaleString()}{stat.suffix}
              </span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 flex justify-center">
          <a
            href="#how-it-works"
            className="flex flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
            aria-label="Scroll to learn more"
          >
            <span className="text-xs uppercase tracking-widest">Discover More</span>
            <ArrowDown className="h-4 w-4 animate-bounce" />
          </a>
        </div>
      </div>

      {/* Video modal */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 backdrop-blur-sm p-4"
          onClick={() => setVideoOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Video player"
        >
          <div
            className="relative w-full max-w-3xl rounded-2xl bg-card p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card text-foreground shadow-lg transition-transform hover:scale-110"
              aria-label="Close video"
            >
              &times;
            </button>
            <div className="aspect-video w-full rounded-xl bg-muted flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Play className="mx-auto h-16 w-16 mb-4" />
                <p className="text-lg font-medium">Green Legacy Story</p>
                <p className="text-sm">Video coming soon</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
