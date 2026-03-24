"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { Users, Building2, GraduationCap, Send, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"

export function GetInvolvedTeaser() {
  const { ref, isVisible } = useScrollAnimation()

  const options = [
    { icon: Users, title: "Volunteer", desc: "Join planting drives and awareness campaigns" },
    { icon: Building2, title: "Corporate Partnership", desc: "Fulfill CSR mandates with measurable impact" },
    { icon: GraduationCap, title: "Campus Ambassador", desc: "Lead the green revolution at your college" },
  ]

  return (
    <section ref={ref} className="bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div
            className={cn(
              "transition-all duration-700",
              isVisible ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
            )}
          >
            <p className="text-sm font-medium uppercase tracking-widest text-accent">Join Us</p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl text-balance">
              Be Part of the Movement
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground text-pretty">
              Whether you are a student, professional, or organization - there is a place for you
              in the Green Legacy family.
            </p>
            <Link href="/get-involved" className="mt-6 inline-block">
              <Button className="rounded-full bg-primary px-8 text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105">
                Join Us
              </Button>
            </Link>
          </div>

          <div
            className={cn(
              "space-y-4 transition-all duration-700 delay-200",
              isVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
            )}
          >
            {options.map((o, i) => (
              <Link
                key={o.title}
                href="/get-involved"
                className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <o.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground">{o.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{o.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function NewsletterSection() {
  const { ref, isVisible } = useScrollAnimation()
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setEmail("")
      setTimeout(() => setSubmitted(false), 4000)
    }
  }

  return (
    <section ref={ref} className="bg-primary py-16 lg:py-20">
      <div
        className={cn(
          "mx-auto max-w-3xl px-4 text-center transition-all duration-700 lg:px-8",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}
      >
        <h2 className="font-serif text-2xl font-bold text-primary-foreground sm:text-3xl lg:text-4xl text-balance">
          Stay Rooted in Our Mission
        </h2>
        <p className="mt-3 text-sm text-primary-foreground/70 text-pretty">
          Get monthly impact reports, planting updates, and exclusive subscriber benefits.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-0">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 rounded-full bg-primary-foreground/10 px-6 py-4 text-sm text-primary-foreground placeholder:text-primary-foreground/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-accent sm:rounded-r-none"
            aria-label="Email address"
          />
          <Button
            type="submit"
            className="rounded-full bg-accent px-8 py-4 font-semibold text-accent-foreground hover:bg-accent/90 transition-all duration-300 sm:rounded-l-none"
          >
            {submitted ? (
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" /> Subscribed!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="h-4 w-4" /> Subscribe
              </span>
            )}
          </Button>
        </form>
      </div>
    </section>
  )
}
