'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

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
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue')
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

  // Mock Data for the demo
  const [orders, setOrders] = useState([
    { id: 'AM-450', name: 'Aris Thorne', initials: 'AT', date: 'Oct 24, 2026', quantity: '1 Tree', status: 'Completed', color: 'bg-primary/10 text-primary', occasion: 'Birthday', plan: 'Sprout (One-Time)' },
    { id: 'LC-1200', name: 'Lyra Chen', initials: 'LC', date: 'Oct 25, 2026', quantity: '5 Trees', status: 'Pending', color: 'bg-secondary-container/20 text-secondary', occasion: 'Memorial', plan: 'Forest (One-Time)' },
    { id: 'EJ-85', name: 'Elias Jaxon', initials: 'EJ', date: 'Oct 25, 2026', quantity: '25 Trees', status: 'Pending', color: 'bg-secondary-container/20 text-secondary', occasion: 'Corporate CSR', plan: 'Annual Forest (Subscription)' },
  ])

  // Dynamic Global Metrics
  const GLOBAL_GOAL = 1000
  // Calculate current plantings from the active orders
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
      
      // Admin Security Check
      const user = session?.user
      const isAuthorizedAdmin = user?.email === 'mamidipranay07@gmail.com' || user?.user_metadata?.role === 'admin'
      
      if (!session || !isAuthorizedAdmin) {
        toast.error("Unauthorized Access", { description: "You do not have permission to view the stewardship portal." })
        router.push('/login')
        return
      }

      setIsAdmin(true)
      
      const savedOrders = localStorage.getItem('arboretum_admin_orders')
      const savedHistory = localStorage.getItem('arboretum_admin_history')
      
      if (savedOrders) {
        try { setOrders(JSON.parse(savedOrders)) } catch (e) { console.error(e) }
      }
      if (savedHistory) {
        try { setHistory(JSON.parse(savedHistory)) } catch (e) { console.error(e) }
      }
      
      setLoading(false)
    }

    checkAdmin()
  }, [router])

  // Sync state to LocalStorage whenever it changes
  useEffect(() => {
    if (!loading && isAdmin) {
      localStorage.setItem('arboretum_admin_orders', JSON.stringify(orders))
      localStorage.setItem('arboretum_admin_history', JSON.stringify(history))
    }
  }, [orders, history, loading, isAdmin])

  const handleFinalizeDeployment = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedSteward) {
      toast.error("Steward Selection Required", { description: "You must select a user to assign this tree to." })
      return
    }

    const targetOrder = orders.find(o => o.id === selectedSteward)
    
    // Move from Queue to History
    const newHistoryItem = {
      id: `TR-${Math.floor(Math.random() * 1000)}`,
      steward: targetOrder?.name || 'Unknown',
      species: selectedSpecies,
      date: new Date().toLocaleDateString(),
      loc: locationContext,
      coords: gpsCoordinates,
      status: 'Healthy'
    }

    setHistory([newHistoryItem, ...history])
    setOrders(orders.filter(o => o.id !== selectedSteward))

    // Reset Form
    setLocationContext('')
    setGpsCoordinates('')
    setSelectedSteward('')

    toast.success("Deployment Finalized!", {
      description: `Updates sent to ${targetOrder?.name}'s dashboard and email.`
    })
    
    // Simulate Email Trigger
    console.log(`SECURE EMAIL SERVICE: Sending update to ${targetOrder?.name}...`)
  }

  const handleGrowthUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Progress Recorded", {
      description: "Timeline updated on user dashboard."
    })
    setShowUpdateModal(false)
  }

  const openModal = (order: any) => {
    setSelectedOrder(order)
    setShowUpdateModal(true)
  }

  const handleDeleteOrder = (id: string, name: string) => {
    setOrders(orders.filter(o => o.id !== id))
    toast.error(`Order ${id} removed`, {
      description: `Removed ${name} from deployment queue.`
    })
  }

  const handleQuickAssign = (order: any) => {
    setSelectedSteward(order.id)
    const formElement = document.getElementById('new-planting-form');
    formElement?.scrollIntoView({ behavior: 'smooth' });
    toast.info("Form Ready", { description: `Details for ${order.name} have been auto-filled.` })
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
        <nav className="flex items-center gap-8">
          {/* Admin Profile Removed */}
        </nav>
      </header>

      {/* SideNavBar & Main Content Wrapper */}
      <div className="flex pt-20 h-screen">
        {/* SideNavBar */}
        <aside className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-72 bg-[#0d0f0b] flex flex-col py-8 gap-4 hidden md:flex border-r border-[#424935]/10">
          <div className="px-8 mb-8">
            <h2 className="font-['Manrope'] font-bold text-[#c2caaf] text-xs uppercase tracking-widest opacity-60">Field Operations</h2>
            <p className="text-[#b2f432] font-medium text-sm">Active Stewardship</p>
          </div>
          <nav className="flex flex-col gap-1">
            <button 
              onClick={() => setActiveTab('queue')}
              className={`flex items-center gap-4 px-8 py-4 transition-all font-['Manrope'] font-medium ${activeTab === 'queue' ? 'text-[#b2f432] border-r-2 border-[#b2f432] bg-[#b2f432]/5' : 'text-[#e3e3db]/50 hover:bg-[#343530]/30 hover:text-[#e3e3db]'}`}
            >
              <MaterialIcon name="list_alt" />
              <span>Order Queue</span>
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-4 px-8 py-4 transition-all font-['Manrope'] font-medium ${activeTab === 'history' ? 'text-[#b2f432] border-r-2 border-[#b2f432] bg-[#b2f432]/5' : 'text-[#e3e3db]/50 hover:bg-[#343530]/30 hover:text-[#e3e3db]'}`}
            >
              <MaterialIcon name="history" />
              <span>Planting History</span>
            </button>
          </nav>
          <div className="mt-auto px-8">
            <button 
              onClick={() => {
                const formElement = document.getElementById('new-planting-form');
                formElement?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full py-4 bg-[#b2f432] text-[#233600] rounded-full font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-[0_20px_40px_-10px_rgba(178,244,50,0.2)]"
            >
              <MaterialIcon name="add" className="text-sm" />
              New Report
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 ml-0 md:ml-72 overflow-y-auto p-8 space-y-12 no-scrollbar">
          {/* Global Impact Stats */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-[#1a1c18] p-8 rounded-2xl flex flex-col justify-between group overflow-hidden relative border border-[#424935]/10">
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
                <MaterialIcon name="eco" className="text-[200px]" style={{ fontVariationSettings: "'FILL' 1" }} />
              </div>
            </div>
            <div className="bg-[#292b26] p-8 rounded-2xl border border-[#424935]/10">
              <p className="text-[#c2caaf] font-medium text-sm tracking-wide uppercase">Reforestation Goal</p>
              <div className="mt-8 flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="font-['Noto_Serif'] text-4xl font-bold">{(GLOBAL_GOAL / 1000).toFixed(0)}k</span>
                  <span className="text-[#c2caaf] text-sm">{currentPlantings} / {GLOBAL_GOAL} ({reforestationPercent.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-[#343530] h-2 rounded-full overflow-hidden mt-4">
                  <div
                    className="bg-[#b2f432] h-full transition-all duration-1000"
                    style={{ width: `${reforestationPercent}%` }}
                  ></div>
                </div>
                <p className="text-xs text-[#c2caaf]/60 mt-4 leading-relaxed italic">"The best time to plant a tree was 20 years ago. The second best time is now."</p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            {/* Order Queue */}
            <section className="xl:col-span-3 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-['Noto_Serif'] text-2xl font-bold">
                  {activeTab === 'queue' ? 'Deployment Queue' : 'Planting History'}
                </h2>
                <div className="flex bg-[#343530] p-1 rounded-lg">
                  <button 
                    onClick={() => setActiveTab('queue')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'queue' ? 'bg-[#b2f432] text-[#233600]' : 'text-[#c2caaf] hover:text-white'}`}
                  >
                    Active
                  </button>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'history' ? 'bg-[#b2f432] text-[#233600]' : 'text-[#c2caaf] hover:text-white'}`}
                  >
                    Archived
                  </button>
                </div>
              </div>
              <div className="bg-[#292b26] rounded-2xl border border-[#424935]/10 overflow-hidden">
                <div className="overflow-x-auto">
                  {activeTab === 'queue' ? (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-[#424935]/10 text-[#c2caaf] text-[10px] uppercase tracking-widest font-bold">
                          <th className="px-6 py-4">Steward</th>
                          <th className="px-6 py-4">Order Date</th>
                          <th className="px-6 py-4">Volume</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#424935]/10">
                        {filteredOrders.map((order) => (
                          <tr key={order.id} className="group hover:bg-[#343530]/30 transition-colors">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-[#424935]/30 flex items-center justify-center text-[#b2f432] text-xs font-bold">{order.initials}</div>
                                <div>
                                  <p className="font-medium leading-none">{order.name}</p>
                                  <p className="text-[9px] uppercase tracking-tighter text-[#c2caaf] mt-1">{order.plan}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-sm text-[#c2caaf]">{order.date}</td>
                            <td className="px-6 py-5 font-semibold text-[#b2f432]">{order.quantity}</td>
                            <td className="px-6 py-5">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.color}`}>{order.status}</span>
                            </td>
                            <td className="px-6 py-5 text-right flex justify-end gap-3 items-center">
                              <button 
                                onClick={() => handleQuickAssign(order)}
                                className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 bg-[#b2f432]/10 text-[#b2f432] hover:bg-[#b2f432] hover:text-[#233600] rounded transition-all"
                              >
                                Assign & Plant
                              </button>
                              <button 
                                onClick={() => openModal(order)}
                                className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 border border-[#c2caaf]/40 text-[#c2caaf] hover:bg-[#c2caaf] hover:text-[#233600] rounded transition-all"
                              >
                                Note Growth
                              </button>
                              <button 
                                onClick={() => handleDeleteOrder(order.id, order.name)}
                                className="material-symbols-outlined text-[#c2caaf] hover:text-red-400 transition-colors"
                              >
                                delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-left">
                      <thead>
                         <tr className="border-b border-[#424935]/10 text-[#c2caaf] text-[10px] uppercase tracking-widest font-bold">
                          <th className="px-6 py-4">Tree ID</th>
                          <th className="px-6 py-4">Species</th>
                          <th className="px-6 py-4">Planting Date</th>
                          <th className="px-6 py-4">Location</th>
                          <th className="px-6 py-4 text-right">View Proof</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#424935]/10">
                        {history.length > 0 ? history.map((item) => (
                          <tr key={item.id} className="group hover:bg-[#343530]/30 transition-colors">
                            <td className="px-6 py-5 font-mono text-xs text-[#b2f432]">{item.id}</td>
                            <td className="px-6 py-5">{item.species}</td>
                            <td className="px-6 py-5 text-sm text-[#c2caaf]">{item.date}</td>
                            <td className="px-6 py-5 text-sm text-[#c2caaf]">{item.loc}</td>
                            <td className="px-6 py-5 text-right flex justify-end gap-3">
                              <button className="material-symbols-outlined text-[#c2caaf] hover:text-[#b2f432] transition-colors">visibility</button>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={5} className="px-6 py-10 text-center text-[#c2caaf]/40">No historical records found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </section>

            {/* Maintenance Reminders */}
            <section className="xl:col-span-2 space-y-6">
               <div className="flex items-center justify-between">
                <h2 className="font-['Noto_Serif'] text-2xl font-bold">Upcoming Milestones</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {reminders.map(rem => (
                   <div key={rem.id} className="bg-[#1a1c18] border border-[#f4b232]/20 p-5 rounded-2xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 group hover:border-[#f4b232]/40 transition-all">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-12 w-12 shrink-0 rounded-xl bg-[#f4b232]/10 flex items-center justify-center text-[#f4b232]">
                           <span className="material-symbols-outlined">schedule</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#e3e3db] truncate">{rem.user}</p>
                          <p className="text-[10px] uppercase tracking-widest text-[#c2caaf] truncate">{rem.type} • {rem.species}</p>
                        </div>
                      </div>
                      <button className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-4 py-2 bg-[#f4b232]/10 text-[#f4b232] rounded-lg hover:bg-[#f4b232] hover:text-[#233600] transition-all">
                        Record Progress
                      </button>
                   </div>
                ))}
              </div>
            </section>

            {/* Record New Planting Form */}
            <section id="new-planting-form" className="xl:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-['Noto_Serif'] text-2xl font-bold">Record New Planting</h2>
              </div>
              <div className="bg-[#1a1c18] p-8 rounded-2xl space-y-8 border border-[#424935]/10 shadow-xl">
                <div className="flex justify-between items-center px-4">
                  <div className="h-1 flex-1 bg-[#b2f432] rounded-full"></div>
                  <div className="h-1 flex-1 bg-[#343530] mx-2 rounded-full"></div>
                  <div className="h-1 flex-1 bg-[#343530] rounded-full"></div>
                </div>
                <form className="space-y-6" onSubmit={handleFinalizeDeployment}>
                  <div className="grid grid-cols-1 gap-6">
                    {/* Steward Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#c2caaf]">Assign to Steward</label>
                      <select 
                        value={selectedSteward}
                        onChange={(e) => setSelectedSteward(e.target.value)}
                        className="w-full bg-[#343530] border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#b2f432]/40 text-sm outline-none appearance-none cursor-pointer"
                        required
                      >
                        <option value="" disabled>Select a Steward...</option>
                        {orders.map(order => (
                          <option key={order.id} value={order.id}>
                            {order.name} ({order.id})
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-[#c2caaf]/40 italic">Only stewards with pending orders appear here.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#c2caaf]">Location Context</label>
                      <input
                        value={locationContext}
                        onChange={(e) => setLocationContext(e.target.value)}
                        className="w-full bg-[#343530] border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#b2f432]/40 text-sm outline-none"
                        placeholder="e.g. Northern Ridge Reserve"
                        type="text"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <input
                          value={gpsCoordinates}
                          onChange={(e) => setGpsCoordinates(e.target.value)}
                          className="w-full bg-[#343530] border-none rounded-xl pl-4 pr-10 py-3 text-sm focus:ring-1 focus:ring-[#b2f432]/40 outline-none"
                          placeholder="GPS Coordinates"
                          type="text"
                          required
                        />
                        <MaterialIcon name="location_on" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b2f432] text-xl" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setGpsCoordinates('13.0827, 77.5877')}
                        className="bg-[#343530] hover:bg-[#424935] px-4 rounded-xl transition-colors"
                      >
                        <MaterialIcon name="my_location" className="text-[#c2caaf]" />
                      </button>
                    </div>

                    {/* Species Select Dropdown */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#c2caaf]">Species Identification</label>
                      <div className="relative">
                        <select 
                          value={selectedSpecies}
                          onChange={(e) => setSelectedSpecies(e.target.value)}
                          className="w-full bg-[#343530] border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#b2f432]/40 text-sm outline-none appearance-none cursor-pointer"
                          required
                        >
                          {['Neem', 'Peepal', 'Banyan', 'Gulmohar', 'Teak', 'Bamboo', 'Mango', 'Jamun', 'Bael', 'Karanj'].map((name) => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                        <MaterialIcon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c2caaf] pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#c2caaf]">Visual Evidence</label>
                      <div className="border-2 border-dashed border-[#424935]/30 rounded-2xl p-8 text-center flex flex-col items-center gap-3 hover:border-[#b2f432]/40 hover:bg-[#b2f432]/5 transition-all cursor-pointer">
                        <MaterialIcon name="add_a_photo" className="text-4xl text-[#c2caaf]/40" />
                        <div className="text-sm">
                          <p className="font-bold">Drop site photography here</p>
                          <p className="text-[#c2caaf]/60 text-xs">or click to browse local files</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="w-full py-4 bg-[#b2f432] text-[#233600] rounded-full font-bold flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform shadow-lg">
                    Finalize Deployment Record
                    <MaterialIcon name="check_circle" />
                  </button>
                </form>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Growth Update Side Panel / Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex justify-end transition-opacity duration-300">
          <div className="w-full max-w-lg bg-[#1a1c18] h-full flex flex-col shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b border-[#424935]/10 flex items-center justify-between">
              <div>
                <h2 className="font-['Noto_Serif'] text-2xl font-bold">Client Order Details</h2>
                <p className="text-[#c2caaf] text-sm mt-1">Stewardship profile for {selectedOrder?.name} ({selectedOrder?.id})</p>
              </div>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="material-symbols-outlined text-[#c2caaf] hover:text-white transition-colors"
              >
                close
              </button>
            </div>
            <div className="p-8 space-y-8 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#343530]/50 p-4 rounded-xl border border-[#424935]/20">
                  <p className="text-[10px] uppercase font-bold text-[#c2caaf] mb-1">Occasion</p>
                  <p className="font-['Noto_Serif'] text-lg text-[#b2f432]">{selectedOrder?.occasion || 'Standard Planting'}</p>
                </div>
                <div className="bg-[#343530]/50 p-4 rounded-xl border border-[#424935]/20">
                  <p className="text-[10px] uppercase font-bold text-[#c2caaf] mb-1">Plan Type</p>
                  <p className="font-['Noto_Serif'] text-lg text-[#e3e3db]">{selectedOrder?.plan || 'General Contribution'}</p>
                </div>
              </div>

              <form className="space-y-8" onSubmit={handleGrowthUpdate}>
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-[#c2caaf]">Current Growth Photo</label>
                <div className="border-2 border-dashed border-[#424935]/30 rounded-2xl p-12 text-center flex flex-col items-center gap-4 hover:border-[#b2f432]/40 hover:bg-[#b2f432]/5 transition-all cursor-pointer group">
                  <div className="h-16 w-16 rounded-full bg-[#343530] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MaterialIcon name="add_a_photo" className="text-3xl text-[#b2f432]" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-[#e3e3db]">Upload new visual record</p>
                    <p className="text-[#c2caaf]/60 text-xs italic">Capture current size and health status</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#c2caaf]">Growth Observations</label>
                <textarea
                  className="w-full bg-[#343530] border-none rounded-2xl px-4 py-4 focus:ring-1 focus:ring-[#b2f432]/40 text-sm min-h-[120px] placeholder:text-[#c2caaf]/30 outline-none"
                  placeholder="e.g. Grown 5 inches! Healthy new needles visible..."
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#c2caaf]">Update Date</label>
                <input
                  className="w-full bg-[#343530] border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#b2f432]/40 text-sm outline-none"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
                <p className="text-[10px] text-[#c2caaf]/40 italic">Date auto-selected to current local time</p>
              </div>

              <div className="pt-8 mt-auto border-t border-[#424935]/10">
                <button
                  type="submit"
                  className="w-full py-4 bg-[#b2f432] text-[#233600] rounded-full font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-[0_20px_40px_-10px_rgba(178,244,50,0.2)]"
                >
                  Save Growth Update
                  <MaterialIcon name="published_with_changes" className="text-lg" />
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
