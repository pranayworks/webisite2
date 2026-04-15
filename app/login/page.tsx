'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // 1. Smart Check: Is this a new user? (Case-insensitive check)
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', formData.email)
        .maybeSingle()

      // 2. Only redirect if we are SURE they are new (no profile and no previous auth record)
      if (!profile) {
        // Double check: Try a quick sign in. If it fails with 'Invalid credentials', they exist but have no profile.
        // For now, let's just proceed with login if no profile is found to avoid the loop.
        const { error: probeError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })

        if (probeError) {
          if (probeError.message.includes("Invalid login credentials")) {
             // User exists but has no profile - this is an edge case, redirect to signup to 'finish' their profile
             router.push(`/signup?email=${encodeURIComponent(formData.email)}`)
             return
          }
          throw probeError
        }
        
        // Success! They logged in even without a profile.
        router.push('/dashboard')
        return
      }

      // 2. Existing User: Proceed with Login
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (loginError) {
        if (loginError.message === 'Invalid login credentials') {
          throw new Error('Access key mismatch. Please verify your credentials.')
        }
        throw loginError
      }

      // Success! Redirect to dashboard
      router.push('/dashboard')

    } catch (err: any) {
      setError(err.message || 'Failed to authenticate')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#121410] text-[#e3e3db] font-['Manrope'] min-h-screen overflow-hidden selection:bg-[#b2f432] selection:text-[#233600]">
      <div className="fixed inset-0 z-0">
        <img 
          alt="Forest Background" 
          className="w-full h-full object-cover grayscale-[20%] opacity-40 scale-105" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAO7DrUp4C3WrdRft7ukBWIquYvTMFSt88rrBt1JjRuhuqQyv4qXPc2pJV93g4j_5W6ZuLXA2vpFfB5ZWpGFP-5jBxZgmlkmGuZDFNXna0wqDsUCCjHG6kZ9m_T92naPVV_TPx2QM7wYuWykFnYnxTq_5WYH4aY8qUCFeDOi_Ds82qBHv8mVd9p5bni7du-MEH-s9MqQeccd9rfTYWgr_N7a54cCCO-wtcmCbbhVHrANDfVTGkOaKDzR8NJ0EnQUL0N7aQbwgTHoqDa"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#121410]/40 to-[#121410]/95"></div>
      </div>

      <main className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-[480px] space-y-12">
          
          <header className="text-center space-y-4">
            <h1 className="font-['Noto_Serif'] text-5xl italic tracking-tight text-[#e3e3db]">
              Arboretum
            </h1>
            <p className="font-['Manrope'] text-[#c2caaf] text-lg tracking-wide uppercase font-light opacity-80">
              Illuminate the Forest
            </p>
          </header>

          <div className="bg-[#1e201c]/70 backdrop-blur-2xl rounded-xl p-10 shadow-2xl space-y-8 border border-[#424935]/15">
            {error && (
              <div className="bg-red-950/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm text-center animate-in fade-in zoom-in duration-300">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#c2caaf] ml-1" htmlFor="identity">
                    Guardian Identity
                  </label>
                  <div className="relative">
                    <input 
                      id="identity" 
                      name="email"
                      type="email" 
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Your ancestral identifier (email)" 
                      className="w-full bg-[#343530]/50 border-none rounded-lg px-4 py-4 text-[#e3e3db] placeholder:text-[#c2caaf]/30 focus:ring-1 focus:ring-[#b2f432]/40 transition-all font-['Manrope']"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#c2caaf] ml-1" htmlFor="key">
                    Access Key
                  </label>
                  <div className="relative">
                    <input 
                      id="key" 
                      name="password"
                      type={showPassword ? "text" : "password"} 
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••••••" 
                      className="w-full bg-[#343530]/50 border-none rounded-lg px-4 py-4 pr-12 text-[#e3e3db] placeholder:text-[#c2caaf]/30 focus:ring-1 focus:ring-[#b2f432]/40 transition-all font-['Manrope']"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c2caaf] hover:text-[#b2f432] transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-1 pt-2">
                <div></div>
                <Link href="/forgot-password" title="Recover your access key" className="text-sm font-['Manrope'] text-[#c2caaf] hover:text-[#b2f432] transition-colors duration-300">
                  Forgotten Key?
                </Link>
              </div>

              <div className="flex flex-col items-center justify-center pt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="group relative w-20 h-20 rounded-full bg-[#b2f432] flex items-center justify-center transition-all duration-500 hover:scale-110 hover:shadow-[0_0_60px_10px_rgba(178,244,50,0.25)] disabled:opacity-50 disabled:hover:scale-100"
                >
                  <span className="material-symbols-outlined text-[#233600] text-4xl group-hover:scale-110 transition-transform duration-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                    wb_sunny
                  </span>
                </button>
                <span className="mt-4 text-xs font-['Manrope'] uppercase tracking-[0.3em] text-[#b2f432] font-bold">
                  {loading ? 'Authenticating...' : 'Enter'}
                </span>
              </div>
            </form>
          </div>

          <footer className="text-center">
            <p className="text-[#c2caaf]/40 text-xs font-['Manrope'] tracking-widest leading-relaxed">
              © 2026 THE DIGITAL ARBORETUM.<br/>PROTECTED BY STEWARDSHIP PROTOCOLS.
            </p>
          </footer>
        </div>
      </main>
      
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#b2f432]/20 to-transparent opacity-30"></div>
    </div>
  )
}
