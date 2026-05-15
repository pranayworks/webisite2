"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { ArrowDown, Play, TreePine, Droplets, Globe } from "lucide-react"
import { Button } from "../../components/ui/button"
import { useCountUp } from "../../hooks/use-scroll-animation"
import { cn } from "../../lib/utils"
import { supabase } from "../../lib/supabase"

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

function StatCard({ stat }: { stat: any }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setPosition({ x, y })

    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -15 // Max 15deg tilt
    const rotateY = ((x - centerX) / centerX) * 15
    setRotate({ x: rotateX, y: rotateY })
  }

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotate({ x: 0, y: 0 })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative group rounded-2xl bg-card/60 p-6 backdrop-blur-sm cursor-crosshair"
      style={{
        transform: isHovered 
          ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.05, 1.05, 1.05)` 
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
        transformStyle: "preserve-3d",
      }}
    >
      {/* Default static border */}
      <div className="absolute inset-0 rounded-2xl border border-border/50 transition-opacity duration-300 group-hover:opacity-0" />

      {/* Spotlight Border Glow */}
      <div
        className="pointer-events-none absolute -inset-[1px] rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-0"
        style={{
          background: `radial-gradient(300px circle at ${position.x}px ${position.y}px, rgba(110,232,154,0.6), transparent 40%)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '1px'
        }}
      />
      {/* Spotlight Background Glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-0"
        style={{
          background: `radial-gradient(300px circle at ${position.x}px ${position.y}px, rgba(110,232,154,0.08), transparent 40%)`,
        }}
      />

      {/* Content (Popping out slightly in 3D) */}
      <div 
        className="relative z-10 flex flex-col items-center gap-2 pointer-events-none" 
        style={{ transform: isHovered ? 'translateZ(40px)' : 'translateZ(0px)', transition: 'transform 0.3s ease-out' }}
      >
        <stat.icon className="h-8 w-8 text-accent drop-shadow-[0_0_8px_rgba(110,232,154,0.5)] transition-transform duration-300 group-hover:scale-110" />
        <span className="text-3xl font-bold tabular-nums text-foreground mt-2 drop-shadow-md">
          {stat.value.toLocaleString()}{stat.suffix}
        </span>
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
      </div>
    </div>
  )
}

export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const [heroHeadline, setHeroHeadline] = useState("Plant a Tree, Create a Legacy")
  const [dbStats, setDbStats] = useState({ trees: 0, water: 0, co2: 0 })

  useEffect(() => {
    setMounted(true)
    import("../../lib/impact").then(m => m.fetchLiveImpactMetrics()).then(res => setDbStats(res))
    supabase.from('site_config').select('*').eq('key', 'hero_headline').single()
      .then(({data}) => { if (data?.value) setHeroHeadline(data.value) })
  }, [])

  const treesPlanted = useCountUp(dbStats.trees, 2500, mounted)
  const waterConserved = useCountUp(dbStats.water, 2000, mounted)
  const co2Offset = useCountUp(dbStats.co2, 2200, mounted)

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
            "mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-6 transition-all duration-1000 delay-700 sm:grid-cols-3 [perspective:2000px]",
            mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}
        >
          {[
            { icon: TreePine, value: treesPlanted, suffix: "+", label: "Trees Planted" },
            { icon: Droplets, value: waterConserved, suffix: " KL", label: "Water Conserved" },
            { icon: Globe, value: co2Offset, suffix: " Tonnes", label: "CO2 Offset" },
          ].map((stat) => (
            <StatCard key={stat.label} stat={stat} />
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
