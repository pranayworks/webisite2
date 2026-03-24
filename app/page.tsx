"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HeroSection } from "@/components/landing/hero-section"
import { TrustedSection } from "@/components/landing/trusted-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { OccasionsSection } from "@/components/landing/occasions-section"
import { PricingPreviewSection } from "@/components/landing/pricing-preview-section"
import { ImpactPreviewSection } from "@/components/landing/impact-preview-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { GetInvolvedTeaser, NewsletterSection } from "@/components/landing/newsletter-section"

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <TrustedSection />
        <HowItWorksSection />
        <OccasionsSection />
        <PricingPreviewSection />
        <ImpactPreviewSection />
        <TestimonialsSection />
        <GetInvolvedTeaser />
        <NewsletterSection />
      </main>
      <SiteFooter />
    </>
  )
}
