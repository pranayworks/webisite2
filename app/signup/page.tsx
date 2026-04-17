'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { sendWelcomeEmail } from '@/app/actions/welcome'

const carouselItems = [
  {
    image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=2000",
    title: "Planting Perpetuity",
    description: "Your digital presence begins as a seed. Every entry fosters a new era of stewardship.",
    icon: "park"
  },
  {
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2000",
    title: "Eco-Legacy",
    description: "Build a forest that outlives our generation. Sustainable impact starts here.",
    icon: "eco"
  },
  {
    image: "https://images.unsplash.com/photo-1511497584788-c76fc42c9545?auto=format&fit=crop&q=80&w=2000",
    title: "Nature Sync",
    description: "Connecting the digital world with the biological heartbeat of our planet.",
    icon: "spa"
  }
]

export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (formData.password.length < 6) {
      setError('Encryption key must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName
          }
        }
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('Failed to create identity node')
      }

      await new Promise(resolve => setTimeout(resolve, 500))

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.fullName,
          phone: formData.phone || null
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }

      sendWelcomeEmail(formData.fullName, formData.email).catch(console.warn)

      setSuccess(true)

      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (err: any) {
      if (err.message?.includes('rate limit')) {
        setError('Too many attempts. Please wait.')
      } else if (err.message?.includes('already registered')) {
        setError('This node is already registered. Authenticate instead.')
      } else {
        setError(err.message || 'Failed to establish legacy. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#121410] text-[#e3e3db] font-['Manrope'] overflow-hidden selection:bg-[#b2f432] selection:text-[#233600]">
      <main className="flex min-h-screen w-full">
        <section className="relative hidden lg:flex flex-1 items-center justify-center bg-[#121410] overflow-hidden">
          {carouselItems.map((item, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-30' : 'opacity-0'}`}
              style={{
                backgroundImage: `url('${item.image}')`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            />
          ))}
          
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(178,244,50,0.1),transparent)]"></div>

          <div className="relative z-10 text-center space-y-12 w-full px-12">
            <div className="relative w-96 h-96 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 opacity-10 blur-xl scale-110">
                <span className="material-symbols-outlined text-[300px] text-[#b2f432]" style={{ fontVariationSettings: "'FILL' 1" }}>
                   {carouselItems[currentSlide].icon}
                </span>
              </div>
              <div className="relative flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#b2f432]/20 flex items-center justify-center animate-pulse">
                  <span className="material-symbols-outlined text-4xl text-[#b2f432]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {carouselItems[currentSlide].icon === 'park' ? 'spa' : carouselItems[currentSlide].icon === 'eco' ? 'nature' : 'water_drop'}
                  </span>
                </div>
                <div className="mt-8">
                  <h2 className="font-['Noto_Serif'] text-4xl italic font-bold tracking-tight text-[#e3e3db] animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {carouselItems[currentSlide].title}
                  </h2>
                  <p className="mt-4 font-['Manrope'] text-[#c2caaf] max-w-sm mx-auto opacity-80 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    {carouselItems[currentSlide].description}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              {carouselItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${index === currentSlide ? 'w-8 bg-[#b2f432]' : 'w-2 bg-[#343530]'}`}
                />
              ))}
            </div>
            
            <p className="text-[#c2caaf]/60 text-sm font-light tracking-[0.2em] uppercase">Plant a tree , Grow Your Legacy</p>
          </div>

          <div className="absolute top-12 left-12">
             <h1 className="font-['Noto_Serif'] text-2xl font-bold italic text-[#e3e3db] tracking-tight">
               Green Legacy <span className="text-[#b2f432]">Sign Up</span>
             </h1>
          </div>
        </section>

        <section className="flex-1 flex items-center justify-center bg-[#1a1c18] px-8 md:px-24 relative z-10">
          <div className="w-full max-w-md space-y-10">
            <header className="space-y-4">
              <h1 className="font-['Noto_Serif'] text-5xl font-bold text-[#e3e3db] tracking-tighter">Grow Your Legacy</h1>
              <p className="font-['Manrope'] text-lg text-[#c2caaf] font-light">Join the circle of stewards in the digital wilderness.</p>
            </header>

            <div className="space-y-4">
              <button
                onClick={handleGoogleSignUp}
                disabled={loading}
                className="w-full py-4 border border-[#424935] rounded-full flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-widest text-[#e3e3db] hover:bg-[#b2f432]/5 hover:border-[#b2f432]/30 transition-all duration-300 disabled:opacity-50"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                Continue with Google
              </button>
              
              <div className="flex items-center gap-4 py-2">
                <div className="h-[1px] flex-1 bg-[#424935]/30"></div>
                <span className="text-[10px] uppercase tracking-widest text-[#c2caaf]/40">or use ancestral identifier</span>
                <div className="h-[1px] flex-1 bg-[#424935]/30"></div>
              </div>
            </div>

            {error && (
              <div className="bg-red-950/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-[#b2f432]/10 border border-[#b2f432]/50 text-[#b2f432] px-4 py-3 rounded-lg text-sm">
                Legacy established. Redirecting to initialization sequence...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 group">
                <label className="font-['Manrope'] text-xs uppercase tracking-widest text-[#c2caaf] group-focus-within:text-[#b2f432] transition-colors" htmlFor="steward-name">
                  Full Name
                </label>
                <input
                  id="steward-name"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={loading || success}
                  placeholder="Full identity name"
                  className="w-full bg-[#343530] border-none rounded-none py-4 px-4 focus:ring-0 text-[#e3e3db] font-['Manrope'] text-lg placeholder:text-[#c2caaf]/30 border-b border-[#424935] focus:border-[#b2f432] transition-all"
                />
              </div>

              <div className="space-y-2 group">
                <label className="font-['Manrope'] text-xs uppercase tracking-widest text-[#c2caaf] group-focus-within:text-[#b2f432] transition-colors" htmlFor="email">
                   Gmail Id
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading || success}
                  placeholder="@gmail.com"
                  className="w-full bg-[#343530] border-none rounded-none py-4 px-4 focus:ring-0 text-[#e3e3db] font-['Manrope'] text-lg placeholder:text-[#c2caaf]/30 border-b border-[#424935] focus:border-[#b2f432] transition-all"
                />
              </div>

              <div className="space-y-2 group">
                <label className="font-['Manrope'] text-xs uppercase tracking-widest text-[#c2caaf] group-focus-within:text-[#b2f432] transition-colors" htmlFor="phone">
                  Mobile Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading || success}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full bg-[#343530] border-none rounded-none py-4 px-4 focus:ring-0 text-[#e3e3db] font-['Manrope'] text-lg placeholder:text-[#c2caaf]/30 border-b border-[#424935] focus:border-[#b2f432] transition-all"
                />
              </div>

              <div className="space-y-2 group">
                <label className="font-['Manrope'] text-xs uppercase tracking-widest text-[#c2caaf] group-focus-within:text-[#b2f432] transition-colors" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading || success}
                    placeholder="••••••••••••"
                    className="w-full bg-[#343530] border-none rounded-none py-4 px-4 focus:ring-0 text-[#e3e3db] font-['Manrope'] text-lg placeholder:text-[#c2caaf]/30 border-b border-[#424935] focus:border-[#b2f432] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-[#c2caaf] hover:text-[#b2f432] transition-colors"
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-6 space-y-6">
                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full py-5 bg-[#b2f432] text-[#233600] font-['Manrope'] font-extrabold uppercase tracking-widest text-sm rounded-full hover:bg-[#97d700] transition-all duration-300 transform active:scale-[0.98] shadow-xl shadow-[#b2f432]/10 disabled:opacity-50 disabled:active:scale-100"
                >
                  {loading ? 'Initializing...' : 'Establish Legacy'}
                </button>
                <p className="text-center font-['Manrope'] text-sm text-[#c2caaf]">
                  Already a user? <Link href="/login" className="text-[#b2f432] hover:underline underline-offset-4 decoration-1">Authenticate Identity</Link>
                </p>
              </div>
            </form>

            <footer className="pt-12 text-center border-t border-[#424935]/10">
              <div className="inline-flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] text-[#c2caaf]/40">
                <span>Encrypted Protocol</span>
                <span className="w-1 h-1 bg-[#c2caaf]/40 rounded-full"></span>
                <span>Zero-Footprint Carbon</span>
                <span className="w-1 h-1 bg-[#c2caaf]/40 rounded-full"></span>
                <span>V. 2.1.0</span>
              </div>
            </footer>
          </div>
        </section>
      </main>

      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-50 mix-blend-overlay"></div>
    </div>
  )
}