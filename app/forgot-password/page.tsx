'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setSent(true)
      toast.success("Recovery link sent! Check your inbox.")
    } catch (err: any) {
      toast.error(err.message || "Failed to send recovery link")
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
              Recovery
            </h1>
            <p className="font-['Manrope'] text-[#c2caaf] text-lg tracking-wide uppercase font-light opacity-80">
              Restore your access key
            </p>
          </header>

          <div className="bg-[#1e201c]/70 backdrop-blur-2xl rounded-xl p-10 shadow-2xl space-y-8 border border-[#424935]/15">
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#c2caaf] ml-1" htmlFor="email">
                    Guardian Email
                  </label>
                  <input 
                    id="email" 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email" 
                    className="w-full bg-[#343530]/50 border-none rounded-lg px-4 py-4 text-[#e3e3db] placeholder:text-[#c2caaf]/30 focus:ring-1 focus:ring-[#b2f432]/40 transition-all font-['Manrope']"
                  />
                </div>

                <div className="flex flex-col items-center justify-center pt-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="group relative w-20 h-20 rounded-full bg-[#b2f432] flex items-center justify-center transition-all duration-500 hover:scale-110 hover:shadow-[0_0_60px_10px_rgba(178,244,50,0.25)] disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[#233600] text-4xl group-hover:scale-110 transition-transform duration-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                      mail
                    </span>
                  </button>
                  <span className="mt-4 text-xs font-['Manrope'] uppercase tracking-[0.3em] text-[#b2f432] font-bold text-center">
                    {loading ? 'Sending link...' : 'Send Recovery Link'}
                  </span>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-6 py-8">
                <div className="w-20 h-20 bg-[#b2f432]/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[#b2f432] text-4xl">mark_email_read</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Check your inbox</h3>
                  <p className="text-sm text-[#c2caaf]">We've sent a special access link to your email. Click it to reset your key.</p>
                </div>
                <Link href="/login" className="block text-[#b2f432] font-bold text-xs uppercase tracking-widest hover:underline">
                  Back to Login
                </Link>
              </div>
            )}
          </div>
          
          <div className="text-center">
             <Link href="/login" className="text-xs font-['Manrope'] text-[#c2caaf]/60 hover:text-[#b2f432] transition-colors">
                Return to Sanctuary
             </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
