'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { addGrowthUpdate } from '@/app/actions/impact'
import { testTelegramAction, testEmailAction, testInquiryEmailAction, testGrowthEmailAction, testOrderConfirmationEmailAction } from '@/app/actions/diagnostics'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts'

// Material Symbols mapping for consistent look  with their design
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
  const [activeTab, setActiveTab] = useState<'queue' | 'history' | 'users' | 'stories' | 'events' | 'testimonials' | 'faqs' | 'media' | 'settings' | 'products' | 'diagnostics' | 'inquiries'>('queue')
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
  const [growthDate, setGrowthDate] = useState(new Date().toISOString().split('T')[0])
  const [growthImage, setGrowthImage] = useState<string | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [usersDirectory, setUsersDirectory] = useState<any[]>([])
  const [dbProducts, setDbProducts] = useState<any[]>([])
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null)
  const [stories, setStories] = useState<any[]>([])
  const [editingStory, setEditingStory] = useState<any>(null)
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null)
  const [eventsData, setEventsData] = useState<any[]>([])
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [siteConfig, setSiteConfig] = useState<Record<string, string>>({
    'hero_headline': 'Plant a Tree, Create a Legacy.',
    'global_goal': '500,000',
    'contact_email': 'hello@greenlegacy.in',
    'contact_phone': '+91 98765 43210',
    'global_carbon_sequestration': '42,850'
  })
  const [faqsData, setFaqsData] = useState<any[]>([])
  const [editingFaq, setEditingFaq] = useState<any>(null)
  const [mediaData, setMediaData] = useState<any[]>([])
  const [editingMedia, setEditingMedia] = useState<any>(null)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [verifyingOrder, setVerifyingOrder] = useState<any>(null)
  const [proofData, setProofData] = useState({ gps: '', species: 'Neem', photo: '', date: new Date().toISOString().split('T')[0] })
  const [chartData, setChartData] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  const filteredUsers = usersDirectory.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
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
      // 1. Fetch Orders (Active Queue: Pending + Planted)
      const { data: ordersData, error: ordersError } = await supabase
        .from('planting_orders')
        .select('id, created_at, steward_name, trees, status, occasion, plan_name, amount_paid')
        .in('status', ['Pending', 'Planted'])
        .order('created_at', { ascending: false })

      const formattedOrders = (ordersData || []).map(o => {
        const name = o.steward_name || 'Anonymous Steward';
        return {
          id: String(o.id),
          name: name,
          initials: name.split(' ').filter(Boolean).map((n: string) => n[0]).join('').toUpperCase(),
          date: new Date(o.created_at).toLocaleDateString(),
          quantity: `${o.trees} Tree${o.trees > 1 ? 's' : ''}`,
          status: o.status,
          color: o.status === 'Planted' ? 'bg-[#b2f432]/20 text-[#b2f432]' : 'bg-secondary-container/20 text-secondary',
          occasion: o.occasion,
          plan: o.plan_name
        }
      })

      setOrders(formattedOrders)

      // 2. Fetch History (Finalized Queue: Completed)
      const { data: historyData, error: historyError } = await supabase
        .from('planting_orders')
        .select('id, created_at, steward_name, species, location')
        .eq('status', 'Completed')
        .order('created_at', { ascending: false })

      const dummyHistory = [
        { id: 'TR-1001', steward: 'Elias Jaxon', species: 'Banyan', date: 'Oct 20, 2026', loc: 'Western Ghats', status: 'Healthy' },
        { id: 'TR-1002', steward: 'Sarah Kent', species: 'Neem', date: 'Oct 22, 2026', loc: 'Northern Reserve', status: 'Healthy' }
      ]

      const formattedHistory = (historyData || []).map(o => ({
        id: `TR-${String(o.id).slice(0, 4)}`,
        steward: o.steward_name || 'Anonymous',
        species: o.species || 'Neem',
        date: new Date(o.created_at).toLocaleDateString(),
        loc: o.location || 'Northern Reserve',
        status: 'Healthy'
      }))

      setHistory([...formattedHistory, ...dummyHistory])

      // 3. Fetch Site Products
      const { data: pData } = await supabase
        .from('site_products')
        .select('id, name, description, price_in_cents, price_display, trees, mode, features, popular, badge, is_csr')
        .order('id', { ascending: true })
      if (pData) setDbProducts(pData)

      // 4. Fetch Contact Messages
      const { data: mData, error: mError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
      if (mError) {
        console.error('ADMIN: Failed to fetch contact_messages:', mError)
      }
      setMessages(mData || [])

      // 5. Build Users Directory
      const { data: allOrdersData } = await supabase.from('planting_orders').select('id, created_at, steward_name, trees, amount_paid').order('created_at', { ascending: true })
      if (allOrdersData) {
        const userMap = new Map()
        // Add dummy data first for visuals if db is empty or sparse
        userMap.set('Aris Thorne', { name: 'Aris Thorne', trees: 1, amount: 299, firstPlanted: '2026-10-24T00:00:00.000Z', lastPlanted: '2026-10-24T00:00:00.000Z' })
        userMap.set('Lyra Chen', { name: 'Lyra Chen', trees: 5, amount: 999, firstPlanted: '2026-10-25T00:00:00.000Z', lastPlanted: '2026-10-25T00:00:00.000Z' })
        userMap.set('Elias Jaxon', { name: 'Elias Jaxon', trees: 2, amount: 598, firstPlanted: '2026-10-20T00:00:00.000Z', lastPlanted: '2026-10-20T00:00:00.000Z' })
        
        allOrdersData.forEach((po: any) => {
          const steward = po.steward_name || 'Anonymous'
          const amount = po.amount_paid != null ? po.amount_paid : ((po.trees || 1) * 299)
          const isCsr = po.is_csr === true || po.trees >= 50
          const existing = userMap.get(steward) || { name: steward, trees: 0, amount: 0, isCsr: false, firstPlanted: po.created_at, lastPlanted: po.created_at }
          existing.trees += (po.trees || 1)
          existing.amount += amount
          if (isCsr) existing.isCsr = true
          if (new Date(po.created_at) < new Date(existing.firstPlanted)) existing.firstPlanted = po.created_at
          if (new Date(po.created_at) > new Date(existing.lastPlanted)) existing.lastPlanted = po.created_at
          userMap.set(steward, existing)
        })
        const directoryArray = Array.from(userMap.values())
        directoryArray.sort((a,b) => b.trees - a.trees)
        setUsersDirectory(directoryArray)
      }

      // 6. Fetch Impact Stories
      const { data: storiesData, error: storiesError } = await supabase.from('impact_stories').select('*').order('created_at', { ascending: false })
      if (!storiesError && storiesData) {
        setStories(storiesData)
      } else {
        console.warn("CMS table 'impact_stories' might not be instantiated yet.");
      }

      // 7. Fetch Testimonials
      const { data: testData, error: testError } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false })
      if (!testError && testData) {
        setTestimonials(testData)
      } else {
        console.warn("CMS table 'testimonials' might not be instantiated yet.");
      }

      // 8. Fetch Events & Config
      const { data: eventsRes } = await supabase.from('volunteer_events').select('*').order('created_at', { ascending: false })
      if (eventsRes) setEventsData(eventsRes)

      const { data: configRes } = await supabase.from('site_config').select('*')
      if (configRes && configRes.length > 0) {
        const configMap: Record<string, string> = {}
        configRes.forEach(c => configMap[c.key] = c.value)
        setSiteConfig(configMap)
      }

      // 9. Fetch FAQs
      const { data: faqsRes } = await supabase.from('faq_manager').select('*').order('display_order', { ascending: true })
      if (faqsRes) setFaqsData(faqsRes)

      // 10. Fetch Media
      const { data: mediaRes } = await supabase.from('media_assets').select('*').order('created_at', { ascending: false })
      if (mediaRes) setMediaData(mediaRes)

      // 10.5 Fetch Products
      const { data: prodsData } = await supabase.from('site_products').select('*').order('price_in_cents', { ascending: true })
      if (prodsData) setDbProducts(prodsData)

      // 11. Generate Analytics Data
      const { data: allOrdersForCharts } = await supabase
        .from('planting_orders')
        .select('created_at, trees, amount_paid')
        .order('created_at', { ascending: true })

      if (allOrdersForCharts) {
        const last30Days = [...Array(30)].map((_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (29 - i))
          return d.toISOString().split('T')[0]
        })

        const dailyCounts: Record<string, number> = {}
        const dailyRevenue: Record<string, number> = {}
        
        last30Days.forEach(day => {
          dailyCounts[day] = 0
          dailyRevenue[day] = 0
        })

        allOrdersForCharts.forEach(order => {
          const day = new Date(order.created_at).toISOString().split('T')[0]
          if (dailyCounts[day] !== undefined) {
             dailyCounts[day] += (order.trees || 1)
             dailyRevenue[day] += (order.amount_paid || (order.trees * 299))
          }
        })

        setChartData(last30Days.map(day => ({ name: day.split('-').slice(1).join('/'), trees: dailyCounts[day] })))
        setRevenueData(last30Days.map(day => ({ name: day.split('-').slice(1).join('/'), amount: dailyRevenue[day] })))
      }

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
        else setProofData({ ...proofData, gps: coords })
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
      <header className="fixed top-0 w-full z-50 bg-[#121410]/70 backdrop-blur-xl border-b border-[#424935]/10 flex justify-between items-center px-4 md:px-8 h-16 md:h-20">
        <div className="flex items-center gap-3 md:gap-12">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden h-9 w-9 flex items-center justify-center text-[#b2f432] bg-[#b2f432]/10 rounded-xl"
          >
            <MaterialIcon name={sidebarOpen ? 'close' : 'menu'} />
          </button>
          <Link href="/">
            <h1 className="text-base md:text-xl font-bold tracking-tighter text-[#e3e3db] font-['Noto_Serif'] cursor-pointer">Stewardship Portal</h1>
          </Link>
          <div className="relative group hidden lg:block">
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
      <div className="flex pt-16 md:pt-20 min-h-screen">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden"
          />
        )}
        {/* SideNavBar */}
        <aside className={`fixed left-0 top-16 md:top-20 h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] w-72 bg-[#0d0f0b] flex flex-col py-6 gap-1 border-r border-[#424935]/10 overflow-y-auto custom-scrollbar z-40 transition-transform duration-300 md:translate-x-0 ${ sidebarOpen ? 'translate-x-0' : '-translate-x-full' }`}>
          <div className="px-8 mb-4 shrink-0">
            <h2 className="font-['Manrope'] font-bold text-[#c2caaf] text-xs uppercase tracking-widest opacity-60">Field Operations</h2>
            <p className="text-[#b2f432] font-medium text-sm">Active Stewardship Dashboard</p>
          </div>
          <nav className="flex-1 flex flex-col gap-1 w-full pb-8">
            <button onClick={() => setActiveTab('inquiries')} className={`relative flex items-center justify-between px-8 py-4 transition-all w-full text-left ${activeTab === 'inquiries' ? 'text-[#b2f432] border-r-2 border-[#b2f432] bg-[#b2f432]/5' : 'text-[#e3e3db]/50 hover:bg-[#343530]/30'}`}>
              <div className="flex items-center gap-4">
                <MaterialIcon name="mail" /> <span className="font-bold">Inquiries</span>
              </div>
              {messages.filter(m => m.status.toLowerCase() === 'unread').length > 0 && (
                <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                  {messages.filter(m => m.status.toLowerCase() === 'unread').length} New
                </span>
              )}
            </button>
            <button onClick={() => setActiveTab('media')} className={`flex items-center gap-4 px-8 py-4 transition-all w-full text-left ${activeTab === 'media' ? 'text-[#b2f432] border-r-2 border-[#b2f432] bg-[#b2f432]/5' : 'text-[#e3e3db]/50 hover:bg-[#343530]/30'}`}>
              <MaterialIcon name="perm_media" /> <span>Media Library</span>
            </button>
            <button onClick={() => setActiveTab('queue')} className={`flex items-center gap-4 px-8 py-4 transition-all w-full text-left ${activeTab === 'queue' ? 'text-[#b2f432] border-r-2 border-[#b2f432] bg-[#b2f432]/5' : 'text-[#e3e3db]/50 hover:bg-[#343530]/30'}`}>
              <MaterialIcon name="list_alt" /> <span>Order Queue</span>
            </button>
            <button onClick={() => setActiveTab('history')} className={`flex items-center gap-4 px-8 py-4 transition-all w-full text-left ${activeTab === 'history' ? 'text-[#b2f432] border-r-2 border-[#b2f432] bg-[#b2f432]/5' : 'text-[#e3e3db]/50 hover:bg-[#343530]/30'}`}>
              <MaterialIcon name="history" /> <span>Planting History</span>
            </button>
            <button onClick={() => setActiveTab('users')} className={`flex items-center gap-4 px-8 py-4 transition-all w-full text-left ${activeTab === 'users' ? 'text-[#b2f432] border-r-2 border-[#b2f432] bg-[#b2f432]/5' : 'text-[#e3e3db]/50 hover:bg-[#343530]/30'}`}>
              <MaterialIcon name="group" /> <span>Steward Directory</span>
            </button>
            <button onClick={() => setActiveTab('stories')} className={`flex items-center gap-4 px-8 py-4 transition-all w-full text-left ${activeTab === 'stories' ? 'text-[#b2f432] border-r-2 border-[#b2f432] bg-[#b2f432]/5' : 'text-[#e3e3db]/50 hover:bg-[#343530]/30'}`}>
              <MaterialIcon name="menu_book" /> <span>Impact Stories</span>
            </button>
            <button onClick={() => setActiveTab('events')} className={`flex items-center gap-4 px-8 py-4 transition-all w-full text-left ${activeTab === 'events' ? 'text-[#b2f432] border-r-2 border-[#b2f432] bg-[#b2f432]/5' : 'text-[#e3e3db]/50 hover:bg-[#343530]/30'}`}>
              <MaterialIcon name="event" /> <span>Campaigns & Events</span>
            </button>
            <button onClick={() => setActiveTab('testimonials')} className={`flex items-center gap-4 px-8 py-4 transition-all w-full text-left ${activeTab === 'testimonials' ? 'text-[#b2f432] border-r-2 border-[#b2f432] bg-[#b2f432]/5' : 'text-[#e3e3db]/50 hover:bg-[#343530]/30'}`}>
              <MaterialIcon name="chat_bubble" /> <span>Testimonials</span>
            </button>
            <button onClick={() => setActiveTab('faqs')} className={`flex items-center gap-4 px-8 py-4 transition-all w-full text-left ${activeTab === 'faqs' ? 'text-[#b2f432] border-r-2 border-[#b2f432] bg-[#b2f432]/5' : 'text-[#e3e3db]/50 hover:bg-[#343530]/30'}`}>
              <MaterialIcon name="help" /> <span>Help & FAQs</span>
            </button>
            <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-4 px-8 py-4 transition-all w-full text-left ${activeTab === 'settings' ? 'text-[#b2f432] border-r-2 border-[#b2f432] bg-[#b2f432]/5' : 'text-[#e3e3db]/50 hover:bg-[#343530]/30'}`}>
              <MaterialIcon name="settings" /> <span>Global Settings</span>
            </button>
            <button onClick={() => setActiveTab('products')} className={`flex items-center gap-4 px-8 py-4 transition-all w-full text-left ${activeTab === 'products' ? 'text-[#b2f432] border-r-2 border-[#b2f432] bg-[#b2f432]/5' : 'text-[#e3e3db]/50 hover:bg-[#343530]/30'}`}>
              <MaterialIcon name="inventory_2" /> <span>Inventory & Plans</span>
            </button>
            <button onClick={() => setActiveTab('diagnostics')} className={`flex items-center gap-4 px-8 py-4 transition-all w-full text-left ${activeTab === 'diagnostics' ? 'text-[#b2f432] border-r-2 border-[#b2f432] bg-[#b2f432]/5' : 'text-[#e3e3db]/50 hover:bg-[#343530]/30'}`}>
              <MaterialIcon name="analytics" /> <span>Diagnostics</span>
            </button>
          </nav>
          <div className="px-8 py-4 border-t border-[#424935]/10 shrink-0 bg-[#0d0f0b]">
            <button onClick={() => document.getElementById('new-planting-form')?.scrollIntoView({ behavior: 'smooth' })} className="w-full py-4 bg-[#b2f432] text-[#233600] rounded-full font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg">
              <MaterialIcon name="add" className="text-sm" /> New Report
            </button>
          </div>
        </aside>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0d0f0b]/95 backdrop-blur-xl border-t border-[#424935]/20 flex items-center justify-around px-1 py-2">
          {[
            { tab: 'queue', icon: 'list_alt', label: 'Queue' },
            { tab: 'users', icon: 'group', label: 'Users' },
            { tab: 'inquiries', icon: 'mail', label: 'Inbox' },
            { tab: 'products', icon: 'inventory_2', label: 'Plans' },
            { tab: 'settings', icon: 'settings', label: 'Settings' },
          ].map(({ tab, icon, label }) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab as any); setSidebarOpen(false); }}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${activeTab === tab ? 'text-[#b2f432]' : 'text-[#c2caaf]/50'}`}
            >
              <MaterialIcon name={icon} className="text-xl" />
              <span className="text-[8px] uppercase tracking-widest font-bold">{label}</span>
            </button>
          ))}
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 ml-0 md:ml-72 overflow-y-auto p-4 md:p-8 space-y-8 md:space-y-12 no-scrollbar pb-24 md:pb-8">

          {activeTab === 'queue' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-[#1a1c18] p-8 rounded-2xl flex flex-col justify-between border border-[#424935]/10 group overflow-hidden relative">
                  <div className="relative z-10">
                    <p className="text-[#c2caaf] font-medium text-sm tracking-wide uppercase">Global Carbon Sequestration</p>
                    <h3 className="font-['Noto_Serif'] text-5xl font-bold mt-4 leading-tight">{siteConfig['global_carbon_sequestration']} <span className="text-[#b2f432] text-3xl italic">Metric Tons</span></h3>
                  </div>
                  <div className="mt-8 flex gap-4 items-center relative z-10">
                    <button onClick={() => setActiveTab('settings')} className="text-[#b2f432] font-semibold flex items-center gap-2 hover:translate-x-1 transition-transform">
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

              {/* Analytics Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#1a1c18] p-8 rounded-2xl border border-[#424935]/10">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="font-bold text-lg">Planting Velocity</h3>
                      <p className="text-xs text-[#c2caaf]">Specimens established over last 30 days</p>
                    </div>
                    <div className="h-10 w-10 bg-[#b2f432]/10 rounded-xl flex items-center justify-center text-[#b2f432]">
                      <MaterialIcon name="show_chart" />
                    </div>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorTrees" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#b2f432" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#b2f432" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#424935" vertical={false} opacity={0.1} />
                        <XAxis dataKey="name" stroke="#c2caaf" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#c2caaf" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1c18', border: '1px solid #424935', borderRadius: '12px' }}
                          itemStyle={{ color: '#b2f432', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="trees" stroke="#b2f432" strokeWidth={3} fillOpacity={1} fill="url(#colorTrees)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#1a1c18] p-8 rounded-2xl border border-[#424935]/10">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="font-bold text-lg">Revenue Stream</h3>
                      <p className="text-xs text-[#c2caaf]">Contribution volume (INR) relative to time</p>
                    </div>
                    <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                      <MaterialIcon name="payments" />
                    </div>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#424935" vertical={false} opacity={0.1} />
                        <XAxis dataKey="name" stroke="#c2caaf" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#c2caaf" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1c18', border: '1px solid #424935', borderRadius: '12px' }}
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                          {revenueData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#b2f432' : '#86b325'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
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
                            <th className="px-6 py-4 text-center">Type</th>
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
                              <td className="px-6 py-5 text-center">
                                {parseInt(order.quantity) >= 50 || order.plan?.toLowerCase().includes('corporate') ? (
                                  <span className="text-[8px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-black border border-accent/30">CORPORATE</span>
                                ) : (
                                  <span className="text-[8px] bg-white/5 text-[#c2caaf]/50 px-2 py-0.5 rounded-full font-bold">SOLO</span>
                                )}
                              </td>
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
                        <button onClick={() => { setSelectedOrder({ name: rem.user, id: rem.id }); setShowUpdateModal(true); }} className="text-[10px] font-bold px-3 py-1.5 bg-orange-500/10 text-orange-400 rounded-lg hover:bg-orange-500/20 transition-colors">Update</button>
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
                      <th className="px-6 py-4 text-center">Type</th>
                      <th className="px-6 py-4 text-center">Certificate</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#424935]/10">
                    {history.map(item => (
                      <tr key={item.id} className="hover:bg-[#343530]/30 transition-colors">
                        <td className="px-6 py-5 font-mono text-xs text-[#b2f432]">{item.id}</td>
                        <td className="px-6 py-5 text-sm">{item.steward}</td>
                        <td className="px-6 py-5 text-sm">{item.species}</td>
                        <td className="px-6 py-5 text-center">
                          {item.isCsr ? (
                            <span className="text-[7px] bg-accent/10 text-accent px-1.5 py-0.5 rounded border border-accent/20 font-black">CSR</span>
                          ) : (
                            <span className="text-[7px] bg-white/5 text-[#c2caaf]/30 px-1.5 py-0.5 rounded font-bold">SOLO</span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`text-[9px] px-2 py-1 rounded-full font-bold uppercase tracking-widest ${item.certificate_issued ? 'bg-[#b2f432]/10 text-[#b2f432]' : 'bg-white/5 text-[#c2caaf]/40'}`}>
                            {item.certificate_issued ? 'ISSUED' : 'PENDING'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right"><span className="text-[9px] bg-[#233600] text-[#b2f432] px-2 py-0.5 rounded uppercase font-bold">Healthy</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'users' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="font-['Noto_Serif'] text-3xl font-bold">Steward Directory</h2>
                <div className="bg-[#b2f432]/10 text-[#b2f432] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-[#b2f432]/20">
                  {filteredUsers.length} Record{filteredUsers.length !== 1 ? 's' : ''} Found
                </div>
              </div>
              <div className="bg-[#292b26] rounded-2xl border border-[#424935]/10 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#424935]/10 text-[#c2caaf] text-[10px] uppercase tracking-widest font-bold">
                      <th className="px-6 py-4">Steward Name</th>
                      <th className="px-6 py-4 text-center">Trees</th>
                      <th className="px-6 py-4 text-center">Type</th>
                      <th className="px-6 py-4 text-center">Revenue</th>
                      <th className="px-6 py-4">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#424935]/10">
                    {filteredUsers.length > 0 ? filteredUsers.map((user, i) => (
                      <tr key={i} className="hover:bg-[#343530]/30 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-[#343530] flex items-center justify-center text-[#c2caaf] font-bold text-xs uppercase">
                              {user.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <span className="font-medium text-sm">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="font-mono text-sm tracking-wide bg-[#b2f432]/10 text-[#b2f432] px-3 py-1 rounded-full font-bold">
                            {user.trees} 🌲
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          {user.isCsr ? (
                            <span className="text-[8px] bg-accent text-black px-2 py-0.5 rounded-full font-black tracking-widest">PARTNER</span>
                          ) : (
                            <span className="text-[8px] bg-white/5 text-[#c2caaf]/40 px-2 py-0.5 rounded-full font-bold uppercase">Steward</span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-center text-sm font-mono tracking-wide text-[#e3e3db]">
                          ₹{user.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-5 text-xs text-[#c2caaf]">
                          {new Date(user.lastPlanted).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-[#c2caaf]/50 italic">
                          No users found matching "{searchQuery}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'stories' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="font-['Noto_Serif'] text-3xl font-bold">Impact Stories Manager</h2>
                <button
                  onClick={() => setEditingStory({ title: '', location: '', excerpt: '', image_url: '' })}
                  className="bg-[#b2f432] text-[#233600] px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] transition-transform"
                >
                  <MaterialIcon name="add" /> Publish New Story
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(stories.length > 0 ? stories : [
                  { title: "Dashboard Ready", location: "Global", excerpt: "No database records yet. Run setup.sql to populate.", id: 'mock' }
                ]).map(story => (
                  <div key={story.id} className="bg-[#1a1c18] border border-[#424935]/10 p-6 rounded-2xl group hover:border-[#b2f432]/30 transition-all">
                    <div className="flex gap-4">
                      {story.image_url ? (
                        <div className="h-20 w-20 rounded-xl overflow-hidden shrink-0 border border-[#424935]/20">
                          <img src={story.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-20 w-20 rounded-xl bg-[#343530] shrink-0 border border-[#424935]/20 flex items-center justify-center text-[#c2caaf]">
                          <MaterialIcon name="image" className="text-xl" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-lg leading-tight mb-1">{story.title}</h4>
                        <p className="text-[10px] text-[#b2f432] uppercase font-bold tracking-widest mb-2">{story.location}</p>
                        <p className="text-[#c2caaf] text-xs line-clamp-2 leading-relaxed">{story.excerpt}</p>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#424935]/10 flex gap-2">
                      <button onClick={() => setEditingStory(story)} className="flex-1 bg-[#343530] text-[#e3e3db] py-2 rounded-lg text-xs font-bold hover:bg-[#424935]">Edit</button>
                      <button onClick={async () => {
                        const { error } = await supabase.from('impact_stories').delete().eq('id', story.id)
                        if (!error) { toast.success("Story deleted"); fetchDashboardData() } else { toast.error(error.message) }
                      }} className="h-8 w-8 bg-[#343530] text-red-500/80 rounded-lg flex items-center justify-center hover:bg-red-500/10"><MaterialIcon name="delete" className="text-sm" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'testimonials' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="font-['Noto_Serif'] text-3xl font-bold">Endorsements Engine</h2>
                <button
                  onClick={() => setEditingTestimonial({ name: '', role: '', text: '', rating: 5 })}
                  className="bg-[#b2f432] text-[#233600] px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] transition-transform"
                >
                  <MaterialIcon name="add" /> Add Endorsement
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.length === 0 ? (
                  <div className="col-span-full py-12 text-center border border-dashed border-[#424935]/30 rounded-2xl">
                    <MaterialIcon name="campaign" className="text-4xl text-[#c2caaf]/30 mb-2" />
                    <p className="text-[#c2caaf]/50 font-medium">No testimonials found. Add an endorsement above.</p>
                  </div>
                ) : testimonials.map(test => (
                  <div key={test.id} className="bg-[#1a1c18] border border-[#424935]/10 p-6 rounded-2xl group hover:border-[#b2f432]/30 transition-all flex flex-col">
                    <div className="flex gap-1 mb-4 text-[#b2f432]">
                      {Array.from({ length: test.rating || 5 }).map((_, i) => <MaterialIcon key={i} name="star" className="text-sm fill-current" />)}
                    </div>
                    <p className="text-[#e3e3db] text-sm italic mb-6 leading-relaxed flex-1">&ldquo;{test.text}&rdquo;</p>
                    <div className="mt-auto">
                      <h4 className="font-bold">{test.name}</h4>
                      <p className="text-[10px] text-[#c2caaf] uppercase tracking-widest">{test.role}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#424935]/10 flex gap-2">
                      <button onClick={() => setEditingTestimonial(test)} className="flex-1 bg-[#343530] text-[#e3e3db] py-2 rounded-lg text-xs font-bold hover:bg-[#424935]">Edit</button>
                      <button onClick={async () => {
                        const { error } = await supabase.from('testimonials').delete().eq('id', test.id)
                        if (!error) { toast.success("Deleted!"); fetchDashboardData() } else { toast.error(error.message) }
                      }} className="h-8 w-8 bg-[#343530] text-red-500/80 rounded-lg flex items-center justify-center hover:bg-red-500/10"><MaterialIcon name="delete" className="text-sm" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'events' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="font-['Noto_Serif'] text-3xl font-bold">Campaigns & Events Tracker</h2>
                <button
                  onClick={() => setEditingEvent({ title: '', date: '', location: '', spots: 50 })}
                  className="bg-[#b2f432] text-[#233600] px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] transition-transform"
                >
                  <MaterialIcon name="add" /> Schedule Event
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventsData.length === 0 ? (
                  <div className="col-span-full py-12 text-center border border-dashed border-[#424935]/30 rounded-2xl">
                    <MaterialIcon name="event_busy" className="text-4xl text-[#c2caaf]/30 mb-2" />
                    <p className="text-[#c2caaf]/50 font-medium">No active campaigns scheduled. Add one above.</p>
                  </div>
                ) : eventsData.map(evt => (
                  <div key={evt.id} className="bg-[#1a1c18] border border-[#424935]/10 p-6 rounded-2xl group hover:border-[#b2f432]/30 transition-all flex flex-col">
                    <h4 className="font-bold text-lg mb-2 text-[#b2f432]">{evt.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-[#c2caaf] mb-1">
                      <MaterialIcon name="calendar_today" className="text-sm" /> <span>{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#c2caaf] mb-4">
                      <MaterialIcon name="location_on" className="text-sm" /> <span>{evt.location}</span>
                    </div>
                    <div className="mt-auto">
                      <span className="text-[10px] bg-sky-500/10 text-sky-400 px-3 py-1 rounded-full uppercase tracking-widest font-bold">
                        {evt.spots} Capacity
                      </span>
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#424935]/10 flex gap-2">
                      <button onClick={() => setEditingEvent(evt)} className="flex-1 bg-[#343530] text-[#e3e3db] py-2 rounded-lg text-xs font-bold hover:bg-[#424935]">Edit</button>
                      <button onClick={async () => {
                        const { error } = await supabase.from('volunteer_events').delete().eq('id', evt.id)
                        if (!error) { toast.success("Event Canceled"); fetchDashboardData() } else { toast.error(error.message) }
                      }} className="h-8 w-8 bg-[#343530] text-red-500/80 rounded-lg flex items-center justify-center hover:bg-red-500/10"><MaterialIcon name="delete" className="text-sm" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'faqs' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="font-['Noto_Serif'] text-3xl font-bold">Frequently Asked Questions</h2>
                <button
                  onClick={() => setEditingFaq({ question: '', answer: '', display_order: faqsData.length + 1 })}
                  className="bg-[#b2f432] text-[#233600] px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] transition-transform"
                >
                  <MaterialIcon name="add" /> Add Question
                </button>
              </div>
              
              <div className="space-y-4 max-w-4xl">
                {faqsData.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-[#424935]/30 rounded-2xl">
                    <MaterialIcon name="quiz" className="text-4xl text-[#c2caaf]/30 mb-2" />
                    <p className="text-[#c2caaf]/50 font-medium">No FAQs have been added yet.</p>
                  </div>
                ) : faqsData.map(faq => (
                  <div key={faq.id} className="bg-[#1a1c18] border border-[#424935]/10 p-6 rounded-2xl group flex gap-6 hover:border-[#b2f432]/30 transition-all items-start">
                    <div className="w-10 h-10 shrink-0 bg-[#343530] rounded-full flex items-center justify-center font-bold text-[#b2f432]">
                      {faq.display_order}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-['Noto_Serif'] font-bold text-lg text-[#e3e3db] mb-2">{faq.question}</h4>
                      <p className="text-[#c2caaf] text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => setEditingFaq(faq)} className="h-8 w-8 bg-[#343530] text-[#e3e3db] rounded-lg flex items-center justify-center hover:bg-[#424935]"><MaterialIcon name="edit" className="text-sm" /></button>
                       <button onClick={async () => {
                         const { error } = await supabase.from('faq_manager').delete().eq('id', faq.id)
                         if (!error) { toast.success("Question Removed"); fetchDashboardData() } else { toast.error(error.message) }
                       }} className="h-8 w-8 bg-[#343530] text-red-500/80 rounded-lg flex items-center justify-center hover:bg-red-500/10"><MaterialIcon name="delete" className="text-sm" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'media' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="font-['Noto_Serif'] text-3xl font-bold">Media & PR Explorer</h2>
                <button
                  onClick={() => setEditingMedia({ asset_type: 'gallery_image', title: '', date_published: '', excerpt_or_headline: '', publisher_or_location: '', media_url: '' })}
                  className="bg-[#b2f432] text-[#233600] px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] transition-transform"
                >
                  <MaterialIcon name="add" /> Upload Media
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(mediaData.length > 0 ? mediaData : [
                  { title: "Run SQL script", asset_type: "gallery_image", publisher_or_location: "To enable Media assets", id: 'mock' }
                ]).map(media => (
                  <div key={media.id} className="bg-[#1a1c18] border border-[#424935]/10 p-6 rounded-2xl group hover:border-[#b2f432]/30 transition-all flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] bg-[#343530] text-[#b2f432] px-3 py-1 rounded-full uppercase tracking-widest font-bold">
                        {media.asset_type.replace('_', ' ')}
                      </span>
                      {media.media_url && (
                        <MaterialIcon name={media.asset_type === 'video' ? 'play_circle' : 'image'} className="text-[#c2caaf] opacity-50" />
                      )}
                    </div>
                    {media.media_url && media.asset_type === 'gallery_image' && (
                      <div className="w-full h-32 rounded-xl mb-4 overflow-hidden">
                        <img src={media.media_url} className="w-full h-full object-cover" alt="" />
                      </div>
                    )}
                    <h4 className="font-bold text-lg mb-2 text-[#e3e3db] leading-snug">{media.title}</h4>
                    {media.publisher_or_location && (
                      <p className="text-sm text-[#b2f432] mb-1">{media.publisher_or_location}</p>
                    )}
                    {media.excerpt_or_headline && (
                      <p className="text-[#c2caaf] text-xs leading-relaxed mb-4 line-clamp-3">{media.excerpt_or_headline}</p>
                    )}
                    <div className="mt-auto pt-4 border-t border-[#424935]/10 flex gap-2">
                      <button onClick={() => setEditingMedia(media)} className="flex-1 bg-[#343530] text-[#e3e3db] py-2 rounded-lg text-xs font-bold hover:bg-[#424935]">Edit File</button>
                      <button onClick={async () => {
                        const { error } = await supabase.from('media_assets').delete().eq('id', media.id)
                        if (!error) { toast.success("Asset Deleted"); fetchDashboardData() } else { toast.error(error.message) }
                      }} className="h-8 w-8 bg-[#343530] text-red-500/80 rounded-lg flex items-center justify-center hover:bg-red-500/10"><MaterialIcon name="delete" className="text-sm" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'settings' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <h2 className="font-['Noto_Serif'] text-3xl font-bold">Global Site Configuration</h2>
              <div className="bg-[#1a1c18] rounded-3xl border border-[#424935]/20 p-8 space-y-8 max-w-3xl">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Hero Headline</label>
                    <input 
                      value={siteConfig['hero_headline']}
                      onChange={(e) => setSiteConfig({...siteConfig, hero_headline: e.target.value})}
                      className="w-full bg-[#343530] rounded-xl px-4 py-3 text-lg outline-none text-[#e3e3db]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Global Reforestation Goal (Trees)</label>
                      <input 
                        type="number"
                        value={siteConfig['global_goal']}
                        onChange={(e) => setSiteConfig({...siteConfig, global_goal: e.target.value})}
                        className="w-full bg-[#343530] rounded-xl px-4 py-3 outline-none text-[#b2f432] font-mono text-xl font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Global Carbon Sequestration (Metric Tons)</label>
                      <input 
                        type="text"
                        value={siteConfig['global_carbon_sequestration']}
                        onChange={(e) => setSiteConfig({...siteConfig, global_carbon_sequestration: e.target.value})}
                        className="w-full bg-[#343530] rounded-xl px-4 py-3 outline-none text-[#b2f432] font-mono text-xl font-bold"
                        placeholder="e.g. 42,850"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Contact Email</label>
                      <input 
                        value={siteConfig['contact_email']}
                        onChange={(e) => setSiteConfig({...siteConfig, contact_email: e.target.value})}
                        className="w-full bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none text-[#e3e3db]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Contact Phone</label>
                      <input 
                        value={siteConfig['contact_phone']}
                        onChange={(e) => setSiteConfig({...siteConfig, contact_phone: e.target.value})}
                        className="w-full bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none text-[#e3e3db]"
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-[#424935]/10">
                  <button onClick={async () => {
                    const promises = Object.entries(siteConfig).map(([key, value]) => 
                      supabase.from('site_config').upsert({ key, value })
                    )
                    const results = await Promise.all(promises)
                    if (results.every(r => !r.error)) { toast.success("Site Configuration Updated Live!") }
                    else { toast.error("Some settings failed to save.") }
                  }} className="w-full bg-[#b2f432] text-[#233600] py-4 rounded-xl font-bold hover:scale-[1.01] transition-transform text-lg flex items-center justify-center gap-2">
                    DEPOY SETTINGS <MaterialIcon name="public" />
                  </button>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'products' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="font-['Noto_Serif'] text-3xl font-bold">Offerings & Price Master</h2>
                <button
                  onClick={() => setEditingProduct({ id: `plan-${Math.random().toString(36).substring(2, 7)}`, name: '', description: '', price_in_cents: 0, price_display: '', trees: 1, mode: 'payment', features: [], is_csr: false, popular: false, badge: '' })}
                  className="bg-[#b2f432] text-[#233600] px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-[1.05] transition-all"
                >
                  <MaterialIcon name="add_shopping_cart" /> Add New Offering
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dbProducts.map(p => (
                  <div key={p.id} className="bg-[#1a1c18] border border-[#424935]/10 p-6 rounded-2xl group hover:border-[#b2f432]/30 transition-all flex flex-col relative overflow-hidden">
                    {p.is_csr && <div className="absolute top-0 right-0 bg-[#b2f432] text-[#233600] text-[8px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-widest">CSR ONLY</div>}
                    <div className="flex justify-between items-start mb-6">
                      <div className="h-10 w-10 bg-[#343530] rounded-xl flex items-center justify-center text-[#b2f432]">
                        <MaterialIcon name={p.mode === 'subscription' ? 'event_repeat' : 'shopping_bag'} />
                      </div>
                      <span className="text-[8px] bg-[#233600] text-[#b2f432] px-2 py-1 rounded-full font-bold uppercase">{p.mode}</span>
                    </div>
                    <h4 className="font-bold text-lg text-[#e3e3db]">{p.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[#b2f432] font-mono font-bold">{p.price_display}</p>
                    </div>
                    <p className="text-[#c2caaf] text-xs mt-2 line-clamp-2">{p.description}</p>
                    <div className="mt-8 pt-6 border-t border-[#424935]/10 flex gap-2">
                      <button onClick={() => setEditingProduct(p)} className="flex-1 bg-[#343530] text-[#e3e3db] py-2 rounded-lg text-xs font-bold hover:bg-[#b2f432] hover:text-[#233600] transition-colors">Modify Plan</button>
                      <button onClick={async () => {
                         if(confirm(`Erase ${p.name} from registry?`)) {
                           const { error } = await supabase.from('site_products').delete().eq('id', p.id)
                           if (!error) { toast.success("Plan Erased"); fetchDashboardData() } else { toast.error(error.message) }
                         }
                      }} className="h-8 w-8 bg-[#343530] text-red-500/80 rounded-lg flex items-center justify-center hover:bg-red-500/10"><MaterialIcon name="delete" className="text-sm" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {editingProduct && (
            <div className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-6 backdrop-blur-md overflow-y-auto custom-scrollbar">
              <div className="bg-[#1a1c18] w-full max-w-2xl rounded-[2.5rem] border border-[#424935]/20 p-10 space-y-8 my-auto relative shadow-2xl">
                <button onClick={() => setEditingProduct(null)} className="absolute top-6 right-6 h-10 w-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                  <MaterialIcon name="close" />
                </button>
                
                <h3 className="font-['Noto_Serif'] text-3xl font-bold">Configure Offering</h3>
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase font-bold tracking-widest text-[#c2caaf]">Plan Heading</label>
                       <input
                         value={editingProduct.name}
                         onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                         className="w-full bg-[#292b26] border border-[#424935]/20 rounded-2xl px-5 py-4 text-sm outline-none focus:border-[#b2f432]/50 transition-colors"
                         placeholder="e.g. Forest Legacy"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase font-bold tracking-widest text-[#c2caaf]">Internal Master ID</label>
                       <input
                         value={editingProduct.id}
                         disabled={!!editingProduct.created_at}
                         onChange={(e) => setEditingProduct({ ...editingProduct, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                         className="w-full bg-[#292b26] border border-[#424935]/20 rounded-2xl px-5 py-4 text-sm outline-none font-mono disabled:opacity-30"
                         placeholder="e.g. woodland-tier-3"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase font-bold tracking-widest text-[#c2caaf]">Trees Per Unit</label>
                       <input
                         type="number"
                         value={editingProduct.trees}
                         onChange={(e) => setEditingProduct({ ...editingProduct, trees: parseInt(e.target.value) || 1 })}
                         className="w-full bg-[#292b26] border border-[#424935]/20 rounded-2xl px-5 py-4 text-sm outline-none"
                       />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase font-bold tracking-widest text-[#c2caaf]">Price In Cents (Stripe Logic)</label>
                       <input
                         type="number"
                         value={editingProduct.price_in_cents}
                         onChange={(e) => setEditingProduct({ ...editingProduct, price_in_cents: parseInt(e.target.value) || 0 })}
                         className="w-full bg-[#292b26] border border-[#424935]/20 rounded-2xl px-5 py-4 text-sm outline-none text-[#b2f432] font-bold"
                         placeholder="e.g. 50000 (for ₹500)"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase font-bold tracking-widest text-[#c2caaf]">Website Display Price</label>
                       <input
                         value={editingProduct.price_display}
                         onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, ''); 
                            const num = parseFloat(val) || 0;
                            setEditingProduct({ 
                              ...editingProduct, 
                              price_display: e.target.value.startsWith('₹') ? e.target.value : `₹${e.target.value}`,
                              price_in_cents: Math.round(num * 100)
                            })
                         }}
                         className="w-full bg-[#292b26] border border-[#424935]/20 rounded-2xl px-5 py-4 text-sm outline-none"
                         placeholder="e.g. 500"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase font-bold tracking-widest text-[#c2caaf]">Billing Interval</label>
                       <select
                         value={editingProduct.mode}
                         onChange={(e) => setEditingProduct({ ...editingProduct, mode: e.target.value })}
                         className="w-full bg-[#292b26] border border-[#424935]/20 rounded-2xl px-5 py-4 text-sm outline-none appearance-none"
                       >
                         <option value="payment">One-Time (Stewardship)</option>
                         <option value="subscription">Subscription (Monthly)</option>
                       </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase font-bold tracking-widest text-[#c2caaf]">Product Description</label>
                     <textarea
                       value={editingProduct.description}
                       onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                       className="w-full bg-[#292b26] border border-[#424935]/20 rounded-2xl px-5 py-4 text-sm outline-none min-h-[100px]"
                       placeholder="Explain the impact of this plan..."
                     />
                  </div>
                  
                  <div className="flex items-center justify-between p-6 bg-[#292b26] rounded-2xl border border-[#424935]/20">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="is_csr_check"
                        checked={editingProduct.is_csr}
                        onChange={(e) => setEditingProduct({ ...editingProduct, is_csr: e.target.checked })}
                        className="w-5 h-5 accent-[#b2f432]"
                      />
                      <label htmlFor="is_csr_check" className="text-xs font-bold uppercase tracking-widest text-[#e3e3db]">Limit to Corporate Customers</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="is_popular"
                        checked={editingProduct.popular}
                        onChange={(e) => setEditingProduct({ ...editingProduct, popular: e.target.checked })}
                        className="w-5 h-5 accent-[#b2f432]"
                      />
                      <label htmlFor="is_popular" className="text-xs font-bold uppercase tracking-widest text-[#e3e3db]">Featured Plan</label>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-[#424935]/10 flex gap-4">
                  <button
                    onClick={async () => {
                      const { error } = await supabase.from('site_products').upsert(editingProduct, { onConflict: 'id' })
                      if (!error) {
                        toast.success("Catalog Synchronized Live")
                        setEditingProduct(null)
                        fetchDashboardData()
                      } else {
                        toast.error(error.message)
                      }
                    }}
                    className="flex-1 bg-[#b2f432] text-[#233600] py-5 rounded-[1.5rem] font-bold uppercase text-xs tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_40px_-10px_rgba(178,244,50,0.3)]"
                  >
                    Deploy to Marketplace
                  </button>
                  <button onClick={() => setEditingProduct(null)} className="px-8 bg-white/5 py-5 rounded-[1.5rem] font-bold uppercase text-xs tracking-widest hover:bg-white/10 transition-colors">Discard</button>
                </div>
              </div>
            </div>
          )}

          {editingStory && (
            <div className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-6 backdrop-blur-md">
              <div className="bg-[#1a1c18] w-full max-w-2xl rounded-3xl border border-[#424935]/20 p-8 space-y-6">
                <h3 className="font-['Noto_Serif'] text-2xl font-bold">{editingStory.id ? 'Edit Story' : 'Publish New Story'}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Headline / Title</label>
                      <input
                        value={editingStory.title}
                        onChange={(e) => setEditingStory({ ...editingStory, title: e.target.value })}
                        className="w-full bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none text-[#e3e3db]"
                        placeholder="e.g. 500 Trees in Delhi"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Location</label>
                      <input
                        value={editingStory.location}
                        onChange={(e) => setEditingStory({ ...editingStory, location: e.target.value })}
                        className="w-full bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none text-[#e3e3db]"
                        placeholder="e.g. North University"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Thumbnail / Header Image (Upload)</label>
                    <div className="flex items-center gap-4">
                      {editingStory.image_url && (
                        <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0 border border-[#424935]/30">
                          <img src={editingStory.image_url} alt="Preview" className="h-full w-full object-cover bg-[#343530]" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              setEditingStory({ ...editingStory, image_url: reader.result as string })
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                        className="w-full bg-[#343530] rounded-xl px-4 py-2 text-sm outline-none text-[#e3e3db] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#b2f432] file:text-[#233600] hover:file:opacity-90 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Story Excerpt (Website Body)</label>
                    <textarea
                      value={editingStory.excerpt}
                      onChange={(e) => setEditingStory({ ...editingStory, excerpt: e.target.value })}
                      className="w-full bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none text-[#e3e3db] min-h-[120px]"
                      placeholder="Type the full story or impact update here..."
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4 border-t border-[#424935]/10">
                  <button
                    onClick={async () => {
                      const dataPayload = { title: editingStory.title, location: editingStory.location, excerpt: editingStory.excerpt, image_url: editingStory.image_url }
                      const op = editingStory.id 
                        ? supabase.from('impact_stories').update(dataPayload).eq('id', editingStory.id)
                        : supabase.from('impact_stories').insert(dataPayload)
                      const { error } = await op
                      if (!error) {
                        toast.success("Impact Story Live!")
                        setEditingStory(null)
                        fetchDashboardData()
                      } else {
                        toast.error(error.message)
                      }
                    }}
                    className="flex-1 bg-[#b2f432] text-[#233600] py-3 rounded-xl font-bold hover:scale-[1.01] transition-transform"
                  >
                    Publish to Website
                  </button>
                  <button onClick={() => setEditingStory(null)} className="flex-1 bg-white/5 text-[#c2caaf] hover:text-white py-3 rounded-xl font-bold transition-colors">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {editingTestimonial && (
            <div className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-6 backdrop-blur-md">
              <div className="bg-[#1a1c18] w-full max-w-lg rounded-3xl border border-[#424935]/20 p-8 space-y-6">
                <h3 className="font-['Noto_Serif'] text-2xl font-bold">{editingTestimonial.id ? 'Edit Endorsement' : 'Add Endorsement'}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Name</label>
                      <input
                        value={editingTestimonial.name}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                        className="w-full bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none text-[#e3e3db]"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Role or Title</label>
                      <input
                        value={editingTestimonial.role}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                        className="w-full bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none text-[#e3e3db]"
                        placeholder="e.g. CEO, TechCorp"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Rating (1-5)</label>
                    <input
                      type="number" min="1" max="5"
                      value={editingTestimonial.rating}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, rating: parseInt(e.target.value) || 5 })}
                      className="w-full bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none text-[#e3e3db]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Quote / Testimonial</label>
                    <textarea
                      value={editingTestimonial.text}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, text: e.target.value })}
                      className="w-full bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none text-[#e3e3db] min-h-[100px]"
                      placeholder="Type their exact quote..."
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4 border-t border-[#424935]/10">
                  <button
                    onClick={async () => {
                      const dataPayload = { name: editingTestimonial.name, role: editingTestimonial.role, text: editingTestimonial.text, rating: editingTestimonial.rating }
                      const op = editingTestimonial.id 
                        ? supabase.from('testimonials').update(dataPayload).eq('id', editingTestimonial.id)
                        : supabase.from('testimonials').insert(dataPayload)
                      const { error } = await op
                      if (!error) {
                        toast.success("Testimonial Published!")
                        setEditingTestimonial(null)
                        fetchDashboardData()
                      } else {
                        toast.error(error.message)
                      }
                    }}
                    className="flex-1 bg-[#b2f432] text-[#233600] py-3 rounded-xl font-bold hover:scale-[1.01] transition-transform"
                  >
                    Save Endorsement
                  </button>
                  <button onClick={() => setEditingTestimonial(null)} className="flex-1 bg-white/5 text-[#c2caaf] hover:text-white py-3 rounded-xl font-bold transition-colors">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {editingEvent && (
            <div className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-6 backdrop-blur-md">
              <div className="bg-[#1a1c18] w-full max-w-lg rounded-3xl border border-[#424935]/20 p-8 space-y-6">
                <h3 className="font-['Noto_Serif'] text-2xl font-bold">{editingEvent.id ? 'Edit Event' : 'Schedule Event'}</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Event Title</label>
                    <input
                      value={editingEvent.title}
                      onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                      className="w-full bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none text-[#e3e3db]"
                      placeholder="e.g. MEGA Drive Chennai"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Date</label>
                      <input
                        type="date"
                        value={editingEvent.date}
                        onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                        className="w-full bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none text-[#e3e3db]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Spots Allowed</label>
                      <input
                        type="number"
                        value={editingEvent.spots}
                        onChange={(e) => setEditingEvent({ ...editingEvent, spots: parseInt(e.target.value) || 0 })}
                        className="w-full bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none text-[#e3e3db]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Full Location</label>
                    <input
                      value={editingEvent.location}
                      onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                      className="w-full bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none text-[#e3e3db]"
                      placeholder="Park Name, City..."
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4 border-t border-[#424935]/10">
                  <button
                    onClick={async () => {
                      const dataPayload = { title: editingEvent.title, date: editingEvent.date, location: editingEvent.location, spots: editingEvent.spots }
                      const op = editingEvent.id 
                        ? supabase.from('volunteer_events').update(dataPayload).eq('id', editingEvent.id)
                        : supabase.from('volunteer_events').insert(dataPayload)
                      const { error } = await op
                      if (!error) {
                        toast.success("Event Published!")
                        setEditingEvent(null)
                        fetchDashboardData()
                      } else {
                        toast.error(error.message)
                      }
                    }}
                    className="flex-1 bg-[#b2f432] text-[#233600] py-3 rounded-xl font-bold hover:scale-[1.01] transition-transform"
                  >
                    Save Event
                  </button>
                  <button onClick={() => setEditingEvent(null)} className="flex-1 bg-white/5 text-[#c2caaf] hover:text-white py-3 rounded-xl font-bold transition-colors">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {editingFaq && (
            <div className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-6 backdrop-blur-md">
              <div className="bg-[#1a1c18] w-full max-w-2xl rounded-3xl border border-[#424935]/20 p-8 space-y-6">
                <h3 className="font-['Noto_Serif'] text-2xl font-bold">{editingFaq.id ? 'Edit FAQ' : 'New Knowledge Base Question'}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-[1fr_100px] gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#c2caaf]">User Question</label>
                      <input
                        value={editingFaq.question}
                        onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                        className="w-full bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none text-[#e3e3db] font-['Noto_Serif'] font-bold"
                        placeholder="e.g. Can I visit my tree?"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Order ID</label>
                      <input
                        type="number"
                        value={editingFaq.display_order}
                        onChange={(e) => setEditingFaq({ ...editingFaq, display_order: parseInt(e.target.value) || 0 })}
                        className="w-full bg-[#343530] rounded-xl px-4 py-3 text-center outline-none text-[#b2f432] font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Detailed Answer</label>
                    <textarea
                      value={editingFaq.answer}
                      onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                      className="w-full bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none text-[#e3e3db] min-h-[120px]"
                      placeholder="Type the comprehensive response here..."
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4 border-t border-[#424935]/10">
                  <button
                    onClick={async () => {
                      const dataPayload = { question: editingFaq.question, answer: editingFaq.answer, display_order: editingFaq.display_order }
                      const op = editingFaq.id 
                        ? supabase.from('faq_manager').update(dataPayload).eq('id', editingFaq.id)
                        : supabase.from('faq_manager').insert(dataPayload)
                      const { error } = await op
                      if (!error) {
                        toast.success("FAQ Saved")
                        setEditingFaq(null)
                        fetchDashboardData()
                      } else {
                        toast.error(error.message)
                      }
                    }}
                    className="flex-1 bg-[#b2f432] text-[#233600] py-3 rounded-xl font-bold hover:scale-[1.01] transition-transform"
                  >
                    Publish FAQ
                  </button>
                  <button onClick={() => setEditingFaq(null)} className="flex-1 bg-white/5 text-[#c2caaf] hover:text-white py-3 rounded-xl font-bold transition-colors">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {editingMedia && (
            <div className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-6 backdrop-blur-md">
              <div className="bg-[#1a1c18] w-full max-w-2xl rounded-3xl border border-[#424935]/20 p-8 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <h3 className="font-['Noto_Serif'] text-2xl font-bold">{editingMedia.id ? 'Edit Media Asset' : 'Upload New Asset'}</h3>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Asset Type</label>
                    <select
                      value={editingMedia.asset_type}
                      onChange={(e) => setEditingMedia({ ...editingMedia, asset_type: e.target.value })}
                      className="w-full bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none text-[#b2f432] font-bold uppercase tracking-widest"
                    >
                      <option value="press_release">Press Release (News)</option>
                      <option value="media_coverage">Media Coverage (Articles)</option>
                      <option value="gallery_image">Gallery Image</option>
                      <option value="video">Video Highlights</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Title / Headline</label>
                      <input
                        value={editingMedia.title}
                        onChange={(e) => setEditingMedia({ ...editingMedia, title: e.target.value })}
                        className="w-full bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none text-[#e3e3db]"
                        placeholder="e.g. Mega Drive 2026"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Date / Duration</label>
                      <input
                        value={editingMedia.date_published || ''}
                        onChange={(e) => setEditingMedia({ ...editingMedia, date_published: e.target.value })}
                        className="w-full bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none text-[#e3e3db]"
                        placeholder="e.g. Jan 2026 or 4:32"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Publisher / Location / Category</label>
                    <input
                      value={editingMedia.publisher_or_location || ''}
                      onChange={(e) => setEditingMedia({ ...editingMedia, publisher_or_location: e.target.value })}
                      className="w-full bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none text-[#e3e3db]"
                      placeholder="e.g. NDTV Green or Chennai"
                    />
                  </div>

                  {editingMedia.asset_type === 'gallery_image' && (
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Upload Image File</label>
                    <div className="flex items-center gap-4">
                      {editingMedia.media_url && (
                        <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0 border border-[#424935]/30">
                          <img src={editingMedia.media_url} alt="Preview" className="h-full w-full object-cover bg-[#343530]" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              setEditingMedia({ ...editingMedia, media_url: reader.result as string })
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                        className="w-full bg-[#343530] rounded-xl px-4 py-2 text-sm outline-none text-[#e3e3db] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#b2f432] file:text-[#233600] hover:file:opacity-90 cursor-pointer"
                      />
                    </div>
                  </div>
                  )}

                  {editingMedia.asset_type === 'video' && (
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Video URL (YouTube/Vimeo)</label>
                    <input
                      value={editingMedia.media_url || ''}
                      onChange={(e) => setEditingMedia({ ...editingMedia, media_url: e.target.value })}
                      className="w-full bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none text-[#e3e3db]"
                      placeholder="e.g. https://youtube.com/watch?v=..."
                    />
                  </div>
                  )}

                  {(editingMedia.asset_type === 'press_release' || editingMedia.asset_type === 'media_coverage') && (
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#c2caaf]">Excerpt or Short Summary</label>
                    <textarea
                      value={editingMedia.excerpt_or_headline || ''}
                      onChange={(e) => setEditingMedia({ ...editingMedia, excerpt_or_headline: e.target.value })}
                      className="w-full bg-[#343530] rounded-xl px-4 py-3 text-sm outline-none text-[#e3e3db] min-h-[100px]"
                      placeholder="Summary of the article..."
                    />
                  </div>
                  )}

                </div>
                
                <div className="flex gap-4 pt-4 border-t border-[#424935]/10">
                  <button
                    onClick={async () => {
                      const op = editingMedia.id 
                        ? supabase.from('media_assets').update(editingMedia).eq('id', editingMedia.id)
                        : supabase.from('media_assets').insert(editingMedia)
                      const { error } = await op
                      if (!error) {
                        toast.success("Media Saved successfully!")
                        setEditingMedia(null)
                        fetchDashboardData()
                      } else {
                        toast.error(error.message)
                      }
                    }}
                    className="flex-1 bg-[#b2f432] text-[#233600] py-3 rounded-xl font-bold hover:scale-[1.01] transition-transform"
                  >
                    Publish Asset
                  </button>
                  <button onClick={() => setEditingMedia(null)} className="flex-1 bg-white/5 text-[#c2caaf] hover:text-white py-3 rounded-xl font-bold transition-colors">Cancel</button>
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
              <div className="flex justify-between items-center">
                <h2 className="font-['Noto_Serif'] text-3xl font-bold">Steward Inquiries</h2>
                <div className="bg-[#b2f432]/10 text-[#b2f432] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-[#b2f432]/20">
                  {messages.length} Message{messages.length !== 1 ? 's' : ''} Database
                </div>
              </div>
              
              <div className="bg-[#292b26] rounded-2xl border border-[#424935]/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#424935]/10 text-[#c2caaf] text-[10px] uppercase tracking-widest font-bold">
                        <th className="px-6 py-4 w-16">S.No</th>
                        <th className="px-6 py-4">Sender Info</th>
                        <th className="px-6 py-4">Contact Details</th>
                        <th className="px-6 py-4">Query Related To</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#424935]/10">
                      {messages.length > 0 ? messages.map((msg, index) => (
                        <tr key={msg.id} className={`transition-colors ${msg.status.toLowerCase() === 'unread' ? 'bg-orange-500/5 hover:bg-orange-500/10' : 'hover:bg-[#343530]/30'}`}>
                          {/* S.No */}
                          <td className="px-6 py-5 font-mono text-xs text-[#c2caaf]">{messages.length - index}</td>
                          
                          {/* Sender Info */}
                          <td className="px-6 py-5">
                            <p className={`font-bold text-sm ${msg.status.toLowerCase() === 'unread' ? 'text-orange-400' : 'text-[#e3e3db]'}`}>
                              {msg.name}
                            </p>
                            <p className="text-[10px] text-[#c2caaf] uppercase mt-1">
                              {new Date(msg.created_at).toLocaleDateString()}
                            </p>
                          </td>

                          {/* Contact Details */}
                          <td className="px-6 py-5 text-xs text-[#c2caaf] space-y-1">
                            <p className="flex items-center gap-2"><MaterialIcon name="mail" className="text-[14px]" /> {msg.email}</p>
                            {msg.phone && <p className="flex items-center gap-2"><MaterialIcon name="phone" className="text-[14px]" /> {msg.phone}</p>}
                          </td>

                          {/* Query Topic */}
                          <td className="px-6 py-5">
                            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#b2f432]/10 text-[#b2f432] border border-[#b2f432]/20">
                              {msg.subject}
                            </span>
                          </td>

                          {/* Description (Truncated) */}
                          <td className="px-6 py-5">
                            <p className="text-sm text-[#c2caaf] line-clamp-2 max-w-xs" title={msg.message}>
                              {msg.message}
                            </p>
                          </td>

                          {/* Status Badge */}
                          <td className="px-6 py-5 text-center">
                            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                              msg.status.toLowerCase() === 'unread' 
                                ? 'bg-orange-500 text-white' 
                                : msg.status.toLowerCase() === 'resolved' 
                                  ? 'bg-[#b2f432]/20 text-[#b2f432]' 
                                  : 'bg-[#343530] text-[#c2caaf]'
                            }`}>
                              {msg.status}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-2">
                              {/* Open Modal Button */}
                              <button 
                                onClick={() => {
                                  setSelectedInquiry(msg)
                                  if (msg.status.toLowerCase() === 'unread') {
                                    supabase.from('contact_messages').update({ status: 'Read' }).eq('id', msg.id).then(() => fetchDashboardData())
                                  }
                                }}
                                className="h-8 w-8 bg-[#343530] text-[#e3e3db] rounded-lg flex items-center justify-center hover:bg-[#b2f432] hover:text-[#233600] transition-colors"
                                title="View Full Message"
                              >
                                <MaterialIcon name="visibility" className="text-sm" />
                              </button>

                              {/* Toggle Read/Unread Status Buttons */}
                              {msg.status.toLowerCase() !== 'unread' && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation(); // prevent modal opening
                                    await supabase.from('contact_messages').update({ status: 'Unread' }).eq('id', msg.id);
                                    toast.success("Marked as Unread");
                                    fetchDashboardData();
                                  }}
                                  className="h-8 w-8 bg-orange-500/10 text-orange-400 rounded-lg flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors"
                                  title="Mark as Unread"
                                >
                                  <MaterialIcon name="mark_email_unread" className="text-sm" />
                                </button>
                              )}

                              {msg.status.toLowerCase() === 'unread' && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await supabase.from('contact_messages').update({ status: 'Read' }).eq('id', msg.id);
                                    toast.success("Marked as Read");
                                    fetchDashboardData();
                                  }}
                                  className="h-8 w-8 bg-[#b2f432]/10 text-[#b2f432] rounded-lg flex items-center justify-center hover:bg-[#b2f432] hover:text-[#233600] transition-colors"
                                  title="Mark as Read"
                                >
                                  <MaterialIcon name="mark_email_read" className="text-sm" />
                                </button>
                              )}

                              {/* Delete Button */}
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (confirm("Are you sure you want to delete this inquiry?")) {
                                    const { error } = await supabase.from('contact_messages').delete().eq('id', msg.id);
                                    if (error) {
                                      toast.error("Failed to delete inquiry");
                                    } else {
                                      toast.success("Inquiry deleted successfully");
                                      fetchDashboardData();
                                    }
                                  }
                                }}
                                className="h-8 w-8 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                                title="Delete Inquiry"
                              >
                                <MaterialIcon name="delete" className="text-sm" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-[#c2caaf]/40 italic">
                            No inquiries found in the database.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

        </main>
      </div>

      {/* Selected Inquiry Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-[150] bg-black/80 flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-[#1a1c18] w-full max-w-2xl rounded-[2.5rem] border border-[#424935]/20 p-10 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-['Noto_Serif'] text-3xl font-bold mb-2">Inquiry: {selectedInquiry.subject}</h3>
                <p className="text-[#c2caaf] text-sm">From: <span className="text-white font-medium">{selectedInquiry.name}</span> ({selectedInquiry.email})</p>
                {selectedInquiry.phone && <p className="text-[#c2caaf] text-sm mt-1">Phone: <span className="text-white font-medium">{selectedInquiry.phone}</span></p>}
              </div>
              <button onClick={() => setSelectedInquiry(null)} className="h-10 w-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <MaterialIcon name="close" />
              </button>
            </div>
            
            <div className="bg-[#0d0f0b] rounded-2xl p-6 border border-[#424935]/20">
              <p className="text-[#e3e3db] whitespace-pre-wrap leading-relaxed">{selectedInquiry.message}</p>
            </div>

            <div className="flex gap-4 pt-4 border-t border-[#424935]/10">
              <a href={`mailto:${selectedInquiry.email}?subject=RE: ${selectedInquiry.subject} - Green Legacy`} className="flex-1 bg-[#b2f432] text-[#233600] py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                <MaterialIcon name="reply" /> Reply via Email
              </a>
              <button 
                onClick={async () => {
                  await supabase.from('contact_messages').update({ status: 'Resolved' }).eq('id', selectedInquiry.id);
                  toast.success("Marked as Resolved");
                  setSelectedInquiry(null);
                  fetchDashboardData();
                }}
                className="flex-1 bg-white/5 text-[#c2caaf] py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
              >
                <MaterialIcon name="check_circle" /> Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}

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
              <form className="space-y-6" onSubmit={handleGrowthUpdate}>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#c2caaf]">Observation Date</label>
                  <input
                    type="date"
                    value={growthDate}
                    onChange={(e) => setGrowthDate(e.target.value)}
                    className="w-full bg-[#343530] border-none rounded-xl px-4 py-3 text-sm outline-none text-[#e3e3db]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#c2caaf]">Growth Image proof</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setGrowthImage(URL.createObjectURL(e.target.files[0]))
                      }
                    }}
                    className="w-full text-sm text-[#c2caaf] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#b2f432]/10 file:text-[#b2f432] hover:file:bg-[#b2f432]/20 outline-none cursor-pointer"
                  />
                  {growthImage && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-[#424935]/20 aspect-video relative">
                      <img src={growthImage} alt="Growth" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setGrowthImage(null)} className="absolute top-2 right-2 h-8 w-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                        <MaterialIcon name="close" className="text-sm" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#c2caaf]">Detailed Description</label>
                  <textarea
                    value={growthNote}
                    onChange={(e) => setGrowthNote(e.target.value)}
                    className="w-full bg-[#343530] border-none rounded-2xl px-4 py-4 focus:ring-1 focus:ring-[#b2f432]/40 text-sm min-h-[120px] outline-none"
                    placeholder="e.g. Healthy new canopy forming. Measured width is 40cm..."
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
                      onChange={(e) => setProofData({ ...proofData, gps: e.target.value })}
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
                    onChange={(e) => setProofData({ ...proofData, species: e.target.value })}
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
                    onChange={(e) => setProofData({ ...proofData, photo: e.target.value })}
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
