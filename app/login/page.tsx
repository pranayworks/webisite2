'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Key, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState<'password' | 'otp'>('password')
  const [otpSent, setOtpSent] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSendOtp = async () => {
    if (!formData.email) {
      setError("Please enter your registered email node")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          shouldCreateUser: false
        }
      })
      if (error) throw error
      setOtpSent(true)
      toast.success("Security code dispatched to your inbox!")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: formData.otp,
        type: 'magiclink'
      })
      if (error) throw error
      router.push('/dashboard')
    } catch (err: any) {
      setError("Invalid or expired security code")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'otp') {
      if (!otpSent) return handleSendOtp()
      return
    }
    
    setError(null)
    setLoading(true)

    try {
      // 1. Smart Check: Is this a new user?
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', formData.email)
        .maybeSingle()

      if (!profile) {
        const { error: probeError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })

        if (probeError) {
          if (probeError.message.includes("Invalid login credentials")) {
            router.push(`/signup?email=${encodeURIComponent(formData.email)}`)
            return
          }
          throw probeError
        }
        router.push('/dashboard')
        return
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (loginError) throw loginError
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
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
              Login
            </h1>
            <p className="font-['Manrope'] text-[#c2caaf] text-lg tracking-wide uppercase font-light opacity-80">
              Illuminate the Forest
            </p>
          </header>

          <div className="bg-[#1e201c]/70 backdrop-blur-2xl rounded-xl p-10 shadow-2xl space-y-8 border border-[#424935]/15">
            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-4 border border-[#424935] rounded-full flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-widest text-[#e3e3db] hover:bg-[#b2f432]/5 hover:border-[#b2f432]/30 transition-all duration-300 disabled:opacity-50"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                Continue with Google
              </button>
              
              <div className="flex items-center gap-4 py-2">
                <div className="h-[1px] flex-1 bg-[#424935]/30"></div>
                <button 
                  onClick={() => { setMode(mode === 'password' ? 'otp' : 'password'); setOtpSent(false); setError(null); }}
                  className="text-[10px] uppercase tracking-widest text-[#b2f432] hover:text-[#97d700] font-bold transition-colors"
                >
                  {mode === 'password' ? 'Use OTP instead' : 'Use Password instead'}
                </button>
                <div className="h-[1px] flex-1 bg-[#424935]/30"></div>
              </div>
            </div>

            {error && (
              <div className="bg-red-950/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            {mode === 'password' ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#c2caaf] ml-1" htmlFor="email">
                      Guardian Identity
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@node.arboretum"
                        className="w-full bg-[#343530]/50 border-none rounded-lg px-4 py-4 text-[#e3e3db] placeholder:text-[#c2caaf]/30 focus:ring-1 focus:ring-[#b2f432]/40 transition-all font-['Manrope']"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#c2caaf] ml-1" htmlFor="password">
                      Access Key
                    </label>
                    <div className="relative">
                      <input
                        id="password"
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
            ) : (
              <form onSubmit={otpSent ? handleVerifyOtp : (e) => e.preventDefault()} className="space-y-6">
                {!otpSent ? (
                  <div className="space-y-6 text-center">
                    <div className="space-y-2 text-left">
                      <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#c2caaf] ml-1">
                        Node Identifier
                      </label>
                      <input
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your-email@gmail.com"
                        className="w-full bg-[#343530]/50 border-none rounded-lg px-4 py-4 text-[#e3e3db] focus:ring-1 focus:ring-[#b2f432]/40"
                      />
                    </div>
                    <button
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="w-full py-4 bg-[#b2f432] text-[#233600] font-bold rounded-full uppercase tracking-widest text-sm hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                    >
                      {loading ? 'Dispatching...' : 'Get Security Code'}
                      <Mail size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 text-center">
                    <div className="space-y-4">
                      <ShieldCheck className="w-12 h-12 text-[#b2f432] mx-auto animate-bounce" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-[#e3e3db]">Verify Your Identity</p>
                        <p className="text-xs text-[#c2caaf]">Code sent to {formData.email}</p>
                      </div>
                      <input
                        name="otp"
                        type="text"
                        required
                        value={formData.otp}
                        onChange={handleChange}
                        placeholder="Enter 6-digit code"
                        className="w-full bg-[#343530]/50 border-2 border-[#b2f432]/20 rounded-lg px-4 py-6 text-center text-3xl font-mono tracking-[0.5em] text-[#b2f432] focus:border-[#b2f432]/50 outline-none transition-all"
                        maxLength={6}
                      />
                    </div>
                    <div className="flex flex-col gap-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[#b2f432] text-[#233600] font-bold rounded-full uppercase tracking-widest text-sm hover:scale-[1.02] transition-all"
                      >
                        {loading ? 'Verifying...' : 'Authenticate Now'}
                      </button>
                      <button 
                        onClick={() => setOtpSent(false)}
                        className="text-xs text-[#c2caaf] hover:text-[#b2f432] transition-colors"
                      >
                        Wait, I need to use a different email
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>

          <footer className="text-center">
            <p className="text-[#c2caaf]/40 text-xs font-['Manrope'] tracking-widest leading-relaxed">
              © 2026 THE DIGITAL ARBORETUM.<br />PROTECTED BY STEWARDSHIP PROTOCOLS.
            </p>
          </footer>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#b2f432]/20 to-transparent opacity-30"></div>
    </div>
  )
}
