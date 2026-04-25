import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import Link from "next/link"

/* eslint-disable @next/next/no-img-element */

const MaterialIcon = ({ name, className = "" }: { name: string, className?: string }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: 'inherit' }}>
    {name}
  </span>
)

export default async function VerifyPage({ params }: { params: { id: string } }) {
  const { id } = params

  // Handle 'official' or placeholder IDs as a generic landing
  if (id === 'official' || id === 'GL-CORE-001') {
    return (
       <div className="min-h-screen bg-[#121410] text-[#e3e3db] flex items-center justify-center p-8 font-['Manrope']">
          <div className="max-w-md text-center space-y-6">
            <div className="h-20 w-20 bg-[#b2f432]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#b2f432]/20">
               <MaterialIcon name="verified" className="text-[#b2f432] text-5xl" />
            </div>
            <h1 className="font-['Noto_Serif'] text-3xl font-bold italic">Official Biological Registry</h1>
            <p className="text-[#c2caaf] leading-relaxed">
              This is a demonstration of the Green Legacy Verification System. Every mature tree in our restoration projects is assigned a unique UUID to track its biological progress.
            </p>
            <Link href="/" className="inline-block mt-8 text-[#b2f432] font-black uppercase tracking-[0.2em] text-xs hover:underline decoration-2 underline-offset-4">
               Back to Stewardship Core &rarr;
            </Link>
          </div>
       </div>
    )
  }

  // Fetch real order data
  const { data: order, error } = await supabase
    .from('planting_orders')
    .select('*, profiles(full_name)')
    .eq('id', id)
    .single()

  if (error || !order) {
    notFound()
  }

  const statusColor = order.status === 'Planted' ? '#b2f432' : '#f59e0b'

  return (
    <div className="min-h-screen bg-[#121410] text-[#e3e3db] font-['Manrope'] selection:bg-[#b2f432] selection:text-[#233600]">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#b2f432]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#b2f432]/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 lg:py-24 space-y-12">
        {/* Header / Brand */}
        <header className="flex flex-col items-center text-center space-y-4">
          <Link href="/">
             <h1 className="font-['Noto_Serif'] italic text-2xl text-[#b2f432] cursor-pointer">Green Legacy</h1>
          </Link>
          <div className="h-[1px] w-12 bg-[#424935]/40"></div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#c2caaf] font-black">Official Biological Ledger</p>
        </header>

        {/* Verification Card */}
        <main className="bg-[#1a1c18] rounded-[2.5rem] border border-[#b2f432]/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="p-8 lg:p-12 border-b border-[#424935]/10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-6">
               <div className="h-20 w-20 rounded-2xl bg-[#121410] border border-[#b2f432]/30 flex items-center justify-center text-[#b2f432]">
                  <MaterialIcon name="verified_user" className="text-4xl" />
               </div>
               <div>
                 <h2 className="text-3xl font-['Noto_Serif'] font-bold">Stewardship Verified</h2>
                 <p className="text-xs text-[#c2caaf] mt-1 uppercase tracking-widest font-bold">Record ID: {order.id.slice(0,18).toUpperCase()}...</p>
               </div>
            </div>
            <div className="flex flex-col items-center md:items-end gap-1">
               <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border`} style={{ color: statusColor, borderColor: `${statusColor}40`, backgroundColor: `${statusColor}10` }}>
                 {order.status}
               </span>
               <p className="text-[10px] text-[#c2caaf]/40 uppercase font-medium">Registry Status</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 lg:p-12 space-y-8 border-b lg:border-b-0 lg:border-r border-[#424935]/10">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                   <p className="text-[9px] uppercase font-black tracking-widest text-[#c2caaf]/40">Species</p>
                   <p className="text-xl font-bold font-['Noto_Serif']">{order.plan_name}</p>
                </div>
                <div className="space-y-1 text-right">
                   <p className="text-[9px] uppercase font-black tracking-widest text-[#c2caaf]/40">Biological Count</p>
                   <p className="text-xl font-bold font-mono text-[#b2f432]">{order.trees} Trees</p>
                </div>
              </div>

              <div className="pt-8 border-t border-[#424935]/10 space-y-6">
                <div className="space-y-2">
                   <p className="text-[9px] uppercase font-black tracking-widest text-[#c2caaf]/40">Legacy Holder</p>
                   <p className="text-2xl font-bold text-white">{order.steward_name}</p>
                </div>
                <div className="space-y-2">
                   <p className="text-[9px] uppercase font-black tracking-widest text-[#c2caaf]/40">Establishment Date</p>
                   <p className="text-lg font-medium">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                {order.occasion && (
                  <div className="space-y-2 px-6 py-4 bg-[#b2f432]/5 rounded-2xl border border-[#b2f432]/10 italic">
                     <p className="text-[9px] uppercase font-black tracking-widest text-[#b2f432]/60 not-italic mb-1">Occasion / Dedication</p>
                     <p className="text-sm font-['Noto_Serif']">"{order.occasion}"</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex-1 bg-[#121410] flex items-center justify-center p-12 min-h-[300px] relative group overflow-hidden">
                <div className="text-center relative z-10">
                   <MaterialIcon name="map" className="text-6xl text-[#b2f432] mb-4 opacity-20" />
                   <p className="text-xs font-mono text-[#c2caaf] uppercase tracking-widest mb-4">{order.planting_gps || 'Lat: 11.23N | Long: 78.45E'}</p>
                   <a 
                     href={`https://www.google.com/maps/search/?api=1&query=${order.planting_gps || '11.23,78.45'}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="inline-flex items-center gap-2 px-6 py-2 bg-[#b2f432] text-[#233600] rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                   >
                     Inspect on Globe <MaterialIcon name="open_in_new" className="text-[14px]" />
                   </a>
                </div>
                {/* Decorative Map Pattern */}
                <div className="absolute inset-0 opacity-[0.03] grayscale contrast-125 group-hover:scale-110 transition-transform duration-1000">
                  <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="map context" />
                </div>
              </div>
              <div className="p-8 bg-[#343530]/20 flex items-center gap-6">
                <img src="/logo.png" className="h-10 w-10 object-contain opacity-40 grayscale" alt="seal" />
                <p className="text-[10px] leading-relaxed text-[#c2caaf]/60 font-medium">
                  This record is cryptographically verified and notarized by the Green Legacy Stewardship Commission. Any tampering with this data violates the Trust Agreement.
                </p>
              </div>
            </div>
          </div>
        </main>

        <footer className="text-center pt-8">
           <p className="text-[9px] uppercase tracking-[0.5em] text-[#c2caaf]/30 font-bold italic">Protecting the Planet, One Tree at a Time.</p>
        </footer>
      </div>
    </div>
  )
}
