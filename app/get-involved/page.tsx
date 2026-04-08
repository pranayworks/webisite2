"use client"

import React from "react"

import { useState } from "react"
import { Users, Building2, GraduationCap, Check, X, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"
import { submitApplication } from "@/app/actions/submit-application"

const pathways = [
  {
    icon: Users,
    title: "Become a Volunteer",
    desc: "Join planting drives, campus events, and awareness campaigns",
    benefits: ["Hands-on environmental work", "Certificate of service", "Green Legacy merchandise", "Community of changemakers"],
    requirement: "Just passion and 4 hours/month",
    cta: "Apply as Volunteer",
  },
  {
    icon: Building2,
    title: "Corporate Partnership",
    desc: "Fulfill CSR mandates while creating measurable impact",
    benefits: ["Tax deductions (Section 80G)", "Employee engagement programs", "Branding opportunities", "Quarterly impact reports"],
    requirement: "Organizations of all sizes welcome",
    cta: "Schedule a Call",
  },
  {
    icon: GraduationCap,
    title: "Campus Ambassador",
    desc: "Lead the green revolution at your agriculture college",
    benefits: ["Leadership experience", "Internship certificate", "Monthly stipend", "National ambassador network"],
    requirement: "Agriculture college students",
    cta: "Apply Now",
  },
]

const events = [
  { title: "Mega Planting Drive - Chennai", date: "March 15, 2026", location: "TNAU Campus", spots: 50 },
  { title: "World Environment Day Special", date: "June 5, 2026", location: "Multiple Locations", spots: 200 },
  { title: "Monsoon Planting Festival", date: "July 20, 2026", location: "PAU, Ludhiana", spots: 75 },
  { title: "Campus Green Challenge", date: "August 10, 2026", location: "KAU, Thrissur", spots: 40 },
]

const partners = [
  { name: "TechCorp India", trees: 5000, desc: "Planted 5,000 trees across 5 states as part of their annual CSR initiative." },
  { name: "GreenFinance Ltd", trees: 2500, desc: "Employee engagement program with quarterly planting drives." },
  { name: "EduFirst Foundation", trees: 1000, desc: "Supporting campus programs at 10 agriculture colleges." },
]

export default function GetInvolvedPage() {
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation()
  const { ref: pathRef, isVisible: pathVisible } = useScrollAnimation()
  const { ref: eventRef, isVisible: eventVisible } = useScrollAnimation()
  const { ref: partnerRef, isVisible: partnerVisible } = useScrollAnimation()

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormAction = async (formData: FormData) => {
    setIsSubmitting(true)
    const res = await submitApplication(formData)
    setIsSubmitting(false)
    
    if (res.success) {
      setFormSubmitted(true)
      setTimeout(() => {
        setFormSubmitted(false)
        setActiveModal(null)
      }, 3000)
    } else {
      alert("Error: " + res.error)
    }
  }

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section ref={heroRef} className="relative overflow-hidden bg-background pt-28 pb-16 md:pt-36">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--accent)/0.06)_0%,transparent_60%)]" />
          <div className={cn(
            "relative z-10 mx-auto max-w-4xl px-4 text-center transition-all duration-700 lg:px-8",
            heroVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}>
            <p className="text-sm font-medium uppercase tracking-widest text-accent">Get Involved</p>
            <h1 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl text-balance">
              Grow With Us
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-pretty">
              Whether you are a student, professional, or organization - there is a place for you in the Green Legacy family.
            </p>
          </div>
        </section>

        {/* Three Pathways */}
        <section ref={pathRef} className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
              {pathways.map((p, i) => (
                <div
                  key={p.title}
                  className={cn(
                    "group relative flex flex-col rounded-2xl border border-border bg-card p-8 transition-all duration-500 hover:shadow-xl hover:-translate-y-2",
                    pathVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  )}
                  style={{ transitionDelay: pathVisible ? `${i * 150}ms` : "0ms" }}
                >
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <p.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                  <ul className="my-6 flex-1 space-y-3">
                    {p.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <p className="mb-4 text-xs text-muted-foreground italic">{p.requirement}</p>
                  <Button
                    onClick={() => setActiveModal(p.title)}
                    className="w-full rounded-xl bg-primary py-5 text-primary-foreground transition-all duration-300 hover:bg-primary/90"
                  >
                    {p.cta}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section ref={eventRef} className="bg-muted/30 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className={cn(
              "text-center transition-all duration-700",
              eventVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}>
              <p className="text-sm font-medium uppercase tracking-widest text-accent">Events</p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl text-balance">
                Upcoming Planting Events
              </h2>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {events.map((e, i) => (
                <div
                  key={e.title}
                  className={cn(
                    "group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-500 hover:shadow-lg sm:flex-row sm:items-center sm:gap-6",
                    eventVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  )}
                  style={{ transitionDelay: eventVisible ? `${i * 100}ms` : "0ms" }}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-card-foreground">{e.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{e.date}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{e.location}</span>
                    </div>
                    <p className="mt-1 text-xs text-accent">{e.spots} spots remaining</p>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-4 shrink-0 rounded-full border-border bg-transparent text-foreground hover:bg-primary hover:text-primary-foreground sm:mt-0"
                  >
                    RSVP
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partner Showcase */}
        <section ref={partnerRef} className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className={cn(
              "text-center transition-all duration-700",
              partnerVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}>
              <p className="text-sm font-medium uppercase tracking-widest text-accent">Partners</p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl text-balance">
                Corporate Partners Making a Difference
              </h2>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {partners.map((p, i) => (
                <div
                  key={p.name}
                  className={cn(
                    "rounded-2xl border border-border bg-card p-8 transition-all duration-500 hover:shadow-lg",
                    partnerVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  )}
                  style={{ transitionDelay: partnerVisible ? `${i * 100}ms` : "0ms" }}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-sm font-bold text-foreground">
                    {p.name.split(" ").map(w => w[0]).join("")}
                  </div>
                  <h3 className="font-semibold text-card-foreground">{p.name}</h3>
                  <p className="mt-1 text-sm font-medium text-accent">{p.trees.toLocaleString()} trees planted</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />

      {/* Application Modal */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4"
          onClick={() => { setActiveModal(null); setFormSubmitted(false) }}
          role="dialog"
          aria-modal="true"
          aria-label={`${activeModal} application form`}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setActiveModal(null); setFormSubmitted(false) }}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {formSubmitted ? (
              <div className="py-8 text-center animate-fade-in">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-accent">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground">Application Submitted!</h3>
                <p className="mt-2 text-sm text-muted-foreground">We will get back to you within 48 hours.</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-card-foreground">{activeModal}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Fill in your details to get started.</p>
                <form action={handleFormAction} className="mt-6 space-y-4">
                  <input type="hidden" name="type" value={activeModal} />
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                      {activeModal === "Corporate Partnership" ? "Company/Org Name & Contact Person" : "Full Name"}
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <label htmlFor="modal-email" className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                    <input
                      id="modal-email"
                      name="email"
                      type="email"
                      required
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-foreground">Phone Number</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>

                  {activeModal === "Become a Volunteer" && (
                    <>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Occupation / Profession</label>
                        <input name="occupation" required className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground" placeholder="E.g. Software Engineer, Farmer" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Why do you want to volunteer?</label>
                        <textarea name="reason" required rows={3} className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground" placeholder="Tell us your motivation..." />
                      </div>
                    </>
                  )}

                  {activeModal === "Corporate Partnership" && (
                    <>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Expected CSR Budget / Plan</label>
                        <input name="budget" required className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground" placeholder="E.g. Planting 5000 trees annually" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Partnership Goals</label>
                        <textarea name="goals" required rows={3} className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground" placeholder="Describe your sustainability initiatives..." />
                      </div>
                    </>
                  )}

                  {activeModal === "Campus Ambassador" && (
                    <>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">College / University Name</label>
                        <input name="college" required className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground" placeholder="E.g. Tamil Nadu Agricultural University" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Degree & Year of Study</label>
                        <input name="degree" required className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground" placeholder="E.g. BSc Agriculture, 2nd Year" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Why should we select you?</label>
                        <textarea name="reason" required rows={3} className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground" placeholder="Highlight your leadership/extracurriculars..." />
                      </div>
                    </>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-primary py-5 text-primary-foreground hover:bg-primary/90"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
