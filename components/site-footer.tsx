"use client"

import Link from "next/link"
import Image from "next/image"
import { TreePine, Instagram, Linkedin, Twitter, Youtube, Facebook, ArrowUp, MessageCircle, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

const quickLinks = [
  { label: "About Us", href: "/about" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Subscriptions", href: "/subscriptions" },
  { label: "Impact", href: "/impact" },
  { label: "Get Involved", href: "/get-involved" },
  { label: "Media", href: "/media" },
]

const programs = [
  { label: "Individual Planting", href: "/subscriptions" },
  { label: "Corporate CSR", href: "/get-involved" },
  { label: "Campus Ambassador", href: "/get-involved" },
  { label: "Volunteer Program", href: "/get-involved" },
  { label: "Gift a Tree", href: "/subscriptions" },
]

const support = [
  { label: "Contact Us", href: "/contact" },
  { label: "FAQs", href: "/faqs" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Refund Policy", href: "/refund" },
]

const socials = [
  { icon: Instagram, href: "https://www.instagram.com/greenlegacy_org?igsh=MXNnZGY1eXkyaXRvcA==", label: "Instagram" },
  { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61578555315281", label: "Facebook" },
  { icon: Twitter, href: "https://x.com/GreenLegac28872", label: "Twitter" },
  { icon: Youtube, href: "https://youtube.com/@greenlegacy-h5m?si=iwAo3JvWMUj8tA63", label: "YouTube" },
  { icon: MessageCircle, href: "https://wa.me/918074935169?text=Hi%20Green%20Legacy,%20I'm%20interested%20in%20planting%20a%20tree%20and%20want%20to%20know%20more%20about%20the%20impact!", label: "WhatsApp" },
]

export function SiteFooter() {
  const { ref, isVisible } = useScrollAnimation(0.1)
  const [showTop, setShowTop] = useState(false)
  const [contactEmail, setContactEmail] = useState("hello@greenlegacy.in")
  const [contactPhone, setContactPhone] = useState("+91 98765 43210")

  useEffect(() => {
    supabase.from('site_config').select('*').in('key', ['contact_email', 'contact_phone'])
      .then(({data}) => {
        if(data) {
          const email = data.find(d => d.key === 'contact_email')?.value
          const phone = data.find(d => d.key === 'contact_phone')?.value
          if(email) setContactEmail(email)
          if(phone) setContactPhone(phone)
        }
      })
    const handleScroll = () => setShowTop(window.scrollY > 500)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <footer ref={ref} className="border-t border-border bg-card text-card-foreground">
        <div
          className={cn(
            "mx-auto max-w-7xl px-4 py-12 transition-all duration-700 lg:px-8 lg:py-16",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}
        >
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <Link href="/" className="flex items-center">
                <img 
                  src="/logo.svg"
                  alt="Green Legacy Logo"
                  className="h-12 w-auto object-contain"
                />
              </Link>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Planting today, thriving tomorrow. We connect donors, agriculture colleges, and NGOs
                to create measurable environmental impact across India.
              </p>
              <div className="flex gap-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:scale-110"
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
              <div className="flex flex-col gap-1.5 text-sm text-muted-foreground mt-2 border-t border-border/50 pt-4">
                <a href={`mailto:${contactEmail}`} className="hover:text-primary flex items-center gap-2 transition-colors"><Mail className="w-3.5 h-3.5"/> {contactEmail}</a>
                <a href={`tel:${contactPhone}`} className="hover:text-primary flex items-center gap-2 transition-colors"><Phone className="w-3.5 h-3.5"/> {contactPhone}</a>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Quick Links</h3>
              <ul className="space-y-3">
                {quickLinks.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Programs</h3>
              <ul className="space-y-3">
                {programs.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Support</h3>
              <ul className="space-y-3">
                {support.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; 2026 Green Legacy. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Made with care for the planet.
            </p>
          </div>
        </div>
      </footer>

      {/* Back to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110",
          showTop ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
        )}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </>
  )
}
