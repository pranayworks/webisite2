'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (loginError) throw loginError

      // Success! Redirect to dashboard
      router.push('/dashboard')

    } catch (err: any) {
      setError(err.message || 'Failed to log in')
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
              <div className="bg-red-950/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm text-center">
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
                      type="password" 
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••••••" 
                      className="w-full bg-[#343530]/50 border-none rounded-lg px-4 py-4 text-[#e3e3db] placeholder:text-[#c2caaf]/30 focus:ring-1 focus:ring-[#b2f432]/40 transition-all font-['Manrope']"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-1 pt-2">
                <Link href="/signup" className="text-sm font-['Manrope'] text-[#c2caaf] hover:text-[#b2f432] transition-colors duration-300">
                  Request Passage
                </Link>
                <Link href="#" className="text-sm font-['Manrope'] text-[#c2caaf] hover:text-[#b2f432] transition-colors duration-300">
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
