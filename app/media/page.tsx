"use client"

import { useState, useEffect } from "react"
import { Calendar, ExternalLink, Download, Play, X, ImageIcon, Video, Newspaper, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function MediaPage() {
  const [pressReleases, setPressReleases] = useState<any[]>([])
  const [mediaCoverage, setMediaCoverage] = useState<any[]>([])
  const [galleryItems, setGalleryItems] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [coverageFilter, setCoverageFilter] = useState<string>("All")
  const [lightbox, setLightbox] = useState<any>(null)
  const [filterTypes, setFilterTypes] = useState<string[]>(["All"])

  useEffect(() => {
    async function fetchMedia() {
      const { data } = await supabase.from('media_assets').select('*').order('created_at', { ascending: false })
      if (data) {
        setPressReleases(data.filter(m => m.asset_type === 'press_release'))
        
        const coverage = data.filter(m => m.asset_type === 'media_coverage')
        setMediaCoverage(coverage)
        
        // Dynamically build filter types based on location / category field
        const types = new Set(["All"])
        coverage.forEach(c => c.publisher_or_location && types.add(c.publisher_or_location))
        setFilterTypes(Array.from(types))

        setGalleryItems(data.filter(m => m.asset_type === 'gallery_image'))
        setVideos(data.filter(m => m.asset_type === 'video'))
      }
    }
    fetchMedia()
  }, [])


  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation()
  const { ref: pressRef, isVisible: pressVisible } = useScrollAnimation()
  const { ref: coverageRef, isVisible: coverageVisible } = useScrollAnimation()
  const { ref: galleryRef, isVisible: galleryVisible } = useScrollAnimation()
  const { ref: videoRef, isVisible: videoVisible } = useScrollAnimation()
  const { ref: brandRef, isVisible: brandVisible } = useScrollAnimation()

  const filteredCoverage = coverageFilter === "All"
    ? mediaCoverage
    : mediaCoverage.filter((m) => m.publisher_or_location === coverageFilter)

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
            <p className="text-sm font-medium uppercase tracking-widest text-accent">Media</p>
            <h1 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl text-balance">
              Green Legacy in the Spotlight
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-pretty">
              Press releases, media coverage, and our story - everything you need to know about Green Legacy.
            </p>
          </div>
        </section>

        {/* Featured Coverage */}
        <section className="bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <h2 className="mb-8 text-center font-serif text-2xl font-bold text-foreground">In the News</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {mediaCoverage.slice(0, 3).map((item, i) => (
                <div key={item.id || item.title} className="group rounded-2xl border border-border bg-card p-6 transition-all duration-500 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
                  <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{item.publisher_or_location}</span>
                  <h3 className="mt-3 font-semibold text-card-foreground leading-snug">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.date_published}</p>
                  <a href={item.media_url || '#'} target="_blank" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:text-accent transition-colors">
                    Read article <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Press Releases */}
        <section ref={pressRef} className="py-20 lg:py-28">
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <div className={cn(
              "text-center transition-all duration-700",
              pressVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}>
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl text-balance">Press Releases</h2>
            </div>
            <div className="mt-12 space-y-0 border-l-2 border-border">
              {pressReleases.map((pr, i) => (
                <div
                  key={pr.title}
                  className={cn(
                    "relative pl-8 pb-10 transition-all duration-500",
                    pressVisible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                  )}
                  style={{ transitionDelay: pressVisible ? `${i * 100}ms` : "0ms" }}
                >
                  <div className="absolute -left-2 top-0 h-4 w-4 rounded-full border-2 border-primary bg-background" />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {pr.date_published}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{pr.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pr.excerpt_or_headline}</p>
                  <div className="mt-3 flex gap-3">
                    <button className="text-sm font-medium text-primary hover:text-accent transition-colors">Read More</button>
                    <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      <Download className="h-3 w-3" /> PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Media Coverage */}
        <section ref={coverageRef} className="bg-muted/30 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className={cn(
              "text-center transition-all duration-700",
              coverageVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}>
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl text-balance">Media Coverage</h2>
            </div>
            <div className="mx-auto mt-8 flex max-w-md flex-wrap justify-center gap-2">
              {filterTypes.map((f) => (
                <button
                  key={f}
                  onClick={() => setCoverageFilter(f)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                    coverageFilter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground border border-border hover:text-foreground"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCoverage.map((item, i) => (
                <div
                  key={item.id}
                  className="group rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-lg animate-fade-in"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-accent">{item.publisher_or_location}</span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold leading-snug text-card-foreground">{item.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground">{item.date_published}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Photo Gallery */}
        <section ref={galleryRef} className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className={cn(
              "text-center transition-all duration-700",
              galleryVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}>
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl text-balance">Photo Gallery</h2>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {galleryItems.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => setLightbox(item)}
                  className={cn(
                    "group relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted transition-all duration-500 hover:shadow-xl",
                    galleryVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
                  )}
                  style={{ transitionDelay: galleryVisible ? `${i * 100}ms` : "0ms" }}
                  aria-label={`View ${item.title}`}
                >
                  {item.media_url ? (
                    <img src={item.media_url} className="absolute inset-0 h-full w-full object-cover" alt={item.title} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                      <ImageIcon className="h-12 w-12 text-primary/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-foreground/0 transition-all duration-300 group-hover:bg-foreground/40" />
                  <div className="absolute inset-x-0 bottom-0 translate-y-full p-4 transition-transform duration-300 group-hover:translate-y-0 text-left">
                    <p className="text-sm font-semibold text-background">{item.title}</p>
                    <p className="text-xs text-background/80">{item.publisher_or_location} &middot; {item.date_published}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Video Gallery */}
        <section ref={videoRef} className="bg-muted/30 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className={cn(
              "text-center transition-all duration-700",
              videoVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}>
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl text-balance">Video Gallery</h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {videos.map((v, i) => (
                <div
                  key={v.id}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:shadow-lg block",
                    videoVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  )}
                  style={{ transitionDelay: videoVisible ? `${i * 100}ms` : "0ms" }}
                >
                  <a href={v.media_url || '#'} target="_blank" className="block relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
                    {v.media_url && typeof v.media_url === 'string' && v.media_url.includes('youtube') && (
                        <img src={`https://img.youtube.com/vi/${new URL(v.media_url).searchParams.get('v')}/maxresdefault.jpg`} className="absolute inset-0 h-full w-full object-cover" />
                    )}
                    <Video className="h-12 w-12 text-muted-foreground/40 z-10" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 z-10">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
                        <Play className="h-6 w-6 ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 rounded bg-foreground/80 px-2 py-0.5 text-xs text-background z-10">{v.date_published}</span>
                  </a>
                  <div className="p-5">
                    <span className="text-xs font-medium text-accent">{v.publisher_or_location}</span>
                    <h3 className="mt-1 font-semibold text-card-foreground">{v.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Brand Assets */}
        <section ref={brandRef} className="py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
            <div className={cn(
              "transition-all duration-700",
              brandVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}>
              <FileText className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 font-serif text-3xl font-bold text-foreground sm:text-4xl text-balance">Brand Assets & Media Kit</h2>
              <p className="mt-4 text-muted-foreground text-pretty">
                Download our logos, brand colors, official photos, and fact sheets for press and media use.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button className="rounded-full bg-primary px-8 text-primary-foreground hover:bg-primary/90">
                  <Download className="mr-2 h-4 w-4" /> Download Media Kit
                </Button>
                <Button variant="outline" className="rounded-full border-border bg-transparent text-foreground hover:bg-muted">
                  Contact Press Team
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 backdrop-blur-sm p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 text-background hover:text-accent transition-colors"
              aria-label="Close lightbox"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="aspect-[16/9] rounded-2xl bg-muted flex items-center justify-center overflow-hidden relative">
              {lightbox.media_url ? (
                <img src={lightbox.media_url} alt={lightbox.title} className="w-full h-full object-contain" />
              ) : (
                <div className="text-center">
                  <ImageIcon className="mx-auto h-16 w-16 text-muted-foreground/40" />
                </div>
              )}
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 text-center text-white">
                <p className="mt-4 text-lg font-semibold">{lightbox.title}</p>
                <p className="text-sm opacity-80">{lightbox.publisher_or_location} &middot; {lightbox.date_published}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
