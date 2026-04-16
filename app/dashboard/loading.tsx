import React from "react"

export default function DashboardLoading() {
  return (
    <div className="p-4 md:p-8 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#30363d]/30 pb-6">
        <div className="space-y-3">
          <div className="h-8 w-48 bg-[#30363d]/40 rounded-lg"></div>
          <div className="h-4 w-64 bg-[#30363d]/20 rounded-md"></div>
        </div>
        <div className="h-10 w-32 bg-[#30363d]/40 rounded-full"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#1e201c]/70 border border-[#30363d]/30 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 bg-[#30363d]/20 rounded"></div>
              <div className="h-4 w-4 bg-[#b2f432]/10 rounded-full"></div>
            </div>
            <div className="h-8 w-16 bg-[#30363d]/40 rounded"></div>
            <div className="h-3 w-32 bg-[#30363d]/10 rounded"></div>
          </div>
        ))}
      </div>

      {/* Large Block Skeleton (Map Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#1e201c]/70 border border-[#30363d]/30 rounded-2xl h-[500px] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#30363d]/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
          <div className="h-24 w-24 rounded-full bg-[#30363d]/20"></div>
        </div>
        
        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <div className="bg-[#1e201c]/70 border border-[#30363d]/30 rounded-2xl p-6 h-[500px] space-y-6">
            <div className="h-5 w-32 bg-[#30363d]/40 rounded"></div>
            <div className="space-y-4">
               {[1, 2, 3, 4, 5].map((i) => (
                 <div key={i} className="flex gap-4 items-center">
                   <div className="h-10 w-10 rounded-full bg-[#30363d]/20 shrink-0"></div>
                   <div className="space-y-2 flex-1">
                     <div className="h-3 w-full bg-[#30363d]/20 rounded"></div>
                     <div className="h-2 w-2/3 bg-[#30363d]/10 rounded"></div>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}
