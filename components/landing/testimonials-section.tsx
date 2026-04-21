"use client"

import { useState, useEffect } from "react"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

const defaultTestimonials = [
  {
    name: "Priya Sharma",
    role: "Individual Donor",
    text: "I planted 10 trees for my parents' anniversary. The GPS certificate and growth updates made it the most meaningful gift I've ever given. Watching the trees grow through the app is truly special.",
    rating: 5,
  },
  {
    name: "Rajesh Kumar",
    role: "CSR Head, TechCorp India",
    text: "Green Legacy made our CSR initiative seamless. 500 trees planted, full documentation for compliance, and our employees loved the engagement events. The transparency is unmatched.",
    rating: 5,
  },
  {
    name: "Ananya Patel",
    role: "Agriculture Student, TNAU",
    text: "As a campus ambassador, I've gained incredible hands-on experience. The program bridges classroom learning with real-world impact. It's changed how I see my career.",
    rating: 5,
  },
  {
    name: "Dr. Suresh Nair",
    role: "College Dean, KAU",
    text: "The partnership with Green Legacy has transformed our campus and provided unparalleled learning opportunities for students. A truly innovative model.",
    rating: 5,
  },
  {
    name: "Meera Joshi",
    role: "Environmental Blogger",
    text: "Finally, a tree planting organization that's truly transparent. I can visit my trees, scan the QR code, and see exactly where my money went. This is how environmental work should be done.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  const { ref, isVisible } = useScrollAnimation()
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [visibleCount, setVisibleCount] = useState(1)
  const [testimonials, setTestimonials] = useState<any[]>(defaultTestimonials)

  useEffect(() => {
    supabase.from('testimonials').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (data && data.length > 0) setTestimonials(data)
    })
  }, [])

  useEffect(() => {
    const updateVisibleCount = () => {
      setVisibleCount(window.innerWidth >= 768 ? 3 : 1)
    }
    updateVisibleCount()
    window.addEventListener("resize", updateVisibleCount)
    return () => window.removeEventListener("resize", updateVisibleCount)
  }, [])

  const maxIndex = Math.max(0, testimonials.length - visibleCount)

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setCurrent((c) => (c >= maxIndex ? 0 : c + 1))
    }, 4000)
    return () => clearInterval(timer)
  }, [isPaused, maxIndex])

  return (
    <section ref={ref} className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div
          className={cn(
            "text-center transition-all duration-700",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}
        >
          <p className="text-sm font-medium uppercase tracking-widest text-accent">Testimonials</p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl text-balance">
            Stories That Inspire
          </h2>
        </div>

        <div
          className="relative mt-12"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="overflow-hidden">
            <div
              className="flex gap-6 transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${current * (100 / visibleCount)}%)` }}
            >
              {testimonials.map((t, i) => (
                <div
                  key={t.name}
                  className={cn(
                    "shrink-0 rounded-2xl border border-border bg-card p-8 transition-all duration-500",
                    "w-full md:w-[calc(33.333%-16px)]"
                  )}
                >
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold text-card-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all hover:bg-muted disabled:opacity-50"
              disabled={current === 0}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    current === i ? "w-8 bg-primary" : "w-2 bg-border"
                  )}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrent((c) => Math.min(maxIndex, c + 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all hover:bg-muted disabled:opacity-50"
              disabled={current >= maxIndex}
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
