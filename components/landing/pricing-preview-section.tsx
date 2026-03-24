"use client"

import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PRODUCTS } from "@/lib/products"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"

export function PricingPreviewSection() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section ref={ref} className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div
          className={cn(
            "text-center transition-all duration-700",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}
        >
          <p className="text-sm font-medium uppercase tracking-widest text-accent">Pricing</p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl text-balance">
            Choose Your Impact Level
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-pretty">
            Every plan creates real, measurable environmental impact. Start small or go big - every tree counts.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PRODUCTS.map((product, i) => (
            <div
              key={product.id}
              className={cn(
                "group relative flex flex-col rounded-2xl border bg-card p-8 transition-all duration-700 hover:shadow-xl",
                product.popular
                  ? "border-primary shadow-lg scale-[1.02] md:scale-105"
                  : "border-border hover:-translate-y-1",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              )}
              style={{ transitionDelay: isVisible ? `${i * 150}ms` : "0ms" }}
            >
              {product.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    {product.badge}
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-card-foreground">{product.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">{product.priceDisplay}</span>
                <span className="ml-1 text-sm text-muted-foreground">one-time</span>
              </div>
              <ul className="mb-8 flex-1 space-y-3">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={`/subscriptions?plan=${product.id}`}>
                <Button
                  className={cn(
                    "w-full rounded-xl py-5 transition-all duration-300",
                    product.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-foreground hover:bg-primary hover:text-primary-foreground"
                  )}
                >
                  Choose {product.name}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/subscriptions">
            <Button variant="outline" className="rounded-full border-border bg-transparent px-8 text-foreground hover:bg-muted">
              View Subscription Plans
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
