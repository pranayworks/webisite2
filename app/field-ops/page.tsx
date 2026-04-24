'use client'

import React, { useState, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default function FieldOpsPortal() {
  const [orderId, setOrderId] = useState('')
  const [status, setStatus] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [gps, setGps] = useState<{ lat: number, lng: number } | null>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  
  const supabase = createClientComponentClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const captureGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setStatus('GPS Location acquired!')
      }, (err) => {
        setStatus(`GPS Error: ${err.message}`)
      })
    } else {
      setStatus('Geolocation not available on this device.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId) return setStatus('Please enter an Order ID first.')
    if (!photo) return setStatus('Please capture a sapling photo.')
    if (!gps) return setStatus('GPS coords are required. Tap "Capture GPS".')

    setIsUploading(true)
    setStatus('Uploading field update...')

    try {
      // 1. Upload photo to 'field_updates' storage bucket
      const fileExt = photo.name.split('.').pop()
      const fileName = `${orderId}-${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images') // Usually 'images' or 'public' is configured, let's use a generic assumption or existing bucket
        .upload(`field_updates/${fileName}`, photo)

      if (uploadError) throw new Error(`Upload Failed: ${uploadError.message}`)

      const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(`field_updates/${fileName}`)

      // 2. We can update the planting_orders table (change status to 'Planted' and append gps)
      //    Or insert a new record into a growth tracker depending on the architecture. Let's update planting_orders.
      const { error: dbError } = await supabase
        .from('planting_orders')
        .update({
          status: 'Planted',
          location_gps: `${gps.lat.toFixed(6)}, ${gps.lng.toFixed(6)}`,
          // If we had an image URL column, we'd save it here. You can add it later to the schema.
        })
        .eq('id', orderId)

      if (dbError) throw new Error(`DB Update Failed: ${dbError.message}`)

      setStatus('Success! Tree registered on the global map.')
      setOrderId('')
      setGps(null)
      setPhoto(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      
    } catch (err: any) {
      setStatus(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#121410] text-[#e3e3db] font-['Manrope'] selection:bg-[#b2f432] selection:text-[#233600] flex flex-col p-6">
      <header className="mb-8 pt-4">
        <Link href="/">
          <h1 className="font-['Noto_Serif'] italic text-2xl text-[#b2f432]">Field Operations</h1>
        </Link>
        <p className="text-[#c2caaf] text-xs uppercase tracking-widest mt-1">Stewardship Portal Mobile</p>
      </header>

      <main className="flex-1 max-w-sm mx-auto w-full">
        {status && (
          <div className="bg-[#b2f432]/10 border border-[#b2f432]/30 text-[#b2f432] p-4 rounded-xl text-sm mb-6 font-medium">
            {status}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#1a1c18] border border-[#424935]/20 p-5 rounded-2xl">
            <label className="block text-xs uppercase tracking-widest text-[#c2caaf] mb-2 font-bold focus-within:text-[#b2f432]">Order ID Hash</label>
            <input 
              type="text" 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. 1a2b3c4d"
              className="w-full bg-transparent border-b border-[#424935] text-xl py-2 focus:outline-none focus:border-[#b2f432] placeholder-[#424935]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={captureGPS}
              className={`p-4 rounded-2xl border flex flex-col justify-center items-center gap-2 transition-all ${gps ? 'bg-[#b2f432]/10 border-[#b2f432]/50 text-[#b2f432]' : 'bg-[#1a1c18] border-[#424935]/20 text-[#c2caaf] hover:border-[#b2f432]/50'}`}
            >
              <span className="material-symbols-outlined text-3xl">{gps ? 'pin_drop' : 'location_searching'}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-center">{gps ? 'Loc Locked' : 'Capture GPS'}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-2xl border flex flex-col justify-center items-center gap-2 transition-all ${photo ? 'bg-[#b2f432]/10 border-[#b2f432]/50 text-[#b2f432]' : 'bg-[#1a1c18] border-[#424935]/20 text-[#c2caaf] hover:border-[#b2f432]/50'}`}
            >
              <span className="material-symbols-outlined text-3xl">{photo ? 'image' : 'camera_alt'}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-center">{photo ? 'Img Ready' : 'Take Photo'}</span>
            </button>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            />
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-5 bg-[#b2f432] text-[#233600] rounded-2xl font-bold uppercase tracking-[0.2em] shadow-[0_10px_30px_-10px_rgba(178,244,50,0.3)] active:scale-95 transition-all flex justify-center items-center gap-2 mt-4"
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-[#233600] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined">cloud_upload</span>
                Sync Entry
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  )
}
