'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Check session storage
    const hasSeenLoading = sessionStorage.getItem('hasSeenLoading')
    
    if (!hasSeenLoading) {
      setIsLoading(true)
      
      // Smooth progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + 2
        })
      }, 30)

      const timer = setTimeout(() => {
        setIsLoading(false)
        sessionStorage.setItem('hasSeenLoading', 'true')
      }, 2500) // Slightly longer to accommodate letters

      return () => {
        clearInterval(progressInterval)
        clearTimeout(timer)
      }
    }
  }, [])

  if (!isLoading) return null



  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 animate-fadeOut">
      <div className="text-center space-y-12">
        
        {/* Brand Logo Animation */}
        <div className="relative flex justify-center">
          <div className="animate-fadeInUp relative h-20 md:h-24">
            <img 
              src="/logo.svg" 
              alt="Green Legacy Loading..." 
              className="h-full w-auto object-contain"
            />
          </div>
        </div>

        {/* Elegant Loading Dots */}
        <div className="flex items-center justify-center space-x-3">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-72 mx-auto pt-4">
          <div className="h-[2px] bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(16,185,129,0.3)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="mt-4 text-xs font-medium tracking-[0.2em] text-emerald-700/60 uppercase">
            Sustainability starts here
          </p>
        </div>
      </div>
    </div>
  )
}
