'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { sendWelcomeEmail } from '@/app/actions/welcome'

export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
      // Create auth user
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

      // Create profile entry
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

      // Send welcome email (non-blocking)
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
        {/* Left Section: Visual Legacy Area */}
        <section className="relative hidden lg:flex flex-1 items-center justify-center bg-[#121410] overflow-hidden">
          <div 
            className="absolute inset-0 opacity-20" 
            style={{ 
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAg9f36xGiM4LqW74MvntHxoRmqb2QULQejNuvlKzsk7h1dvnyBmXBrbQRiADvcFwOL_ZIl6JGTamVAntT-fUtuA0ZCiovmZu6oS8NfC6C9Cj99cLGopENgpdhAo9RPLPF4-C1Ay9cwQ96X7kb-zasy6nRKdcG_WxyCvaYfYWzrMkBr5jiLbmi-F7EtBRm5WEJTBvdOa3XiWKmMMjdZ3yTHzFBiE-p9Fnc252m54NcdehLReXqNWlNZCZRta5UO0W90Te-aCwT2dI2s')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(178,244,50,0.1),transparent)]"></div>

          <div className="relative z-10 text-center space-y-12">
            <div className="relative w-96 h-96 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 opacity-10 blur-xl scale-110">
                <span className="material-symbols-outlined text-[300px] text-[#b2f432]" style={{ fontVariationSettings: "'FILL' 1" }}>park</span>
              </div>
              <div className="relative flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#b2f432]/20 flex items-center justify-center animate-pulse">
                  <span className="material-symbols-outlined text-4xl text-[#b2f432]" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
                </div>
                <div className="mt-8">
                  <h2 className="font-['Noto_Serif'] text-4xl italic font-bold tracking-tight text-[#e3e3db]">Planting Perpetuity</h2>
                  <p className="mt-4 font-['Manrope'] text-[#c2caaf] max-w-sm mx-auto">Your digital presence begins as a seed. Every entry fosters a new era of stewardship.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
              <div className="h-1 bg-[#b2f432] rounded-full"></div>
              <div className="h-1 bg-[#343530] rounded-full"></div>
              <div className="h-1 bg-[#343530] rounded-full"></div>
              <div className="h-1 bg-[#343530] rounded-full"></div>
            </div>
          </div>

          <div className="absolute top-12 left-12">
            <span className="font-['Noto_Serif'] text-2xl font-bold italic text-[#e3e3db]">Arboretum</span>
          </div>
        </section>

        {/* Right Section: Minimalist Form Area */}
        <section className="flex-1 flex items-center justify-center bg-[#1a1c18] px-8 md:px-24 relative z-10">
          <div className="w-full max-w-md space-y-10">
            <header className="space-y-4">
              <h1 className="font-['Noto_Serif'] text-5xl font-bold text-[#e3e3db] tracking-tighter">Grow Your Legacy</h1>
              <p className="font-['Manrope'] text-lg text-[#c2caaf] font-light">Join the circle of stewards in the digital wilderness.</p>
            </header>

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

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2 group">
                <label className="font-['Manrope'] text-xs uppercase tracking-widest text-[#c2caaf] group-focus-within:text-[#b2f432] transition-colors" htmlFor="steward-name">
                  Steward Name
                </label>
                <div className="relative">
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
              </div>

              <div className="space-y-2 group">
                <label className="font-['Manrope'] text-xs uppercase tracking-widest text-[#c2caaf] group-focus-within:text-[#b2f432] transition-colors" htmlFor="email">
                  Digital Node
                </label>
                <div className="relative">
                  <input 
                    id="email" 
                    name="email"
                    type="email" 
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading || success}
                    placeholder="email@node.arboretum" 
                    className="w-full bg-[#343530] border-none rounded-none py-4 px-4 focus:ring-0 text-[#e3e3db] font-['Manrope'] text-lg placeholder:text-[#c2caaf]/30 border-b border-[#424935] focus:border-[#b2f432] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="font-['Manrope'] text-xs uppercase tracking-widest text-[#c2caaf] group-focus-within:text-[#b2f432] transition-colors" htmlFor="phone">
                  Liaison Number
                </label>
                <div className="relative">
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
              </div>

              <div className="space-y-2 group">
                <label className="font-['Manrope'] text-xs uppercase tracking-widest text-[#c2caaf] group-focus-within:text-[#b2f432] transition-colors" htmlFor="password">
                  Encryption Key
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
                  Already a Steward? <Link href="/login" className="text-[#b2f432] hover:underline underline-offset-4 decoration-1">Authenticate Identity</Link>
                </p>
              </div>
            </form>

            <footer className="pt-12 text-center">
              <div className="inline-flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] text-[#c2caaf]/40">
                <span>Encrypted Protocol</span>
                <span className="w-1 h-1 bg-[#c2caaf]/40 rounded-full"></span>
                <span>Zero-Footprint Carbon</span>
                <span className="w-1 h-1 bg-[#c2caaf]/40 rounded-full"></span>
                <span>V. 2.0.4</span>
              </div>
            </footer>
          </div>
        </section>
      </main>

      {/* Overlay Grain for texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-50 mix-blend-overlay"></div>
    </div>
  )
}