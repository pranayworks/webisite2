/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/anchor-is-valid */
'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { calculateImpact, calculateRank } from '@/lib/impact'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'

const TreeMap = dynamic(() => import('@/components/TreeMap'), { ssr: false })

// Material Symbols mapping
const MaterialIcon = ({ name, className = "", style = {} }: { name: string, className?: string, style?: any }) => (
  <span
    className={`material-symbols-outlined shrink-0 ${className}`}
    style={{ fontSize: 'inherit', ...style }}
  >
    {name}
  </span>
)

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])
  const [allOrders, setAllOrders] = useState<any[]>([])
  const [metrics, setMetrics] = useState(calculateImpact(0))
  const [plantings, setPlantings] = useState<any[]>([])
  const [selectedTreeHistory, setSelectedTreeHistory] = useState<any>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [certData, setCertData] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [showPaymentRegistry, setShowPaymentRegistry] = useState(false)
  
  const certificateRef = useRef<HTMLDivElement>(null)
  const benefitsRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [monthlyStats, setMonthlyStats] = useState({ oxygen: '0', carbon: '0', energy: '0', daysRemaining: 0 })
  const rank = useMemo(() => calculateRank(metrics.trees), [metrics.trees])

  useEffect(() => {
    setMounted(true)
    checkUser()
  }, [])

  useEffect(() => {
    async function fetchPlantings() {
      if (!user?.id) return

      // Fetch both orders and their growth updates
      const { data: orders, error: ordersError } = await supabase
        .from('planting_orders')
        .select(`
          *,
          growth_updates (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'Planted')

      if (ordersError) {
        console.error("Error fetching plantings:", ordersError)
        return
      }

      setOrders(orders || [])

      // Fetch ALL orders (planted + pending) for the map
      const { data: allOrdersData } = await supabase
        .from('planting_orders')
        .select('id, steward_name, trees, status, location, planting_gps, planting_date, created_at, occasion, plan_name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setAllOrders(allOrdersData || [])

      const formattedPlantings = (orders || []).map((o, i) => {
        const species = o.species || ['Neem', 'Peepal', 'Banyan', 'Gulmohar'][i % 4]
        const region = o.location || 'Cauvery Delta, IN'
        const coords = o.planting_gps || 'Awaiting Sync'
        
        // Use real planting photo as the initial record
        const initialPhoto = o.planting_photo || `https://images.unsplash.com/photo-${['1502082553048-f009c37129b9', '1441974231531-c6227db76b6e', '1511497584788-c76fc42c9545', '1501183638710-841dd1904471'][i % 4]}?auto=format&fit=crop&q=80&w=800`
        const initialDate = o.planting_date ? new Date(o.planting_date).toLocaleDateString() : new Date(o.created_at).toLocaleDateString()

        // Combine with real growth updates from the database
        const historicalUpdates = (o.growth_updates || []).map((gu: any) => ({
          url: gu.photo_url,
          date: new Date(gu.created_at).toLocaleDateString(),
          note: gu.note
        }))

        const photos = [
          { url: initialPhoto, date: initialDate, note: 'Seedling established and verified.' },
          ...historicalUpdates
        ]

        return {
          id: o.id,
          species: species,
          region: region,
          coordinates: coords,
          age: o.age || '0y 1m',
          status: 'Healthy',
          photos: photos,
          growthStage: Math.min(100, (photos.length * 20)), // Dynamic growth stage based on updates
          latestPhoto: photos[photos.length - 1].url
        }
      })
      setPlantings(formattedPlantings)
    }

    fetchPlantings()
  }, [user?.id])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
    } else {
      // CRITICAL: Always fetch the freshest profile state to reflect recent setting changes
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setUser({ ...user, profile: profile || user.user_metadata || {} })
      
      // Calculate and set dynamic metrics based on user's specific plantings
      const userTrees = profile?.trees_planted || 0
      setMetrics(calculateImpact(userTrees))

      // Monthly Metrics (Algorithmically derived from total trees)
      setMonthlyStats({
        oxygen: (userTrees * 0.45).toFixed(1),
        carbon: (userTrees * 1.8).toFixed(1),
        energy: (userTrees * 15).toFixed(0),
        daysRemaining: 30 - new Date().getDate()
      })
    }
    setLoading(false)
  }

  const handleShareImpact = async () => {
    const shareText = `I am officially a ${rank.title} at Green Legacy! My grove has produced ${monthlyStats.oxygen}kg of Oxygen this month alone. Join the restoration: ${window.location.origin}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Botanical Legacy',
          text: shareText,
          url: window.location.origin
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(shareText)
      toast.success("Impact link copied to clipboard!")
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleManageBilling() {
    setShowPaymentRegistry(true)
  }

  const handleDownloadPDF = async (order?: any) => {
    // If an order is passed, set it as active cert data
    if (order) {
      setCertData(order)
    } else if (!certData) {
      toast.error("No record selected for certification")
      return
    }

    if (!certificateRef.current) return
    
    setIsGenerating(true)
    const toastId = toast.loading('Establishing biological verification...')
    
    try {
      // Load PDF libraries dynamically on demand
      const [html2canvas, { default: jsPDF }] = await Promise.all([
        import('html2canvas').then(m => m.default),
        import('jspdf')
      ])

      // Small delay to ensure the hidden element is properly rendered
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        backgroundColor: '#121410'
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('landscape', 'px', [1200, 840])
      pdf.addImage(imgData, 'PNG', 0, 0, 1200, 840)
      
      pdf.save(`GreenLegacy_Certificate_${(certData?.id || 'Stewardship').substring(0,8)}.pdf`)
      toast.success('Certificate verified and downloaded!', { id: toastId })
    } catch (error) {
      console.error('PDF Generation Error:', error)
      toast.error('Failed to establish sequence. Please try again.', { id: toastId })
    } finally {
      setIsGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121410] flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-[#b2f432]/20 flex items-center justify-center animate-pulse">
          <span className="material-symbols-outlined text-4xl text-[#b2f432]" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const displayName = user?.profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Steward'

  return (
    <div className="font-['Manrope'] bg-[#121410] text-[#e3e3db] flex min-h-screen selection:bg-[#b2f432] selection:text-[#233600]">
      {/* SideNavBar */}
      <aside className="bg-[#0d0f0b] h-full w-64 fixed left-0 top-0 hidden md:flex flex-col py-8 gap-6 z-40">
        <div className="px-8 mt-4 mb-4">
          <Link href="/">
            <h1 className="font-['Noto_Serif'] italic text-xl text-[#b2f432] cursor-pointer hover:opacity-80 transition-opacity">Green Legacy</h1>
          </Link>
          <p className="font-['Manrope'] text-[10px] uppercase tracking-[0.2em] text-[#e3e3db]/40 mt-1">Stewardship Portal</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <Link className="flex items-center gap-4 px-4 py-3 text-[#b2f432] font-bold bg-[#b2f432]/10 rounded-r-full font-['Manrope'] text-sm uppercase tracking-widest transition-all duration-200 translate-x-1" href="/dashboard">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Overview</span>
          </Link>


        </nav>

        <div className="px-6 mt-auto space-y-3">
          <button 
            onClick={handleManageBilling}
            className="flex items-center justify-center gap-3 w-full border border-[#b2f432]/30 text-[#b2f432] py-3 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-[#b2f432]/5 transition-all"
          >
            <span className="material-symbols-outlined text-sm">payments</span>
            Payment Registry
          </button>
          
          <Link href="/subscriptions" className="block w-full">
            <button className="w-full bg-[#b2f432] text-[#233600] py-4 rounded-full font-bold text-xs uppercase tracking-widest shadow-[0_40px_40px_-5px_rgba(178,244,50,0.1)] active:scale-95 transition-transform hover:bg-[#97d700]">
              Plant a Tree
            </button>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-6 mt-4 w-full text-[#e3e3db]/40 font-['Manrope'] text-xs uppercase tracking-widest hover:text-[#e3e3db] transition-all border-t border-[#424935]/10"
          >
            <span className="material-symbols-outlined">logout</span>

          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 md:ml-64 bg-[#121410] min-h-screen relative pb-20">

        {/* TopAppBar */}
        <header className="fixed top-0 right-0 left-0 md:left-64 h-20 bg-[#121410]/70 backdrop-blur-xl z-30 flex justify-between items-center px-8 border-b border-[#424935]/10">
          <div className="flex flex-col mb-4 md:mb-0">
            <h2 className="font-['Noto_Serif'] text-2xl font-bold tracking-tight text-[#e3e3db] capitalize">Welcome back, {displayName}</h2>
            <p className="text-xs font-['Manrope'] text-[#c2caaf] tracking-wider uppercase">Your legacy continues to grow.</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/settings" className="relative group shrink-0">
                <div className="w-10 h-10 rounded-full border border-[#b2f432]/30 overflow-hidden bg-[#1a1c18] hover:border-[#b2f432] transition-all">
                  {user?.profile?.avatar_url ? (
                    <img src={user.profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#c2caaf]/30">
                      <MaterialIcon name="person" className="text-xl" />
                    </div>
                  )}
                </div>
              </Link>
              <Link href="/" className="flex items-center gap-2 text-[#c2caaf] hover:text-[#b2f432] transition-colors pr-2 border-l border-[#424935]/20 pl-4">
                <span className="text-[10px] uppercase font-bold tracking-widest hidden sm:inline">Back to home</span>
                <span className="material-symbols-outlined cursor-pointer">home</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="pt-28 px-8 max-w-7xl mx-auto space-y-12">
          
          {/* Stewardship Level & Badge Section */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-[#1a1c18] border border-[#b2f432]/10 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-10">
              <div className="relative">
                <div className="absolute inset-0 bg-[#b2f432]/20 blur-2xl rounded-full scale-75 animate-pulse"></div>
                <div className="relative h-28 w-28 rounded-full bg-gradient-to-br from-[#121410] to-[#292b26] border-2 border-[#b2f432]/30 flex items-center justify-center p-4">
                  <span className="material-symbols-outlined text-[#b2f432] text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {metrics.trees >= 50 ? 'workspace_premium' : 
                     metrics.trees >= 15 ? 'nature_people' : 
                     metrics.trees >= 5 ? 'eco' : 
                     metrics.trees >= 2 ? 'potted_plant' : 'local_florist'}
                  </span>
                </div>
              </div>
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-[#b2f432]">Stewardship Rank</h3>
                  <h2 className="font-['Noto_Serif'] text-3xl font-bold mt-1">
                    {metrics.trees >= 50 ? 'Botanical Legend' : 
                     metrics.trees >= 15 ? 'Forest Founder' : 
                     metrics.trees >= 5 ? 'Grove Architect' : 
                     metrics.trees >= 2 ? 'Sprout Steward' : 'Seedling Guardian'}
                  </h2>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] items-end px-1">
                    <span className="text-[#c2caaf]/60 tracking-wider font-bold">NEXT RANK: {
                      metrics.trees >= 50 ? 'MAX LEVEL' : 
                      metrics.trees >= 15 ? 'Botanical Legend (50 Trees)' : 
                      metrics.trees >= 5 ? 'Forest Founder (15 Trees)' : 
                      metrics.trees >= 2 ? 'Grove Architect (5 Trees)' : 'Sprout Steward (2 Trees)'
                    }</span>
                    <span className="text-[#b2f432] font-mono">{metrics.trees} Trees</span>
                  </div>
                  <div className="h-2 w-full bg-[#121410] rounded-full overflow-hidden border border-[#424935]/10">
                    <div 
                      className="h-full bg-[#b2f432] transition-all duration-1000 shadow-[0_0_15px_rgba(178,244,50,0.5)]" 
                      style={{ width: `${Math.min(100, (metrics.trees / (metrics.trees >= 15 ? 50 : metrics.trees >= 5 ? 15 : metrics.trees >= 2 ? 5 : 2)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Impact Stats: Organic Bento Grid */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Metric Card 1: Trees */}
              <div className="bg-[#1a1c18] p-8 rounded-xl flex flex-col justify-between h-48 group hover:bg-[#292b26] transition-colors duration-500 border border-[#424935]/5">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-[#b2f432] text-3xl">forest</span>
                  <span className="text-[10px] uppercase tracking-widest text-[#c2caaf] font-bold">Trees Planted</span>
                </div>
                <div>
                  <p className="font-['Noto_Serif'] text-4xl font-bold text-[#e3e3db]">{metrics.trees} <span className="text-lg font-light text-[#c2caaf] italic">saplings</span></p>
                  <div className="w-full h-1 bg-[#424935]/20 mt-4 rounded-full overflow-hidden">
                    <div className="h-full bg-[#b2f432] transition-all duration-1000" style={{ width: `${Math.min(100, (metrics.trees / 100) * 100)}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Metric Card 2: Carbon */}
              <div className="bg-[#1a1c18] p-8 rounded-xl flex flex-col justify-between h-48 group hover:bg-[#292b26] transition-colors duration-500 border border-[#424935]/5">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-[#b2f432] text-3xl">co2</span>
                  <span className="text-[10px] uppercase tracking-widest text-[#c2caaf] font-bold">Carbon Offset</span>
                </div>
                <div>
                  <p className="font-['Noto_Serif'] text-4xl font-bold text-[#e3e3db]">{metrics.carbonOffset} <span className="text-lg font-light text-[#c2caaf] italic">tonnes</span></p>
                  <div className="w-full h-1 bg-[#424935]/20 mt-4 rounded-full overflow-hidden">
                    <div className="h-full bg-[#b2f432] transition-all duration-1000" style={{ width: `${Math.min(100, (metrics.carbonOffset / 5) * 100)}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Metric Card 3: Water */}
              <div className="bg-[#1a1c18] p-8 rounded-xl flex flex-col justify-between h-48 group hover:bg-[#292b26] transition-colors duration-500 border border-[#424935]/5">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-[#b2f432] text-3xl">water_drop</span>
                  <span className="text-[10px] uppercase tracking-widest text-[#c2caaf] font-bold">Water Saved</span>
                </div>
                <div>
                  <p className="font-['Noto_Serif'] text-4xl font-bold text-[#e3e3db]">{metrics.waterSaved} <span className="text-lg font-light text-[#c2caaf] italic">kiloliters</span></p>
                  <div className="w-full h-1 bg-[#424935]/20 mt-4 rounded-full overflow-hidden">
                    <div className="h-full bg-[#b2f432] transition-all duration-1000" style={{ width: `${Math.min(100, (metrics.waterSaved / 50) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 🗺️ Planting Map Section */}
          <section>
            <div className="flex items-end justify-between mb-6">
              <div>
                <h3 className="font-['Noto_Serif'] text-3xl font-bold text-[#e3e3db]">Grove Map</h3>
                <p className="text-[#c2caaf] text-sm mt-2">Live locations of your planting sites across India.</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#c2caaf]">
                <span className="flex items-center gap-1.5">
                  <span style={{ display:'inline-block', width:12, height:12, borderRadius:'50% 50% 50% 0', transform:'rotate(-45deg)', background:'#b2f432', border:'2px solid #233600' }} />
                  Planted
                </span>
                <span className="flex items-center gap-1.5">
                  <span style={{ display:'inline-block', width:12, height:12, borderRadius:'50% 50% 50% 0', transform:'rotate(-45deg)', background:'#f59e0b', border:'2px solid #78350f' }} />
                  Pending
                </span>
              </div>
            </div>
            <div className="w-full h-[420px] rounded-2xl overflow-hidden border border-[#424935]/20 bg-[#1a1c18] flex items-center justify-center">
              <div className="text-center">
                <MaterialIcon name="map" className="text-4xl text-[#b2f432] mb-3 opacity-20" />
                <p className="text-[#c2caaf] text-sm">Registry visualization currently being syncronized...</p>
              </div>
            </div>
          </section>

          {/* Green Points & Active CTA */}
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 bg-[#1a1c18] rounded-xl p-8 flex flex-col md:flex-row gap-8 items-center border border-[#424935]/10 shadow-[0_4px_40px_rgba(0,0,0,0.2)]">
              <div className="relative">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle className="text-[#424935]/30" cx="64" cy="64" fill="transparent" r="60" stroke="currentColor" strokeWidth="4"></circle>
                  <circle className="text-[#b2f432]" cx="64" cy="64" fill="transparent" r="60" stroke="currentColor" strokeDasharray="376.99" strokeDashoffset="100" strokeWidth="4"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-['Noto_Serif'] text-2xl font-bold text-[#e3e3db]">1,280</span>
                  <span className="text-[8px] uppercase tracking-widest text-[#c2caaf]">Points</span>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-['Noto_Serif'] text-xl font-bold mb-2 text-[#e3e3db]">Merit Balance</h3>
                <p className="text-sm text-[#c2caaf] mb-4 leading-relaxed">Your points represent biological debt settled. Redeem them for specialty seedlings or certificate upgrades.</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <div className="bg-[#343530] px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#b2f432]">+450</span>
                    <span className="text-[10px] uppercase tracking-tighter text-[#c2caaf]">Annual Renewal</span>
                  </div>
                  <div className="bg-[#343530] px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#b2f432]">+120</span>
                    <span className="text-[10px] uppercase tracking-tighter text-[#c2caaf]">Photo Update</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 relative group overflow-hidden rounded-xl bg-[#97d700] p-8 flex flex-col justify-end min-h-[240px]">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-40 mix-blend-overlay"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAXB2O4XwPabbKzUrb35EJwAg9GqdelfvnW-djvjKpW5AvouOvgm1SCLocJCIkSPhl3CB5Rwo3Bpx4jz1545Y3ExZ202UHYghdy-f7S_30zmnxG4sVVMlugxQJn8TYG4dEnW6cznvopjYRITO0xlhrgChIUfQGDaQflZWqUvtz1YtxH-J-r4vBnkEy4m_0obTNB5CFd-k8W-f2JjI-Mu1kYxlu3F7oy-QaSbAXGfsqAavB6_Ua_bYQDrwScayFsV2pYcO3DiNTh_RGq')" }}
              ></div>
              <div className="relative z-10">
                <h3 className="font-['Noto_Serif'] text-3xl font-bold text-[#3d5900] leading-tight mb-4">Extend Your<br />Heritage.</h3>
                <Link href="/subscriptions">
                  <button className="bg-[#3d5900] text-[#97d700] px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 group/btn hover:bg-[#233600] transition-colors">
                    Plant a New Tree
                    <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                </Link>
              </div>
            </div>
          </section>

          {/* My Forest: Tree Grid */}
          <section>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h3 className="font-['Noto_Serif'] text-3xl font-bold text-[#e3e3db]">My Forest</h3>
                <p className="text-[#c2caaf] text-sm mt-2">{metrics.trees} Active specimens under stewardship.</p>
              </div>
              <button className="text-xs uppercase tracking-widest text-[#b2f432] font-bold hover:underline">View All Registry</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {plantings.length > 0 ? (
                plantings.map((tree) => (
                  <div key={tree.id} className="bg-[#1a1c18] rounded-xl overflow-hidden group border border-[#424935]/5 shadow-lg flex flex-col">
                    <div className="h-44 overflow-hidden relative">
                      <img 
                        src={tree.latestPhoto} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        alt={tree.species} 
                      />
                      <div className="absolute top-4 left-4 bg-[#121410]/80 backdrop-blur-md px-3 py-1 rounded-full border border-[#b2f432]/20">
                        <span className="text-[9px] uppercase tracking-widest text-[#b2f432] font-bold">Latest Update</span>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedTreeHistory(tree)
                          setShowHistoryModal(true)
                        }}
                        className="absolute bottom-4 right-4 h-10 w-10 bg-[#b2f432] text-[#233600] rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-20"
                      >
                        <span className="material-symbols-outlined">history</span>
                      </button>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2 text-[#e3e3db]">
                         <h4 className="font-['Noto_Serif'] text-lg font-bold">{tree.species}</h4>
                         <span className="text-[10px] text-[#b2f432]">{tree.status}</span>
                      </div>
                      
                      <p className="text-[10px] text-[#c2caaf] mb-4 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">location_on</span> {tree.region}
                        </span>
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${tree.coordinates}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#b2f432] hover:underline flex items-center gap-1"
                        >
                          GPS <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                        </a>
                      </p>

                      {/* Growth Stage Progress */}
                      <div className="mb-6 space-y-2">
                        <div className="flex justify-between items-center text-[9px] uppercase tracking-tighter text-[#c2caaf]/60">
                          <span>Sapling</span>
                          <span>Young Tree</span>
                          <span>Mature</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#424935]/20 rounded-full overflow-hidden flex">
                          <div 
                            className="bg-[#b2f432] h-full transition-all duration-1000 shadow-[0_0_10px_rgba(178,244,50,0.5)]" 
                            style={{ width: `${tree.growthStage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="mt-auto flex justify-between items-center text-[10px] font-bold uppercase tracking-widest border-t border-[#424935]/10 pt-4">
                        <span className="text-[#c2caaf]">Age: {tree.age}</span>
                        <button 
                          onClick={() => {
                            setSelectedTreeHistory(tree)
                            setShowHistoryModal(true)
                          }}
                          className="text-[#b2f432] hover:underline"
                        >
                          Show Timeline
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 border-2 border-dashed border-[#424935]/20 rounded-xl text-center">
                  <span className="material-symbols-outlined text-5xl text-[#424935]/40 mb-4">nature</span>
                  <p className="text-[#c2caaf]">No specimens found. Start your legacy today.</p>
                  <Link href="/subscriptions" className="mt-4 inline-block text-[#b2f432] font-bold uppercase tracking-widest text-xs hover:underline">Plant a tree &rarr;</Link>
                </div>
              )}
            </div>
          </section>

          {/* Certificates & Archive */}
          <section className="pb-16">
            <div className="mb-8">
              <h3 className="font-['Noto_Serif'] text-3xl font-bold text-[#e3e3db]">Certificates</h3>
              <p className="text-[#c2caaf] text-sm mt-2">Valid legal documents of your environmental impact.</p>
            </div>

            <div className="space-y-4">
              <div className="group relative bg-[#1a1c18] px-8 py-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-[#b2f432]/10 hover:border-[#b2f432]/40 transition-all shadow-xl overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <MaterialIcon name="workspace_premium" className="text-8xl text-[#b2f432]" />
                </div>
                <div className="flex items-center gap-8 relative z-10">
                  <div className="h-20 w-16 bg-[#b2f432]/10 rounded-lg flex items-center justify-center border border-[#b2f432]/20 shadow-inner">
                    <MaterialIcon name="award_star" className="text-[#b2f432] text-3xl" />
                  </div>
                  <div>
                    <h5 className="font-['Noto_Serif'] text-2xl font-bold text-[#e3e3db]">Standard Carbon Offset Certificate</h5>
                    <p className="text-sm text-[#c2caaf] mt-1 italic">Issued upon first successful growth record • ID: #GL-88219-A</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto relative z-10">
                  <button 
                    onClick={handleDownloadPDF}
                    disabled={isGenerating}
                    className="flex-1 md:flex-none px-8 py-3 bg-[#b2f432] text-[#233600] rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_10px_20px_rgba(178,244,50,0.15)] disabled:opacity-50 disabled:cursor-wait"
                  >
                    {isGenerating ? 'Generating...' : 'Download Official PDF'}
                  </button>
                </div>
              </div>

              <div className="bg-[#1a1c18] px-8 py-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-[#424935]/5 hover:bg-[#343530]/40 transition-all opacity-60">
                <div className="flex items-center gap-6">
                  <div className="h-12 w-12 rounded bg-[#424935]/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#c2caaf]">lock</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-[#e3e3db]">Master Steward Diploma</h5>
                    <p className="text-xs text-[#c2caaf]">Unlocks at 50 Mature Trees • Progression: {metrics.trees}/50</p>
                  </div>
                </div>
                <button disabled className="px-6 py-2 bg-[#343530]/50 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#c2caaf] border border-[#424935]/10 cursor-not-allowed">Locked</button>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-[#1a1c18] rounded-[2.5rem] p-10 border border-[#b2f432]/10 relative overflow-hidden group hover:border-[#b2f432]/30 transition-all">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#b2f432]/5 blur-[100px] -mr-32 -mt-32"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between gap-10">
                <div className="space-y-6 flex-1">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-[#b2f432]/10 flex items-center justify-center text-[#b2f432]">
                      <MaterialIcon name="monitoring" />
                    </div>
                    <h3 className="font-['Noto_Serif'] text-2xl font-bold">Stewardship Insights</h3>
                  </div>
                  <p className="text-[#c2caaf] text-sm leading-relaxed max-w-md">
                    Based on your current grove of <span className="text-[#b2f432] font-bold">{metrics?.trees || 0} trees</span>, your biological assets have produced these estimated outputs this month:
                  </p>
                  
                  <div className="grid grid-cols-2 gap-6 pt-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-[#c2caaf]/40">Oxygen Produced</p>
                      <p className="text-2xl font-bold">{monthlyStats?.oxygen || '0.0'} <span className="text-xs text-[#b2f432]">KG</span></p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-[#c2caaf]/40">Carbon Absorbed</p>
                      <p className="text-2xl font-bold">{monthlyStats?.carbon || '0.0'} <span className="text-xs text-blue-400">KG</span></p>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-64 bg-[#121410] rounded-[2rem] p-8 border border-[#424935]/10 flex flex-col items-center justify-center text-center space-y-4 shadow-inner">
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#c2caaf]/60">Next Full Audit</p>
                  <div className="relative h-24 w-24">
                    <svg className="h-full w-full -rotate-90">
                      <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-[#343530]" />
                      <circle 
                        cx="48" 
                        cy="48" 
                        r="44" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={276} 
                        strokeDashoffset={276 - (276 * (30 - (monthlyStats?.daysRemaining || 30)) / 30)} 
                        className="text-[#b2f432] transition-all duration-1000 ease-out" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">{monthlyStats?.daysRemaining || 30}d</div>
                  </div>
                  <p className="text-[9px] text-[#424935] uppercase font-bold tracking-widest">Awaiting field sync</p>
                </div>
              </div>
            </div>

            {/* Viral Share / Referral Card */}
            <div className="bg-[#b2f432] rounded-[2.5rem] p-10 flex flex-col justify-between group shadow-[0_30px_60px_-15px_rgba(178,244,50,0.2)] hover:shadow-[0_40px_80px_-15px_rgba(178,244,50,0.3)] transition-all">
              <div className="space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-[#233600]/10 flex items-center justify-center group-hover:bg-[#233600]/20 transition-colors">
                  <MaterialIcon name="share" className="text-[#233600] text-2xl" />
                </div>
                <h3 className="font-['Noto_Serif'] text-3xl font-bold text-[#233600] leading-tight">Scale Your Network.</h3>
                <p className="text-[#233600]/60 text-sm font-medium">Dispatch your current rank and growth stats to the global stewardship community.</p>
              </div>
              <button 
                onClick={handleShareImpact}
                className="w-full py-5 bg-[#233600] text-[#b2f432] rounded-2xl font-bold uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all mt-8 shadow-xl"
              >
                Dispatch to World <MaterialIcon name="send" className="text-sm" />
              </button>
            </div>
          </section>

          {/* New Digital Forest Gallery */}
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            <div className="flex justify-between items-end px-2">
              <div>
                <h2 className="font-['Noto_Serif'] text-3xl font-bold">The Stewardship Field</h2>
                <p className="text-[#c2caaf] text-sm mt-1">Verified biological assets in your digital forest.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plantings.length > 0 ? plantings.map(tree => (
                <div key={tree.id} className="bg-[#1a1c18] rounded-[2rem] overflow-hidden border border-[#424935]/10 group hover:border-[#b2f432]/30 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] transition-all duration-700">
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <img 
                      src={tree.latestPhoto} 
                      className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" 
                      alt={tree.species} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121410] via-transparent to-transparent opacity-80"></div>
                    <div className="absolute bottom-6 left-8 flex flex-col gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#b2f432] bg-[#233600]/60 px-4 py-1.5 rounded-full backdrop-blur-xl border border-[#b2f432]/20 w-fit">
                        {tree.species}
                      </span>
                      <h4 className="text-xl font-bold text-white tracking-tight">{tree.region}</h4>
                    </div>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center group/gps cursor-pointer">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#c2caaf]/40">Legacy Coordinates</p>
                        <p className="text-sm font-mono text-[#b2f432] group-hover:text-white transition-colors">{tree.coordinates}</p>
                      </div>
                      <MaterialIcon name="gps_fixed" className="text-[#b2f432] text-xl opacity-20 group-hover:opacity-100 transition-all group-hover:rotate-12" />
                    </div>
                    <div className="pt-6 border-t border-[#424935]/10 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-[#b2f432] animate-pulse"></div>
                        <p className="text-xs font-bold text-[#e3e3db] uppercase tracking-widest">{tree.status}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleDownloadPDF(tree)}
                          className="h-12 w-12 rounded-2xl bg-[#1a1c18] border border-[#b2f432]/20 flex items-center justify-center hover:bg-[#b2f432] hover:text-[#233600] transition-all duration-300 group/cert"
                          title="Download Certificate"
                        >
                          <MaterialIcon name="card_membership" className="group-hover/cert:scale-110 transition-transform" />
                        </button>
                        <button 
                          onClick={() => { setSelectedTreeHistory(tree); setShowHistoryModal(true); }}
                          className="h-12 w-12 rounded-2xl bg-[#343530] flex items-center justify-center hover:bg-[#b2f432] hover:text-[#233600] transition-all duration-300 group/btn"
                          title="Growth Timeline"
                        >
                          <MaterialIcon name="analytics" className="group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-24 px-12 border-2 border-dashed border-[#424935]/10 rounded-[3rem] flex flex-col items-center text-center space-y-6 bg-white/[0.01]">
                   <span className="material-symbols-outlined text-6xl text-[#424935]/30">forest</span>
                   <div className="space-y-2">
                    <h3 className="text-xl font-bold text-[#c2caaf]">No verified plantings yet</h3>
                    <p className="text-sm text-[#424935] max-w-sm mx-auto">Your trees will appear here once our field stewards verify the biological establishment.</p>
                   </div>
                </div>
              )}
            </div>
          </section>
        </div>

        <footer className="bg-[#121410] w-full py-12 px-8 mt-auto border-t border-[#424935]/20">
          <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 text-center">
            <p className="font-['Manrope'] text-xs text-[#e3e3db]/40">© 2026 Green Legacy. Dedicated to a greener future.</p>
            <div className="flex flex-wrap justify-center gap-6">
              <a className="text-[#e3e3db]/40 text-xs hover:text-[#b2f432] transition-colors duration-300" href="/privacy">Privacy Policy</a> | 
              <a className="text-[#e3e3db]/40 text-xs hover:text-[#b2f432] transition-colors duration-300" href="/terms">Terms</a> | 
              <a className="text-[#e3e3db]/40 text-xs hover:text-[#b2f432] transition-colors duration-300" href="/faqs">FAQs</a> | 
              <a className="text-[#e3e3db]/40 text-xs hover:text-[#b2f432] transition-colors duration-300" href="/refund">Refund</a>
            </div>
          </div>
        </footer>
      </main>

      {/* BottomNavBar (Mobile only Filter from Hierarchy) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#1a1c18] border-t border-[#424935]/10 flex items-center justify-around z-50">
        <a className="flex flex-col items-center gap-1 text-[#b2f432]" href="#">
          <MaterialIcon name="dashboard" />
          <span className="text-[8px] uppercase tracking-widest font-bold">Home</span>
        </a>
        <a className="flex flex-col items-center gap-1 text-[#c2caaf]" href="#">
          <MaterialIcon name="forest" />
          <span className="text-[8px] uppercase tracking-widest">Trees</span>
        </a>
        <div className="-mt-8">
          <Link href="/subscriptions">
            <div className="h-14 w-14 rounded-full bg-[#b2f432] flex items-center justify-center shadow-lg hover:bg-[#97d700] transition-colors cursor-pointer">
              <MaterialIcon name="add" className="text-[#233600]" />
            </div>
          </Link>
        </div>
        <a className="flex flex-col items-center gap-1 text-[#c2caaf]" href="#">
          <MaterialIcon name="workspace_premium" />
          <span className="text-[8px] uppercase tracking-widest">Awards</span>
        </a>
      </nav>

      {/* Growth History Modal */}
      {showHistoryModal && selectedTreeHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-[#0d0f0b]/95 backdrop-blur-md" onClick={() => setShowHistoryModal(false)}></div>
          <div className="bg-[#1a1c18] w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl relative z-10 border border-[#b2f432]/10 animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-[#424935]/10 flex justify-between items-center">
              <div>
                <h3 className="font-['Noto_Serif'] text-3xl font-bold flex items-center gap-4">
                  Growth Timeline <span className="text-sm font-['Manrope'] px-3 py-1 bg-[#b2f432]/10 text-[#b2f432] rounded-full">{selectedTreeHistory.species}</span>
                </h3>
                <p className="text-[#c2caaf] text-sm mt-2 font-['Manrope'] tracking-wide">Historical records of your botanical legacy.</p>
              </div>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="h-10 w-10 rounded-full bg-[#343530] text-[#e3e3db] flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all"
              >
                <MaterialIcon name="close" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {selectedTreeHistory.photos.map((photo: any, idx: number) => (
                  <div key={idx} className="space-y-4 group">
                    <div className="aspect-[4/5] rounded-xl overflow-hidden ring-1 ring-[#424935]/20 group-hover:ring-[#b2f432]/40 transition-all">
                      <img src={photo.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={`Growth cycle ${idx}`} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-[#b2f432]"></div>
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-[#c2caaf]">Update Record</p>
                          <p className="font-bold text-[#e3e3db]">{photo.date}</p>
                        </div>
                      </div>
                      <span className="text-[8px] bg-[#343530] px-2 py-1 rounded text-[#b2f432] border border-[#b2f432]/10 font-bold uppercase tracking-tighter self-start">Verified</span>
                    </div>
                    {photo.note && (
                      <p className="text-xs text-[#c2caaf] italic line-clamp-3 pl-4 border-l border-[#424935]/20 font-['Manrope']">
                        "{photo.note}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-8 bg-[#121410]/50 border-t border-[#424935]/10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <MaterialIcon name="verified" className="text-[#b2f432] text-4xl" />
                <div>
                   <p className="text-sm font-bold">Authenticated Biological Impact</p>
                   <p className="text-xs text-[#c2caaf]">Validated by Green Legacy Field Stewards</p>
                </div>
              </div>
              <button className="w-full md:w-auto px-8 py-3 bg-[#b2f432] text-[#233600] rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Download Sequence</button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Certificate Component for PDF generation */}
      <div className="fixed -left-[4000px] top-0 pointer-events-none">
        <div 
          ref={certificateRef}
          className="w-[1200px] h-[840px] bg-[#121410] text-[#e3e3db] p-20 flex flex-col items-center justify-center relative overflow-hidden border-[16px] border-[#b2f432]/20 shadow-2xl"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          {/* Decorative Borders */}
          <div className="absolute inset-6 border border-[#b2f432]/10 pointer-events-none"></div>
          <div className="absolute inset-10 border border-[#b2f432]/5 pointer-events-none"></div>
          
          {/* Background Elements */}
          <div className="absolute -right-32 -bottom-32 opacity-[0.05] rotate-12">
            <MaterialIcon name="park" style={{ fontSize: '600px' }} />
          </div>
          <div className="absolute -left-32 -top-32 opacity-[0.05] -rotate-12">
            <MaterialIcon name="forest" style={{ fontSize: '500px' }} />
          </div>

          <div className="relative z-10 w-full flex flex-col items-center text-center">
            <MaterialIcon name="workspace_premium" className="text-[#b2f432] text-8xl mb-8" />
            <h1 className="font-['Noto_Serif'] italic text-3xl text-[#b2f432] mb-3">Green Legacy</h1>
            <p className="text-xs uppercase tracking-[0.5em] text-[#c2caaf] mb-16">Universal Stewardship Commission</p>
            
            <h2 className="font-['Noto_Serif'] text-7xl font-bold mb-6 tracking-tight">Certificate of Stewardship</h2>
            <p className="text-2xl text-[#c2caaf] font-light italic mb-12">This officially certifies that</p>
            
            <div className="w-full max-w-3xl border-b-4 border-[#b2f432]/40 pb-6 mb-12">
              <span className="font-['Noto_Serif'] text-6xl font-bold text-[#e3e3db] uppercase tracking-wider">{displayName}</span>
            </div>
            
            <p className="max-w-3xl text-xl text-[#c2caaf] leading-relaxed mb-16 px-12">
              Has successfully anchored a biological legacy by establishing <strong>{certData ? certData.trees || 1 : metrics.trees} specimen(s)</strong> of <strong>{certData?.species || 'Native Flora'}</strong>. 
              These trees are now verified in the global registry at <strong>{certData?.region || 'Cauvery Delta'}</strong>, 
              contributing significantly to global biodiversity and environmental restoration.
              {certData?.occasion && <span className="block mt-4 text-[#b2f432] font-semibold italic">Planted in honor of: {certData.occasion}</span>}
            </p>

            <div className="grid grid-cols-3 gap-24 w-full max-w-4xl mt-12 pb-12">
              <div className="flex flex-col items-center border-t-2 border-[#424935]/40 pt-6">
                <span className="text-xs uppercase tracking-[0.2em] text-[#c2caaf] font-bold">Issue Date</span>
                <span className="font-bold text-[#e3e3db] mt-2 text-lg">{certData?.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-32 w-32 bg-white rounded-2xl border-4 border-[#b2f432]/30 flex items-center justify-center relative mb-4 overflow-hidden">
                   <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://greenlegacy.in/verify/${certData?.id || 'official'}`} alt="verification qr" className="w-24 h-24" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#b2f432] font-black">Verify Authentication</span>
              </div>
              <div className="flex flex-col items-center border-t-2 border-[#424935]/40 pt-6">
                 <span className="text-xs uppercase tracking-[0.2em] text-[#c2caaf] font-bold">Legacy ID</span>
                 <span className="font-mono text-lg text-[#e3e3db] mt-2 tracking-tighter">#{certData?.id?.substring(0,8).toUpperCase() || 'GL-CORE-001'}</span>
              </div>
            </div>

            <footer className="mt-24">
              <p className="text-xs uppercase tracking-[0.4em] text-[#c2caaf]/30 italic">
                Protecting our planet, one tree at a time. Authenticated Environmental Stewardship.
              </p>
            </footer>
          </div>
        </div>
      </div>
      {/* Payment Registry Modal */}
      {showPaymentRegistry && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-[#0d0f0b]/95 backdrop-blur-md" onClick={() => setShowPaymentRegistry(false)}></div>
          <div className="bg-[#1a1c18] w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 border border-[#b2f432]/10 animate-in fade-in zoom-in duration-300">
            <div className="p-10 border-b border-[#424935]/10 flex justify-between items-center bg-[#121410]/50">
              <div>
                <h3 className="font-['Noto_Serif'] text-3xl font-bold flex items-center gap-4 text-[#b2f432]">
                   Stewardship Ledger
                </h3>
                <p className="text-[#c2caaf] text-sm mt-2 font-['Manrope'] tracking-wide">Historical record of financial and biological contributions.</p>
              </div>
              <button 
                onClick={() => setShowPaymentRegistry(false)}
                className="h-12 w-12 rounded-full bg-[#343530] text-[#e3e3db] flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all border border-white/5"
              >
                <MaterialIcon name="close" />
              </button>
            </div>
            
            <div className="p-10 overflow-x-auto max-h-[60vh] custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-[#c2caaf]/60 font-black border-b border-[#424935]/20">
                    <th className="pb-6 pl-2">S.No</th>
                    <th className="pb-6">Legacy Item</th>
                    <th className="pb-6">Establishment</th>
                    <th className="pb-6">Quantity</th>
                    <th className="pb-6">Geo Authentication</th>
                    <th className="pb-6 text-right pr-2">Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#424935]/10">
                  {allOrders.length > 0 ? allOrders.map((order, idx) => (
                    <tr key={order.id} className="group hover:bg-[#b2f432]/5 transition-colors">
                      <td className="py-6 pl-2 font-mono text-xs text-[#c2caaf]/40">{idx + 1}</td>
                      <td className="py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#e3e3db]">{order.plan_name || 'Forest Sapling'}</span>
                          <span className="text-[10px] text-[#b2f432]/60 uppercase tracking-tighter">{order.occasion || 'General Plantation'}</span>
                        </div>
                      </td>
                      <td className="py-6">
                        <span className="text-sm font-medium">{new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </td>
                      <td className="py-6">
                        <div className="flex items-center gap-2">
                           <span className="h-2 w-2 rounded-full bg-[#b2f432]"></span>
                           <span className="text-sm font-bold">{order.trees} Trees</span>
                        </div>
                      </td>
                      <td className="py-6">
                        <span className="text-xs font-mono text-[#c2caaf] bg-[#121410] px-3 py-1 rounded-lg border border-[#424935]/20">
                          {order.planting_gps || 'Awaiting Sync'}
                        </span>
                      </td>
                      <td className="py-6 text-right pr-2">
                        <span className="text-sm font-black text-white">₹{order.amount || (order.trees * 299)}</span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-[#c2caaf]/40 italic">No treasury records found in current sequence.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-10 bg-[#121410]/50 border-t border-[#424935]/10 flex justify-between items-center">
              <div className="flex items-center gap-4 text-[#c2caaf]">
                <MaterialIcon name="verified_user" className="text-[#b2f432]" />
                <span className="text-xs font-medium tracking-wide">Officially notarized by Green Legacy Biological Registry</span>
              </div>
              <p className="text-xs font-bold text-[#e3e3db]">Total Contribution: <span className="text-[#b2f432] ml-2">₹{allOrders.reduce((acc, curr) => acc + (curr.amount || curr.trees * 299), 0).toLocaleString()}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
