'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      toast.success("Access key updated successfully!")
      router.push('/login')
    } catch (err: any) {
      toast.error(err.message || "Failed to update password")
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
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2000"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#121410]/40 to-[#121410]/95"></div>
      </div>

      <main className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-[480px] space-y-12">
          
          <header className="text-center space-y-4">
            <h1 className="font-['Noto_Serif'] text-5xl italic tracking-tight text-[#e3e3db]">
              New Origins
            </h1>
            <p className="font-['Manrope'] text-[#c2caaf] text-lg tracking-wide uppercase font-light opacity-80">
              Set your new access key
            </p>
          </header>

          <div className="bg-[#1e201c]/70 backdrop-blur-2xl rounded-xl p-10 shadow-2xl space-y-8 border border-[#424935]/15">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#c2caaf] ml-1">
                    New Password
                  </label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••" 
                    className="w-full bg-[#343530]/50 border-none rounded-lg px-4 py-4 text-[#e3e3db] placeholder:text-[#c2caaf]/30 focus:ring-1 focus:ring-[#b2f432]/40 transition-all font-['Manrope']"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#c2caaf] ml-1">
                    Confirm Password
                  </label>
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••" 
                    className="w-full bg-[#343530]/50 border-none rounded-lg px-4 py-4 text-[#e3e3db] placeholder:text-[#c2caaf]/30 focus:ring-1 focus:ring-[#b2f432]/40 transition-all font-['Manrope']"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center pt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="group relative w-20 h-20 rounded-full bg-[#b2f432] flex items-center justify-center transition-all duration-500 hover:scale-110 shadow-xl disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[#233600] text-4xl group-hover:rotate-180 transition-transform duration-700" style={{ fontVariationSettings: "'FILL' 1" }}>
                    key
                  </span>
                </button>
                <span className="mt-4 text-xs font-['Manrope'] uppercase tracking-[0.3em] text-[#b2f432] font-bold text-center">
                  {loading ? 'Redefining Key...' : 'Update Password'}
                </span>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
