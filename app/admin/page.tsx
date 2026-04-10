'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { addGrowthUpdate } from '@/app/actions/impact'
import { testTelegramAction, testEmailAction, testInquiryEmailAction, testGrowthEmailAction, testOrderConfirmationEmailAction } from '@/app/actions/diagnostics'

// Material Symbols mapping for consistent look with their design
const MaterialIcon = ({ name, className = "", style = {} }: { name: string, className?: string, style?: any }) => (
  <span
    className={`material-symbols-outlined shrink-0 ${className}`}
    style={{ fontSize: 'inherit', ...style }}
  >
    {name}
  </span>
)

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState<'queue' | 'history' | 'products' | 'diagnostics' | 'inquiries'>('queue')
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [selectedSteward, setSelectedSteward] = useState('')
  const [history, setHistory] = useState<any[]>([])
  const [reminders, setReminders] = useState<any[]>([
    { id: 'RM-102', user: 'Sarah Kent', species: 'Neem', dualDate: 'Oct 24, 2026', type: '6mo Growth Photo' },
    { id: 'RM-88', user: 'James Wilson', species: 'Banyan', dualDate: 'Oct 25, 2026', type: 'Nutrient Check' }
  ])

  const [locationContext, setLocationContext] = useState('')
  const [gpsCoordinates, setGpsCoordinates] = useState('')
  const [selectedSpecies, setSelectedSpecies] = useState('Neem')
  const [searchQuery, setSearchQuery] = useState('')
  const [growthNote, setGrowthNote] = useState('')

  const [orders, setOrders] = useState<any[]>([])
  const [dbProducts, setDbProducts] = useState<any[]>([])
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [verifyingOrder, setVerifyingOrder] = useState<any>(null)
  const [proofData, setProofData] = useState({ gps: '', species: 'Neem', photo: '', date: new Date().toISOString().split('T')[0] })

  // Dynamic Global Metrics
  const GLOBAL_GOAL = 1000
  const currentPlantings = orders.reduce((sum, order) => {
    const count = parseInt(order.quantity) || 0;
    return sum + count;
  }, 0)
  const reforestationPercent = (currentPlantings / GLOBAL_GOAL) * 100

  const filteredOrders = orders.filter(o =>
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    const checkAdmin = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      const isAuthorizedAdmin = user?.email === 'mamidipranay07@gmail.com' || user?.user_metadata?.role === 'admin'
      
      if (!session || !isAuthorizedAdmin) {
        toast.error("Unauthorized Access", { description: "You do not have permission to view the stewardship portal." })
        router.push('/login')
        return
      }

      setIsAdmin(true)
      fetchDashboardData()
    }
    checkAdmin()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('planting_orders')
        .select('*')
        .eq('status', 'Pending')
        .order('created_at', { ascending: false })

      const dummyOrders = [
        { id: 'MOCK-101', name: 'Aris Thorne', initials: 'AT', date: 'Oct 24, 2026', quantity: '1 Tree', status: 'Pending', color: 'bg-secondary-container/20 text-secondary', occasion: 'Birthday', plan: 'Sprout (One-Time)' },
        { id: 'MOCK-102', name: 'Lyra Chen', initials: 'LC', date: 'Oct 25, 2026', quantity: '5 Trees', status: 'Pending', color: 'bg-secondary-container/20 text-secondary', occasion: 'Memorial', plan: 'Forest (One-Time)' }
      ]

      const formattedOrders = (ordersData || []).map(o => ({
        id: o.id.toString(),
        name: o.steward_name,
        initials: o.steward_name.split(' ').map((n: string) => n[0]).join(''),
        date: new Date(o.created_at).toLocaleDateString(),
        quantity: `${o.trees} Tree${o.trees > 1 ? 's' : ''}`,
        status: o.status,
        color: 'bg-secondary-container/20 text-secondary',
        occasion: o.occasion,
        plan: o.plan_name
      }))

      setOrders([...formattedOrders, ...dummyOrders])

      const { data: historyData, error: historyError } = await supabase
        .from('planting_orders')
        .select('*')
        .eq('status', 'Completed')
        .order('created_at', { ascending: false })

      const dummyHistory = [
        { id: 'TR-1001', steward: 'Elias Jaxon', species: 'Banyan', date: 'Oct 20, 2026', loc: 'Western Ghats', status: 'Healthy' },
        { id: 'TR-1002', steward: 'Sarah Kent', species: 'Neem', date: 'Oct 22, 2026', loc: 'Northern Reserve', status: 'Healthy' }
      ]

      const formattedHistory = (historyData || []).map(o => ({
        id: `TR-${o.id.slice(0,4)}`,
        steward: o.steward_name,
        species: o.species || 'Neem',
        date: new Date(o.created_at).toLocaleDateString(),
        loc: o.location || 'Northern Reserve',
        status: 'Healthy'
      }))

      setHistory([...formattedHistory, ...dummyHistory])

      // 3. Fetch Site Products
      const { data: pData } = await supabase
        .from('site_products')
        .select('*')
        .order('id', { ascending: true })
      if (pData) setDbProducts(pData)

      // 4. Fetch Contact Messages
      const { data: mData } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
      if (mData) setMessages(mData)

    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Database connection issue. Showing dummy data.")
    } finally {
      setLoading(false)
    }
  }

  const syncGPS = (target: 'new' | 'proof') => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by this browser.")
      return
    }

    toast.loading("Fetching high-precision GPS...")
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
        if (target === 'new') setGpsCoordinates(coords)
        else setProofData({...proofData, gps: coords})
        toast.dismiss()
        toast.success("GPS Synchronized")
      },
      (error) => {
        toast.dismiss()
        toast.error("GPS Access Denied or Timeout")
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )
  }

  const handleVerifyPlanting = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verifyingOrder) return

    const { error } = await supabase
      .from('planting_orders')
      .update({
        status: 'Planted',
        planting_gps: proofData.gps,
        species: proofData.species,
        planting_photo: proofData.photo,
        planting_date: proofData.date
      })
      .eq('id', verifyingOrder.id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Botanical Legacy Verified!")
      setShowVerifyModal(false)
      fetchDashboardData()
    }
  }

  const handleFinalizeDeployment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSteward) {
      toast.error("Steward Selection Required")
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('planting_orders')
        .update({ 
          status: 'Completed',
          species: selectedSpecies,
          location: locationContext,
          coordinates: gpsCoordinates
        })
        .eq('id', selectedSteward)

      if (updateError) throw updateError

      toast.promise(fetchDashboardData(), {
        loading: 'Archiving record...',
        success: 'Deployment Finalized!',
        error: 'Error syncing record.'
      })

      setLocationContext('')
      setGpsCoordinates('')
      setSelectedSteward('')
    } catch (error: any) {
      toast.error("Update Failed", { description: error.message })
    }
  }

  const handleGrowthUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder || !growthNote) {
      toast.error("Observations Required")
      return
    }

    try {
      const result = await addGrowthUpdate(selectedOrder.id, growthNote)
      if (result.success) {
        toast.success("Progress Recorded")
        setGrowthNote('')
        setShowUpdateModal(false)
      } else throw new Error(result.error)
    } catch (error: any) {
      toast.error("Update Failed", { description: error.message })
    }
  }

  const handleTestTelegram = async () => {
    const toastId = toast.loading("Sending test Telegram ping...")
    const result = await testTelegramAction()
    if (result.success) {
      toast.success("Telegram Ping Successful!", { id: toastId })
    } else {
      toast.error(`Telegram Error: ${result.error}`, { id: toastId })
    }
  }

  const handleTestEmail = async () => {
    const toastId = toast.loading("Sending test diagnostic email...")
    // In a real app, this would come from env, but we'll try to find it or use a default
    const result = await testEmailAction('mamidipranay07@gmail.com') 
    if (result.success) {
      toast.success("Diagnostic Email Sent!", { id: toastId })
    } else {
      toast.error(`Email Failure: ${result.error}`, { id: toastId })
    }
  }

  const handlePreviewInquiry = async () => {
    const toastId = toast.loading("Dispatching Inquiry Preview...")
    const result = await testInquiryEmailAction('mamidipranay07@gmail.com')
    if (result.success) toast.success("Preview Sent! Check your inbox.", { id: toastId })
    else toast.error(`Preview Failed: ${result.error}`, { id: toastId })
  }

  const handlePreviewGrowth = async () => {
    const toastId = toast.loading("Dispatching Growth Preview...")
    const result = await testGrowthEmailAction('mamidipranay07@gmail.com')
    if (result.success) toast.success("Milestone Design Sent!", { id: toastId })
    else toast.error(`Preview Failed: ${result.error}`, { id: toastId })
  }

  const handlePreviewOrder = async () => {
    const toastId = toast.loading("Dispatching Order Preview...")
    const result = await testOrderConfirmationEmailAction('mamidipranay07@gmail.com')
    if (result.success) toast.success("Order Template Sent!", { id: toastId })
    else toast.error(`Preview Failed: ${result.error}`, { id: toastId })
  }

  const openModal = (order: any) => {
    setSelectedOrder(order)
    setShowUpdateModal(true)
  }

  const handleDeleteOrder = (id: string, name: string) => {
    setOrders(orders.filter(o => o.id !== id))
    toast.error(`Order ${id} removed`)
  }

  const handleQuickAssign = (order: any) => {
    setSelectedSteward(order.id)
    document.getElementById('new-planting-form')?.scrollIntoView({ behavior: 'smooth' });
    toast.info("Form Ready", { description: `Auto-filled for ${order.name}` })
  }

  if (loading) return (
    <div className="min-h-screen bg-[#121410] flex flex-col items-center justify-center gap-6">
      <div className="h-12 w-12 border-4 border-[#b2f432] border-t-transparent rounded-full animate-spin"></div>
      <p className="font-['Noto_Serif'] italic text-[#c2caaf]">Authenticating Stewardship Access...</p>
    </div>
  )

  if (!isAdmin) return null;

  return (
    <div className="bg-[#121410] text-[#e3e3db] min-h-screen font-['Manrope'] selection:bg-[#b2f432] selection:text-[#233600]">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-[#121410]/70 backdrop-blur-xl border-b border-[#424935]/10 flex justify-between items-center px-8 h-20">
        <div className="flex items-center gap-12">
          <Link href="/">
            <h1 className="text-xl font-bold tracking-tighter text-[#e3e3db] font-['Noto_Serif'] cursor-pointer">Stewardship Portal</h1>
          </Link>
          <div className="relative group hidden md:block">
            <MaterialIcon name="person_search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c2caaf]/60" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#343530] border-none rounded-full pl-10 pr-4 py-2 w-80 text-sm focus:ring-1 focus:ring-[#b2f432]/40 transition-all font-['Manrope'] outline-none"
              placeholder="Search Steward or ID..."
              type="text"
            />
          </div>
        </div>
      </header>

      {/* SideNavBar & Main Content Wrapper */}
      <div className="flex pt-20 h-screen">
        {/* SideNavBar */}
        <aside className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-72 bg-[#0d0f0b] flex flex-col py-8 gap-1 hidden md:flex border-r border-[#424935]/10">
          <div className="px-8 mb-8">
            <h2 className="font-['Manrope'] font-bold text-[#c2caaf] text-xs uppercase tracking-widest opacity-60">Field Operations</h2>
            <p className="text-[#b2f432] font-medium text-sm">Active Stewardship</p>
          </div>
          <button onClick={() => setActiveTab('queue')} className={`flex items-center gap-4 px-8 py-4 transition-all ${activeTab === 'queue' ? 'text-[#b2f432] border-r-2 border-[#b2f432] bg-[#b2f432]/5' : 'text-[#e3e3db]/50 hover:bg-[#343530]/30'}`}>
            <MaterialIcon name="list_alt" /> <span>Order Queue</span>
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex items-center gap-4 px-8 py-4 transition-all ${activeTab === 'history' ? 'text-[#b2f432] border-r-2 border-[#b2f432] bg-[#b2f432]/5' : 'text-[#e3e3db]/50 hover:bg-[#343530]/30'}`}>
            <MaterialIcon name="history" /> <span>Planting History</span>
          </button>
          <button onClick={() => setActiveTab('products')} className={`flex items-center gap-4 px-8 py-4 transition-all ${activeTab === 'products' ? 'text-[#b2f432] border-r-2 border-[#b2f432] bg-[#b2f432]/5' : 'text-[#e3e3db]/50 hover:bg-[#343530]/30'}`}>
            <MaterialIcon name="inventory_2" /> <span>Inventory & Plans</span>
          </button>
          <button onClick={() => setActiveTab('diagnostics')} className={`flex items-center gap-4 px-8 py-4 transition-all ${activeTab === 'diagnostics' ? 'text-[#b2f432] border-r-2 border-[#b2f432] bg-[#b2f432]/5' : 'text-[#e3e3db]/50 hover:bg-[#343530]/30'}`}>
            <MaterialIcon name="analytics" /> <span>Diagnostics</span>
          </button>
          <button onClick={() => setActiveTab('inquiries')} className={`flex items-center gap-4 px-8 py-4 transition-all ${activeTab === 'inquiries' ? 'text-[#b2f432] border-r-2 border-[#b2f432] bg-[#b2f432]/5' : 'text-[#e3e3db]/50 hover:bg-[#343530]/30'}`}>
            <MaterialIcon name="mail" /> <span>Inquiries</span>
          </button>
          <div className="mt-auto px-8">
            <button onClick={() => document.getElementById('new-planting-form')?.scrollIntoView({ behavior: 'smooth' })} className="w-full py-4 bg-[#b2f432] text-[#233600] rounded-full font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg">
              <MaterialIcon name="add" className="text-sm" /> New Report
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 ml-0 md:ml-72 overflow-y-auto p-8 space-y-12 no-scrollbar">
          
          {activeTab === 'queue' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-[#1a1c18] p-8 rounded-2xl flex flex-col justify-between border border-[#424935]/10 group overflow-hidden relative">
                  <div className="relative z-10">
                    <p className="text-[#c2caaf] font-medium text-sm tracking-wide uppercase">Global Carbon Sequestration</p>
                    <h3 className="font-['Noto_Serif'] text-5xl font-bold mt-4 leading-tight">42,850 <span className="text-[#b2f432] text-3xl italic">Metric Tons</span></h3>
                  </div>
                  <div className="mt-8 flex gap-4 items-center relative z-10">
                    <button className="text-[#b2f432] font-semibold flex items-center gap-2 hover:translate-x-1 transition-transform">
                      Edit Impact Metrics <MaterialIcon name="arrow_forward" />
                    </button>
                  </div>
                  <div className="absolute -right-12 -bottom-12 opacity-5 scale-150 group-hover:scale-125 transition-transform duration-700">
                    <MaterialIcon name="eco" className="text-[200px]" />
                  </div>
                </div>
                <div className="bg-[#292b26] p-8 rounded-2xl border border-[#424935]/10">
                  <p className="text-[#c2caaf] font-medium text-sm tracking-wide uppercase">Reforestation Goal</p>
                  <div className="mt-8 flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <span className="font-['Noto_Serif'] text-4xl font-bold">{(GLOBAL_GOAL / 1000).toFixed(0)}k</span>
                      <span className="text-[#c2caaf] text-sm">{currentPlantings} / {GLOBAL_GOAL}</span>
                    </div>
                    <div className="w-full bg-[#343530] h-2 rounded-full overflow-hidden mt-4">
                      <div className="bg-[#b2f432] h-full transition-all duration-1000" style={{ width: `${reforestationPercent}%` }}></div>
                    </div>
                    <p className="text-xs text-[#c2caaf]/60 mt-4 leading-relaxed italic">"The best time to plant a tree was 20 years ago."</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <section className="lg:col-span-3 space-y-6">
                  <h2 className="font-['Noto_Serif'] text-2xl font-bold">Deployment Queue</h2>
                  <div className="bg-[#292b26] rounded-2xl border border-[#424935]/10 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-[#424935]/10 text-[#c2caaf] text-[10px] uppercase tracking-widest font-bold">
                            <th className="px-6 py-4">Steward</th>
                            <th className="px-6 py-4">Occasion</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#424935]/10">
                          {filteredOrders.map(order => (
                            <tr key={order.id} className="hover:bg-[#343530]/30 transition-colors">
                              <td className="px-6 py-5">
                                <p className="font-medium text-sm">{order.name}</p>
                                <p className="text-[10px] text-[#c2caaf] uppercase">{order.plan} • {order.quantity}</p>
                              </td>
                              <td className="px-6 py-5 text-xs text-[#b2f432]/80">{order.occasion || 'General'}</td>
                              <td className="px-6 py-5"><span className="text-[9px] bg-[#233600] text-[#b2f432] px-2 py-0.5 rounded uppercase font-bold">{order.status}</span></td>
                              <td className="px-6 py-5 text-right">
                                <button 
                                  onClick={() => { setVerifyingOrder(order); setShowVerifyModal(true); }} 
                                  className="text-[10px] font-bold uppercase px-4 py-2 bg-[#b2f432] text-[#233600] rounded-full hover:scale-105 transition-transform"
                                >
                                  Fulfill
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                <section className="lg:col-span-2 space-y-6">
                  <h2 className="font-['Noto_Serif'] text-2xl font-bold">Upcoming Milestones</h2>
                  <div className="space-y-4">
                    {reminders.map(rem => (
                      <div key={rem.id} className="bg-[#1a1c18] border border-orange-500/10 p-4 rounded-xl flex items-center justify-between gap-4">
                        <div>
                          <p className="font-bold text-sm">{rem.user}</p>
                          <p className="text-[9px] uppercase tracking-widest text-[#c2caaf]">{rem.type}</p>
                        </div>
                        <button className="text-[10px] font-bold px-3 py-1.5 bg-orange-500/10 text-orange-400 rounded-lg">Update</button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <section id="new-planting-form" className="max-w-4xl space-y-6 pt-12">
                <h2 className="font-['Noto_Serif'] text-2xl font-bold">Establish New Legacy</h2>
                <div className="bg-[#1a1c18] p-8 rounded-2xl border border-[#424935]/10">
                  <form className="space-y-6" onSubmit={handleFinalizeDeployment}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#c2caaf]">Steward Selector</label>
                        <select value={selectedSteward} onChange={(e) => setSelectedSteward(e.target.value)} className="w-full bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none" required>
                          <option value="">Select a Steward...</option>
                          {orders.map(o => <option key={o.id} value={o.id}>{o.name} - {o.id}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#c2caaf]">Location</label>
                        <input value={locationContext} onChange={(e) => setLocationContext(e.target.value)} className="w-full bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none" placeholder="e.g. Northern Reserve" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#c2caaf]">GPS Coordinates</label>
                        <div className="flex gap-2">
                          <input 
                            value={gpsCoordinates} 
                            onChange={(e) => setGpsCoordinates(e.target.value)} 
                            className="flex-1 bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none" 
                            placeholder="Awaiting Sync..." 
                            required 
                          />
                          <button 
                            type="button"
                            onClick={() => syncGPS('new')}
                            className="px-4 bg-[#b2f432]/10 text-[#b2f432] rounded-xl border border-[#b2f432]/10 hover:bg-[#b2f432] hover:text-[#233600] transition-all"
                          >
                            <MaterialIcon name="my_location" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#c2caaf]">Species</label>
                        <select value={selectedSpecies} onChange={(e) => setSelectedSpecies(e.target.value)} className="w-full bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none" required>
                          {['Neem', 'Peepal', 'Banyan', 'Gulmohar', 'Teak', 'Bamboo'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="w-full py-4 bg-[#b2f432] text-[#233600] rounded-xl font-bold uppercase text-xs tracking-widest hover:scale-[1.01] transition-all">Establish Botanical Legacy</button>
                  </form>
                </div>
              </section>
            </section>
          )}

          {activeTab === 'history' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <h2 className="font-['Noto_Serif'] text-3xl font-bold">Planting Registry</h2>
              <div className="bg-[#292b26] rounded-2xl border border-[#424935]/10 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#424935]/10 text-[#c2caaf] text-[10px] uppercase tracking-widest font-bold">
                      <th className="px-6 py-4">Tree ID</th>
                      <th className="px-6 py-4">Steward</th>
                      <th className="px-6 py-4">Species</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#424935]/10">
                    {history.map(item => (
                      <tr key={item.id} className="hover:bg-[#343530]/30 transition-colors">
                        <td className="px-6 py-5 font-mono text-xs text-[#b2f432]">{item.id}</td>
                        <td className="px-6 py-5 text-sm">{item.steward}</td>
                        <td className="px-6 py-5 text-sm">{item.species}</td>
                        <td className="px-6 py-5 text-sm text-[#c2caaf]">{item.loc}</td>
                        <td className="px-6 py-5 text-right"><span className="text-[9px] bg-[#233600] text-[#b2f432] px-2 py-0.5 rounded uppercase font-bold">Healthy</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'products' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="font-['Noto_Serif'] text-3xl font-bold">Offerings & Subscriptions</h2>
                <button 
                  onClick={() => setEditingProduct({ name: '', price_in_cents: 0, trees: 1, mode: 'payment', features: [] })}
                  className="bg-[#b2f432] text-[#233600] px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2"
                >
                  <MaterialIcon name="add" /> Add New Plan
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(dbProducts.length > 0 ? dbProducts : [
                  { id: 'sprout', name: 'Sprout', price_display: '₹299', mode: 'payment' },
                  { id: 'forest', name: 'Forest', price_display: '₹999', mode: 'payment' },
                  { id: 'legacy', name: 'Legacy', price_display: '₹4,999', mode: 'payment' },
                  { id: 'monthly-sapling', name: 'Monthly Sapling', price_display: '₹249/mo', mode: 'subscription' },
                ]).map(p => (
                  <div key={p.id} className="bg-[#1a1c18] border border-[#424935]/10 p-6 rounded-2xl group hover:border-[#b2f432]/30 transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <div className="h-10 w-10 bg-[#343530] rounded-xl flex items-center justify-center text-[#b2f432]">
                        <MaterialIcon name={p.mode === 'subscription' ? 'event_repeat' : 'shopping_bag'} />
                      </div>
                      <span className="text-[8px] bg-[#233600] text-[#b2f432] px-2 py-1 rounded-full font-bold uppercase">{p.mode}</span>
                    </div>
                    <h4 className="font-bold text-lg">{p.name}</h4>
                    <p className="text-[#c2caaf] text-sm mt-1">{p.price_display}</p>
                    <div className="mt-8 pt-6 border-t border-[#424935]/10 flex gap-2">
                      <button onClick={() => setEditingProduct(p)} className="flex-1 bg-[#343530] text-[#e3e3db] py-2 rounded-lg text-xs font-bold hover:bg-[#424935]">Edit</button>
                      <button className="h-8 w-8 bg-[#343530] text-red-500/80 rounded-lg flex items-center justify-center hover:bg-red-500/10"><MaterialIcon name="delete" className="text-sm" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {editingProduct && (
            <div className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-6 backdrop-blur-md">
              <div className="bg-[#1a1c18] w-full max-w-lg rounded-3xl border border-[#424935]/20 p-8 space-y-6">
                <h3 className="font-['Noto_Serif'] text-2xl font-bold">Edit Plan Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Plan Name</label>
                      <input 
                        value={editingProduct.name} 
                        onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                        className="w-full bg-[#343530] rounded-xl px-4 py-2 text-sm outline-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Price (INR)</label>
                      <input 
                        type="number"
                        value={editingProduct.price_in_cents / 100} 
                        onChange={(e) => setEditingProduct({...editingProduct, price_in_cents: Number(e.target.value) * 100, price_display: `₹${e.target.value}`})}
                        className="w-full bg-[#343530] rounded-xl px-4 py-2 text-sm outline-none" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Trees Provided</label>
                    <input 
                      type="number"
                      value={editingProduct.trees} 
                      onChange={(e) => setEditingProduct({...editingProduct, trees: Number(e.target.value)})}
                      className="w-full bg-[#343530] rounded-xl px-4 py-2 text-sm outline-none" 
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                   <button 
                    onClick={async () => {
                      const { error } = await supabase.from('site_products').upsert(editingProduct)
                      if (!error) {
                        toast.success("Catalog Updated")
                        setEditingProduct(null)
                        fetchDashboardData()
                      } else {
                        toast.error(error.message)
                      }
                    }}
                    className="flex-1 bg-[#b2f432] text-[#233600] py-3 rounded-xl font-bold"
                  >
                    Save Changes
                  </button>
                  <button onClick={() => setEditingProduct(null)} className="flex-1 bg-white/5 py-3 rounded-xl font-bold">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'diagnostics' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <h2 className="font-['Noto_Serif'] text-3xl font-bold">System Health & Diagnostics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#1a1c18] p-8 rounded-2xl border border-[#424935]/10 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 ring-1 ring-blue-500/20">
                      <MaterialIcon name="send" className="text-2xl" />
                    </div>
                    <div>
                      <h3 className="font-bold">Telegram Notifications</h3>
                      <p className="text-xs text-[#c2caaf]">Operational • Monitoring active orders</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleTestTelegram}
                    className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-500/20"
                  >
                    <MaterialIcon name="bolt" className="text-xs" /> Test Connection
                  </button>
                </div>

                <div className="bg-[#1a1c18] p-8 rounded-2xl border border-[#424935]/10 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <MaterialIcon name="mail" className="text-2xl" />
                    </div>
                    <div>
                      <h3 className="font-bold">Email Service</h3>
                      <p className="text-xs text-[#c2caaf]">Operational • Resend Infrastructure</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleTestEmail}
                    className="w-full py-4 bg-[#b2f432] text-[#233600] rounded-2xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#b2f432]/20"
                  >
                    <MaterialIcon name="mark_email_read" className="text-xs" /> Verify Status
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={handlePreviewInquiry}
                      className="py-3 bg-[#343530] text-[#c2caaf] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all border border-[#424935]/20"
                    >
                      Preview Inquiry
                    </button>
                    <button 
                      onClick={handlePreviewGrowth}
                      className="py-3 bg-[#343530] text-[#c2caaf] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all border border-[#424935]/20"
                    >
                      Preview Growth
                    </button>
                  </div>
                  <button 
                    onClick={handlePreviewOrder}
                    className="w-full py-3 mt-4 bg-[#343530] text-[#c2caaf] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all border border-[#424935]/20"
                  >
                    Preview Order Confirmation
                  </button>
                </div>
              </div>

              <div className="bg-[#1a1c18] p-8 rounded-2xl border border-[#424935]/10">
                <h3 className="font-bold mb-4">Real-time Service Logs</h3>
                <div className="bg-black/40 rounded-xl p-6 font-mono text-[10px] text-[#c2caaf]/60 space-y-2 h-48 overflow-y-auto no-scrollbar">
                  <p className="text-[#b2f432]/60">[2026-04-10 14:23:11] Stripe Webhook: checkout.session.completed received</p>
                  <p>[2026-04-10 14:23:12] Impact Engine: Recoding 5 new trees for steward 'Lyra Chen'</p>
                  <p>[2026-04-10 14:23:12] Telegram: Notification sent to @restoration_bot</p>
                  <p>[2026-04-10 14:23:15] Email: Receipt sent to l***@example.com</p>
                  <p className="text-blue-400/60">[2026-04-10 14:31:05] Diagnostic: Connection test initiated by Admin</p>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'inquiries' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <h2 className="font-['Noto_Serif'] text-3xl font-bold">Steward Inquiries</h2>
              <div className="grid grid-cols-1 gap-6">
                {messages.length > 0 ? messages.map(msg => (
                  <div key={msg.id} className="bg-[#1a1c18] border border-[#424935]/10 p-8 rounded-2xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-[#b2f432]/10 flex items-center justify-center text-[#b2f432]">
                          <MaterialIcon name="person" />
                        </div>
                        <div>
                          <h4 className="font-bold">{msg.name}</h4>
                          <p className="text-xs text-[#c2caaf]">{msg.email} • {new Date(msg.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${msg.status === 'Unread' ? 'bg-orange-500/10 text-orange-400' : 'bg-[#233600] text-[#b2f432]'}`}>
                        {msg.status}
                      </span>
                    </div>
                    <div className="py-4 border-y border-[#424935]/5">
                      <p className="text-[#c2caaf] whitespace-pre-wrap">{msg.message}</p>
                    </div>
                    <div className="flex gap-4">
                      <button className="text-xs font-bold text-[#b2f432] hover:underline">Mark as Replied</button>
                      <button className="text-xs font-bold text-red-400 hover:underline">Archive</button>
                    </div>
                  </div>
                )) : (
                  <div className="bg-[#1a1c18] p-12 rounded-2xl text-center text-[#c2caaf]/40 italic">No inquiries found.</div>
                )}
              </div>
            </section>
          )}

        </main>
      </div>

      {/* Growth Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-[#1a1c18] h-full flex flex-col shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b border-[#424935]/10 flex items-center justify-between">
              <div>
                <h2 className="font-['Noto_Serif'] text-2xl font-bold">Growth Observation</h2>
                <p className="text-[#c2caaf] text-sm mt-1">Recording progress for {selectedOrder?.name}</p>
              </div>
              <button onClick={() => setShowUpdateModal(false)} className="material-symbols-outlined text-[#c2caaf] hover:text-white">close</button>
            </div>
            <div className="p-8 space-y-8 flex-1">
              <form className="space-y-8" onSubmit={handleGrowthUpdate}>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#c2caaf]">Growth Observations</label>
                  <textarea
                    value={growthNote}
                    onChange={(e) => setGrowthNote(e.target.value)}
                    className="w-full bg-[#343530] border-none rounded-2xl px-4 py-4 focus:ring-1 focus:ring-[#b2f432]/40 text-sm min-h-[160px] outline-none"
                    placeholder="e.g. Healthy new growth visible..."
                  />
                </div>
                <button type="submit" className="w-full py-4 bg-[#b2f432] text-[#233600] rounded-full font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                  Save Progress Update <MaterialIcon name="published_with_changes" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Proof Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-[#1a1c18] w-full max-w-2xl rounded-[2.5rem] border border-[#424935]/20 p-10 space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-['Noto_Serif'] text-3xl font-bold">Proof of Stewardship</h3>
                <p className="text-[#c2caaf] text-sm">Fulfilling order for <span className="text-[#b2f432]">{verifyingOrder?.name}</span></p>
              </div>
              <button onClick={() => setShowVerifyModal(false)} className="h-10 w-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <MaterialIcon name="close" />
              </button>
            </div>

            <form onSubmit={handleVerifyPlanting} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#c2caaf]">Planting GPS (Lat, Long)</label>
                  <div className="flex gap-2">
                    <input 
                      required 
                      value={proofData.gps}
                      onChange={(e) => setProofData({...proofData, gps: e.target.value})}
                      placeholder="Latitude, Longitude"
                      className="flex-1 bg-[#292b26] border border-[#424935]/20 rounded-2xl px-5 py-4 text-sm outline-none focus:border-[#b2f432]/50 transition-colors" 
                    />
                    <button 
                      type="button"
                      onClick={() => syncGPS('proof')}
                      className="px-4 bg-[#b2f432]/10 text-[#b2f432] rounded-2xl border border-[#b2f432]/20 hover:bg-[#b2f432] hover:text-[#233600] transition-all"
                      title="Sync Current Location"
                    >
                      <MaterialIcon name="my_location" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#c2caaf]">Botanical Species</label>
                  <select 
                    value={proofData.species}
                    onChange={(e) => setProofData({...proofData, species: e.target.value})}
                    className="w-full bg-[#292b26] border border-[#424935]/20 rounded-2xl px-5 py-4 text-sm outline-none"
                  >
                    {['Neem', 'Peepal', 'Banyan', 'Teak', 'Mango', 'Bamboo', 'Gulmohar'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#c2caaf]">Photo Evidence (URL)</label>
                  <input 
                    required 
                    value={proofData.photo}
                    onChange={(e) => setProofData({...proofData, photo: e.target.value})}
                    placeholder="https://..."
                    className="w-full bg-[#292b26] border border-[#424935]/20 rounded-2xl px-5 py-4 text-sm outline-none focus:border-[#b2f432]/50 transition-colors" 
                  />
                </div>
                <div className="space-y-4 pt-4">
                  <button type="submit" className="w-full bg-[#b2f432] text-[#233600] py-5 rounded-2xl font-bold uppercase text-xs tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(178,244,50,0.3)] hover:scale-[1.02] active:scale-95 transition-all">
                    Establish Legacy
                  </button>
                </div>
              </div>
            </form>
            
            <p className="text-[9px] text-[#c2caaf]/40 text-center uppercase tracking-widest">Confirmation will be sent to the steward instantly</p>
          </div>
        </div>
      )}
    </div>
  )
}
