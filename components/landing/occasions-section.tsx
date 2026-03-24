"use client"

import Link from "next/link"
import { Cake, Heart, Baby, GraduationCap, Flower2, Building2, Gem, Leaf } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"

const occasions = [
  { icon: Cake, title: "Birthdays", tagline: "Grow with your loved ones", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
  { icon: Heart, title: "Anniversaries", tagline: "Roots as strong as your love", color: "bg-red-500/10 text-red-600 dark:text-red-400" },
  { icon: Baby, title: "New Arrivals", tagline: "Welcome life with life", color: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  { icon: GraduationCap, title: "Graduations", tagline: "Plant seeds of success", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { icon: Flower2, title: "Memorials", tagline: "Living tributes that endure", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
  { icon: Building2, title: "Corporate CSR", tagline: "Scale your impact", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { icon: Gem, title: "Weddings", tagline: "Together we grow", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  { icon: Leaf, title: "Just Because", tagline: "Every day is Earth Day", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
]

export function OccasionsSection() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section ref={ref} className="bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div
          className={cn(
            "text-center transition-all duration-700",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}
        >
          <p className="text-sm font-medium uppercase tracking-widest text-accent">Occasions</p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl text-balance">
            Plant for Every Precious Moment
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {occasions.map((o, i) => (
            <Link
              key={o.title}
              href="/subscriptions"
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-500 hover:shadow-xl hover:-translate-y-1",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              )}
              style={{ transitionDelay: isVisible ? `${i * 100}ms` : "0ms" }}
            >
              <div className={cn("mb-4 inline-flex rounded-xl p-3 transition-transform duration-300 group-hover:scale-110", o.color)}>
                <o.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">{o.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{o.tagline}</p>
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
