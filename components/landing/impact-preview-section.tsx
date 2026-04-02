"use client"

import * as React from "react"

import Link from "next/link"
import { TreePine, Wind, Droplets, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useScrollAnimation, useCountUp } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"

const stats = [
  { icon: TreePine, value: 5847, suffix: "+", label: "Trees Planted", color: "text-green-500" },
  { icon: Wind, value: 328, suffix: " T", label: "CO2 Offset", color: "text-sky-500" },
  { icon: Droplets, value: 24, suffix: "M L", label: "Water Conserved", color: "text-blue-500" },
  { icon: Sun, value: 876, suffix: " T", label: "O2 Produced", color: "text-amber-500" },
]

export function ImpactPreviewSection() {
  const { ref, isVisible } = useScrollAnimation()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const values = [
    useCountUp(5847, 2500, isVisible),
    useCountUp(328, 2000, isVisible),
    useCountUp(24, 1800, isVisible),
    useCountUp(876, 2200, isVisible),
  ]

  // Pre-generate stable random values for the circles to avoid hydration mismatch
  const particles = React.useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      left: `${(i * 7 + 13) % 100}%`,
      top: `${(i * 11 + 17) % 100}%`,
      delay: `${(i * 0.3) % 5}s`,
      duration: `${4 + (i * 0.7) % 4}s`,
    }))
  }, [])

  return (
    <section ref={ref} className="relative overflow-hidden bg-foreground py-20 lg:py-28">
      {/* Particle-like dots */}
      <div className="absolute inset-0 overflow-hidden">
        {mounted && particles.map((p, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-accent/20 animate-float"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8">
        <div
          className={cn(
            "text-center transition-all duration-700",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}
        >
          <p className="text-sm font-medium uppercase tracking-widest text-accent">Transparency</p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-background sm:text-4xl lg:text-5xl text-balance">
            Real Trees, Real Impact, Real Transparency
          </h2>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-background/10 bg-background/5 p-8 text-center backdrop-blur-sm transition-all duration-500 hover:bg-background/10",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              )}
              style={{ transitionDelay: isVisible ? `${i * 150}ms` : "0ms" }}
            >
              <stat.icon className={cn("mx-auto h-8 w-8 transition-transform duration-300 group-hover:scale-110", stat.color)} />
              <p className="mt-4 text-4xl font-bold tabular-nums text-background">
                {values[i].toLocaleString()}{stat.suffix}
              </p>
              <p className="mt-2 text-sm text-background/60">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/impact">
            <Button className="rounded-full bg-accent px-8 text-accent-foreground hover:bg-accent/90 transition-all duration-300 hover:scale-105">
              See Full Impact Report
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
