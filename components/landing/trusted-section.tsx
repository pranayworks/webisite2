"use client"

import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"

const partners = [
  "Tamil Nadu Agricultural University",
  "Punjab Agricultural University",
  "IARI New Delhi",
  "Anand Agricultural University",
  "Kerala Agricultural University",
  "GB Pant University",
  "Assam Agricultural University",
  "Junagadh Agricultural University",
  "CSKHPKV Palampur",
  "Dr. YSR Horticultural University",
]

export function TrustedSection() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section ref={ref} className="overflow-hidden border-y border-border bg-muted/50 py-12">
      <div
        className={cn(
          "mx-auto max-w-7xl px-4 text-center transition-all duration-700 lg:px-8",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}
      >
        <p className="mb-8 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Trusted by leading institutions across India
        </p>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-muted/50 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-muted/50 to-transparent" />
        <div className="flex animate-marquee items-center gap-12">
          {[...partners, ...partners].map((p, i) => (
            <div
              key={`${p}-${i}`}
              className="flex h-14 shrink-0 items-center rounded-lg border border-border bg-card px-6 text-sm font-medium text-muted-foreground whitespace-nowrap"
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
