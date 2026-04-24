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
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  
  // Subscription State
  const [activeSub, setActiveSub] = useState<any>(null)
  const [isCancelling, setIsCancelling] = useState(false)

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
      setAvatarUrl(profile?.avatar_url || '')

      // Check for active Razorpay recurring subscriptions
      const { data: subData } = await supabase
        .from('planting_orders')
        .select('*')
        .eq('user_id', user.id)
        .like('order_key', 'sub_%')
        .not('status', 'eq', 'Canceled')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
        
      if (subData) {
        setActiveSub(subData)
      }

      setLoading(false)
    }
    fetchUser()
  }, [router])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = e.target.files?.[0]
      if (!file || !user) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = fileName

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)
      toast.success('Avatar uploaded!')
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!activeSub || !activeSub.order_key) return
    const confirmed = window.confirm("Are you sure you want to cancel your recurring environmental impact? This will stop all future billing immediately.")
    if (!confirmed) return

    setIsCancelling(true)
    try {
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: activeSub.order_key, orderId: activeSub.id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to cancel subscription')
      
      toast.success("Subscription successfully canceled.")
      setActiveSub(null)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsCancelling(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSaving(true)
    
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: fullName,
        phone: phone,
        age: parseInt(age) || 0,
        gender: gender,
        avatar_url: avatarUrl
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
          gender: gender,
          avatar_url: avatarUrl
        }
      })
      toast.success('Profile synced successfully')
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
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <h1 className="font-['Noto_Serif'] text-5xl font-bold">Settings</h1>
              <p className="text-[#c2caaf] text-lg">Manage your stewardship profile and preferences.</p>
            </div>
            
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-full border-2 border-[#b2f432]/20 overflow-hidden bg-[#1a1c18] relative">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#c2caaf]/30">
                    <MaterialIcon name="person" className="text-4xl" />
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-[#121410]/80 flex items-center justify-center">
                    <div className="h-5 w-5 border-2 border-[#b2f432] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#b2f432] rounded-full flex items-center justify-center text-[#233600] cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-lg">
                <MaterialIcon name="photo_camera" className="text-sm" />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
              </label>
            </div>
          </header>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="bg-[#1a1c18] p-8 rounded-3xl border border-[#424935]/10 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#c2caaf]">Account Email</label>
                <div className="w-full bg-[#121410] border border-[#424935]/20 rounded-2xl px-6 py-4 text-[#c2caaf] opacity-60 flex items-center gap-3">
                  <MaterialIcon name="mail" className="text-sm" />
                  <span>{user?.email}</span>
                </div>
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

            <button 
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#b2f432] text-[#233600] py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
            >
              {isSaving ? 'Syncing...' : 'Save Steward Identity'}
            </button>
          </form>

          {/* Subscription Management (RBI Compliance) */}
          {activeSub && (
            <div className="bg-[#1a1c18] p-8 rounded-3xl border border-red-500/20 space-y-6 mt-12">
              <div className="flex items-center gap-4 text-red-500/80">
                <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <MaterialIcon name="credit_card_off" />
                </div>
                <h3 className="font-['Noto_Serif'] text-xl font-bold">Billing & Subscription</h3>
              </div>
              <p className="text-[#c2caaf] text-sm leading-relaxed">
                You have an active recurring subscription <b>({activeSub.plan_name})</b>. Under RBI guidelines, you may cancel your auto-pay mandate at any time. Your current cycle's trees will still be planted.
              </p>
              
              <div className="pt-4 border-t border-[#424935]/20 flex justify-between items-center">
                <div className="text-xs font-mono text-[#c2caaf]/50 truncate max-w-[200px]">
                  ID: {activeSub.order_key}
                </div>
                <button
                  onClick={handleCancelSubscription}
                  disabled={isCancelling}
                  className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {isCancelling ? 'Processing...' : 'Cancel Subscription'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
