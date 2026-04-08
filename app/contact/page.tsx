"use client"

import React from "react"

import { useState } from "react"
import { Mail, Handshake, Newspaper, GraduationCap, Send, Check, ChevronDown, Phone, MapPin, Instagram, Linkedin, Twitter, Youtube, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"
import { submitContact } from "@/app/actions/submit-contact"

const contactOptions = [
  { icon: Mail, title: "General Inquiries", email: "contact@greenlegacy.in", desc: "We respond within 24 hours" },
  { icon: Handshake, title: "Partnership Opportunities", email: "partnerships@greenlegacy.in", desc: "Let's create impact together" },
  { icon: Newspaper, title: "Press & Media", email: "media@greenlegacy.in", desc: "For interviews and press releases" },
  { icon: GraduationCap, title: "Campus Programs", email: "campus@greenlegacy.in", desc: "For colleges and student initiatives" },
]

const subjects = ["General", "Partnership", "Media", "Campus", "Support"]

const faqs = [
  { q: "How long does it take to plant my tree?", a: "Trees are typically planted within 7-14 days of your order, depending on the season and location. You will receive a notification with your GPS certificate once planted." },
  { q: "Can I choose where my tree is planted?", a: "Yes! During checkout, you can select a preferred state or college campus. We'll plant at the nearest partner location." },
  { q: "Are donations tax deductible?", a: "All donations to Green Legacy are eligible for tax deductions under Section 80G of the Income Tax Act. Receipts are auto-generated." },
  { q: "What species of trees do you plant?", a: "We plant native species suited to each region - including Neem, Banyan, Peepal, Teak, Mango, and more. Species are selected for maximum environmental benefit." },
  { q: "How can I track my tree after planting?", a: "Every tree comes with a GPS-tagged digital certificate and QR code. Scan it anytime to see your tree's location, growth status, and environmental impact." },
]

const socials = [
  { icon: Instagram, label: "Instagram", handle: "@greenlegacy_org" },
  { icon: Linkedin, label: "LinkedIn", handle: "Green Legacy " },
  { icon: Twitter, label: "Twitter/X", handle: "@green legacy" },
  { icon: Youtube, label: "YouTube", handle: "Green Legacy" },
  { icon: Facebook, label: "Facebook", handle: "Green Legacy" },
]

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation()
  const { ref: formRef, isVisible: formVisible } = useScrollAnimation()
  const { ref: faqRef, isVisible: faqVisible } = useScrollAnimation()

  const handleFormAction = async (formData: FormData) => {
    setIsSubmitting(true)
    const res = await submitContact(formData)
    setIsSubmitting(false)
    if (res.success) {
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 4000)
    } else {
      alert("Error sending message: " + res.error)
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
            <p className="text-sm font-medium uppercase tracking-widest text-accent">Contact</p>
            <h1 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl text-balance">
              {"Let's Grow Together"}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-pretty">
              Questions, partnerships, or just want to chat about trees? We would love to hear from you.
            </p>
          </div>
        </section>

        {/* Contact Cards */}
        <section className="pb-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {contactOptions.map((opt, i) => (
                <div
                  key={opt.title}
                  className="group rounded-2xl border border-border bg-card p-6 text-center transition-all duration-500 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <opt.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-card-foreground">{opt.title}</h3>
                  <a href={`mailto:${opt.email}`} className="mt-1 block text-sm text-primary hover:text-accent transition-colors">
                    {opt.email}
                  </a>
                  <p className="mt-1 text-xs text-muted-foreground">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form + Info */}
        <section ref={formRef} className="bg-muted/30 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-5">
              {/* Form */}
              <div
                className={cn(
                  "lg:col-span-3 transition-all duration-700",
                  formVisible ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
                )}
              >
                <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Send Us a Message</h2>
                <p className="mt-2 text-sm text-muted-foreground">Fill out the form and we will get back to you shortly.</p>

                {submitted ? (
                  <div className="mt-8 rounded-2xl border border-border bg-card p-12 text-center animate-scale-in">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-accent">
                      <Check className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-card-foreground">Message Sent!</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Thanks! We will be in touch soon.</p>
                  </div>
                ) : (
                  <form action={handleFormAction} className="mt-8 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          required
                          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          required
                          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="contact-phone" className="mb-1.5 block text-sm font-medium text-foreground">Phone (optional)</label>
                        <input
                          id="contact-phone"
                          name="phone"
                          type="tel"
                          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-subject" className="mb-1.5 block text-sm font-medium text-foreground">Subject</label>
                        <div className="relative">
                          <select
                            id="contact-subject"
                            name="subject"
                            required
                            className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-3 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                          >
                            <option value="">Select a topic</option>
                            {subjects.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-foreground">Message</label>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows={5}
                        required
                        className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                        placeholder="How can we help?"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-xl bg-primary px-8 py-5 text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-[1.02]"
                    >
                      <Send className="mr-2 h-4 w-4" /> {isSubmitting ? "Sending..." : "Plant Your Message"}
                    </Button>
                  </form>
                )}
              </div>

              {/* Sidebar Info */}
              <div
                className={cn(
                  "space-y-8 lg:col-span-2 transition-all duration-700 delay-200",
                  formVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                )}
              >
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-semibold text-card-foreground">Office</h3>
                  <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>Green Legacy HQ, Kapil Kavuri Hub, Financial District, Hyderabad </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 shrink-0 text-primary" />
                      <span>+91 8074935169</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 shrink-0 text-primary" />
                      <span>greenlegacy.org@gmail.com</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-semibold text-card-foreground">Follow Us</h3>
                  <div className="mt-4 space-y-3">
                    {socials.map((s) => (
                      <a
                        key={s.label}
                        href="#"
                        className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted transition-colors hover:bg-primary/10">
                          <s.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{s.label}</span>
                          <span className="ml-2 text-xs">{s.handle}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section ref={faqRef} id="faq" className="scroll-mt-20 py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-4 lg:px-8">
            <div className={cn(
              "text-center transition-all duration-700",
              faqVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}>
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl text-balance">
                Before You Reach Out
              </h2>
              <p className="mt-3 text-muted-foreground">Check if we have already answered your question.</p>
            </div>
            <div className="mt-12 space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-xl border border-border bg-card overflow-hidden transition-all duration-500",
                    faqVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  )}
                  style={{ transitionDelay: faqVisible ? `${i * 80}ms` : "0ms" }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between p-5 text-left"
                    aria-expanded={openFaq === i}
                  >
                    <span className="font-medium text-card-foreground pr-4">{faq.q}</span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300",
                        openFaq === i && "rotate-180"
                      )}
                    />
                  </button>
                  <div className={cn(
                    "overflow-hidden transition-all duration-300",
                    openFaq === i ? "max-h-40 pb-5" : "max-h-0"
                  )}>
                    <p className="px-5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Still have questions?{" "}
              <a href="#" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="font-medium text-primary hover:text-accent transition-colors">
                Contact us above!
              </a>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
