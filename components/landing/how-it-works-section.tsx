"use client"

import { Calendar, Sprout, MapPin } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"

const steps = [
  {
    icon: Calendar,
    title: "Choose & Personalize",
    description: "Select your occasion - birthdays, memorials, corporate events. Add a personal dedication message.",
    details: ["Pick the perfect occasion", "Add a heartfelt message", "Choose your tree species"],
  },
  {
    icon: Sprout,
    title: "We Plant & Care",
    description: "Tree planted at partner agriculture colleges. Students gain real-world experience. Local NGOs ensure long-term care.",
    details: ["Planted by trained students", "Nurtured by local NGOs", "Monitored for 3 years"],
  },
  {
    icon: MapPin,
    title: "Track Your Impact",
    description: "GPS-tagged digital certificate. Scan QR to see your tree's exact location. Watch your legacy grow.",
    details: ["GPS-tagged certificate", "QR code for tracking", "Real-time growth updates"],
  },
]

export function HowItWorksSection() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section ref={ref} id="how-it-works" className="scroll-mt-20 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div
          className={cn(
            "text-center transition-all duration-700",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}
        >
          <p className="text-sm font-medium uppercase tracking-widest text-accent">Simple Process</p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl text-balance">
            Your Tree Journey in 3 Simple Steps
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-pretty">
            From your intention to a thriving tree - we make the entire process seamless and transparent.
          </p>
        </div>

        <div className="relative mt-16 grid gap-8 md:grid-cols-3">
          {/* Connecting line on desktop */}
          <div className="absolute top-24 left-[16.66%] right-[16.66%] hidden h-px bg-border md:block" />

          {steps.map((step, i) => (
            <div
              key={step.title}
              className={cn(
                "group relative rounded-2xl border border-border bg-card p-8 transition-all duration-700 hover:shadow-xl hover:-translate-y-2",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              )}
              style={{ transitionDelay: isVisible ? `${i * 200}ms` : "0ms" }}
            >
              <div className="relative mb-6 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                  <step.icon className="h-7 w-7" />
                </div>
                <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {i + 1}
                </span>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-card-foreground">{step.title}</h3>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              <ul className="space-y-2">
                {step.details.map((d) => (
                  <li key={d} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
