'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

const MaterialIcon = ({ name, className = "" }: { name: string, className?: string }) => (
  <span className={`material-symbols-outlined shrink-0 ${className}`} style={{ fontSize: 'inherit' }}>
    {name}
  </span>
)

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('Other')
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setUser({ ...user, profile })
      setFullName(profile?.full_name || '')
      setPhone(profile?.phone || '')
      setAge(profile?.age?.toString() || '')
      setGender(profile?.gender || 'Other')
      setLoading(false)
    }
    fetchUser()
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSaving(true)
    
    // Perform update directly using the client-side session
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: fullName,
        phone: phone,
        age: parseInt(age) || 0,
        gender: gender
      }, { onConflict: 'id' })

    setIsSaving(false)

    if (!updateError) {
      setUser({
        ...user,
        profile: {
          ...user.profile,
          full_name: fullName,
          phone: phone,
          age: parseInt(age) || 0,
          gender: gender
        }
      })
      toast.success('Saved successfully')
    } else {
      toast.error('Failed to sync profile', {
        description: updateError.message
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121410] flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-[#b2f432] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121410] text-[#e3e3db] font-['Manrope'] selection:bg-[#b2f432] selection:text-[#233600]">
      <header className="fixed top-0 w-full z-50 bg-[#121410]/70 backdrop-blur-xl border-b border-[#424935]/10 flex justify-between items-center px-8 h-20">
        <Link href="/dashboard" className="flex items-center gap-3 text-[#c2caaf] hover:text-[#b2f432] transition-colors">
          <MaterialIcon name="arrow_back" />
          <span className="font-bold text-sm uppercase tracking-widest">Back to Dashboard</span>
        </Link>
      </header>

      <main className="pt-32 pb-20 px-4 max-w-2xl mx-auto">
        <div className="space-y-12">
          <header>
            <h1 className="font-['Noto_Serif'] text-5xl font-bold">Settings</h1>
            <p className="text-[#c2caaf] mt-4 text-lg">Manage your stewardship profile and preferences.</p>
          </header>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="bg-[#1a1c18] p-8 rounded-3xl border border-[#424935]/10 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#c2caaf]">Account Email</label>
                <div className="w-full bg-[#121410] border border-[#424935]/20 rounded-2xl px-6 py-4 text-[#c2caaf] opacity-60 flex items-center gap-3">
                  <MaterialIcon name="mail" className="text-sm" />
                  <span>{user?.email}</span>
                </div>
                <p className="text-[10px] text-[#c2caaf]/40 italic pl-1">Email changes are restricted to ensure stewardship chain-of-title.</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#c2caaf]">Full Name</label>
                <div className="relative group">
                  <MaterialIcon name="person" className="absolute left-6 top-1/2 -translate-y-1/2 text-[#c2caaf]/40 group-focus-within:text-[#b2f432] transition-colors" />
                  <input 
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#121410] border border-[#424935]/20 rounded-2xl pl-14 pr-6 py-4 focus:ring-1 focus:ring-[#b2f432]/40 outline-none transition-all"
                    placeholder="Full Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#c2caaf]">Phone Number</label>
                  <div className="relative group">
                    <MaterialIcon name="call" className="absolute left-6 top-1/2 -translate-y-1/2 text-[#c2caaf]/40 group-focus-within:text-[#b2f432] transition-colors" />
                    <input 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#121410] border border-[#424935]/20 rounded-2xl pl-14 pr-6 py-4 focus:ring-1 focus:ring-[#b2f432]/40 outline-none transition-all"
                      placeholder="+91 00000 00000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#c2caaf]">Age</label>
                  <div className="relative group">
                    <MaterialIcon name="event" className="absolute left-6 top-1/2 -translate-y-1/2 text-[#c2caaf]/40 group-focus-within:text-[#b2f432] transition-colors" />
                    <input 
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full bg-[#121410] border border-[#424935]/20 rounded-2xl pl-14 pr-6 py-4 focus:ring-1 focus:ring-[#b2f432]/40 outline-none transition-all"
                      placeholder="Age"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#c2caaf]">Gender</label>
                <div className="relative group">
                  <MaterialIcon name="diversity_3" className="absolute left-6 top-1/2 -translate-y-1/2 text-[#c2caaf]/40 group-focus-within:text-[#b2f432] transition-colors" />
                  <select 
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-[#121410] border border-[#424935]/20 rounded-2xl pl-14 pr-6 py-4 focus:ring-1 focus:ring-[#b2f432]/40 outline-none transition-all appearance-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-[#b2f432] text-[#233600] py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <div className="h-4 w-4 border-2 border-[#233600] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <MaterialIcon name="check" className="text-sm" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </main>
    </div>
  )
}
