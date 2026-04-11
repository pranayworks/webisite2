"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Menu, X, Sun, Moon, TreePine, User, LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Subscriptions", href: "/subscriptions" },
  { label: "Impact", href: "/impact" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Get Involved", href: "/get-involved" },
  { label: "Media", href: "/media" },
  { label: "Contact", href: "/contact" },
]

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Check initial session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    checkUser()

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileOpen])

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 lg:px-8">
          <Link href="/" className="flex items-center group" aria-label="Green Legacy Home">
            <img
              src="/logo.svg"
              alt="Green Legacy Logo"
              className="h-11 md:h-15 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-1.5 lg:px-2 xl:px-3 py-2 text-[13px] xl:text-sm font-medium whitespace-nowrap transition-colors duration-200",
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-colors">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 overflow-hidden rounded-2xl border-border bg-background/95 backdrop-blur-xl">
                <DropdownMenuLabel className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-primary/10 transition-colors">
                    <TreePine className="h-4 w-4" />
                    <span>Steward Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {!user ? (
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-primary/10 transition-colors">
                      <User className="h-4 w-4" />
                      <span>Log In / Sign Up</span>
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-primary/10 transition-colors">
                        <User className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-3 cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/95 backdrop-blur-xl transition-all duration-500 lg:hidden",
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <nav className="flex h-full flex-col items-center justify-center gap-6 pt-20" aria-label="Mobile navigation">
          {navItems.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-2xl font-medium transition-all duration-500",
                isMobileOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0",
                pathname === item.href ? "text-primary" : "text-foreground"
              )}
              style={{ transitionDelay: isMobileOpen ? `${i * 75}ms` : "0ms" }}
              onClick={() => setIsMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="flex flex-col items-center gap-4 mt-6 w-full px-8">
            {!user ? (
              <Link href="/login" onClick={() => setIsMobileOpen(false)} className="w-full">
                <Button className="w-full rounded-full bg-primary text-primary-foreground py-6 text-lg font-bold">
                  Get Started
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/dashboard" onClick={() => setIsMobileOpen(false)} className="w-full">
                  <Button variant="outline" className="w-full rounded-full py-6 text-lg">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/settings" onClick={() => setIsMobileOpen(false)} className="w-full">
                  <Button variant="ghost" className="w-full rounded-full py-6 text-lg">
                    Settings
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => {
                    handleLogout()
                    setIsMobileOpen(false)
                  }}
                  className="w-full rounded-full py-6 text-lg text-destructive hover:text-destructive flex items-center justify-center gap-2"
                >
                  <LogOut className="h-5 w-5" />
                  Log Out
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  )
}
