"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { verifyAndRecordPlanting } from "@/app/actions/impact"
import { Button } from "@/components/ui/button"
import { CheckCircle2, TreePine, ArrowRight } from "lucide-react"
import Link from "next/link"

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get("session_id")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    if (sessionId) {
      handleVerification()
    } else {
      setStatus("error")
    }
  }, [sessionId])

  const handleVerification = async () => {
    const result = await verifyAndRecordPlanting(sessionId!)
    if (result.success) {
      setStatus("success")
    } else {
      console.error(result.error || result.message)
      setStatus("error")
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#121410] text-[#e3e3db]">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#b2f432] border-t-transparent" />
        <p className="mt-8 font-['Manrope'] text-lg tracking-widest uppercase animate-pulse">Establishing your legacy...</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#121410] px-4 text-center">
        <h1 className="font-serif text-3xl font-bold text-red-400">Something went wrong</h1>
        <p className="mt-4 text-[#c2caaf]">We couldn't verify your transaction. If payment was successful, don't worry—our team will update your account manually.</p>
        <Link href="/dashboard" className="mt-8">
          <Button variant="outline" className="border-[#424935] text-[#e3e3db] hover:bg-white/5">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#121410] px-4 text-center text-[#e3e3db]">
      <div className="relative mb-12">
        <div className="absolute inset-0 scale-150 bg-[#b2f432]/20 blur-3xl rounded-full" />
        <CheckCircle2 className="relative h-24 w-24 text-[#b2f432]" />
      </div>
      
      <h1 className="font-serif text-5xl font-bold tracking-tight md:text-6xl">
        Legacy Established
      </h1>
      
      <p className="mt-6 max-w-lg font-['Manrope'] text-lg text-[#c2caaf] leading-relaxed">
        Your contribution has been recorded in the digital arboretum. Your trees are being prepared for planting in our next drive.
      </p>

      <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
        <Link href="/dashboard">
          <Button className="bg-[#b2f432] py-6 px-10 text-lg font-bold text-[#233600] hover:bg-[#97d700] rounded-full flex items-center gap-2">
            View My Forest <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
        <Link href="/impact">
          <Button variant="ghost" className="text-[#c2caaf] hover:text-[#e3e3db] hover:bg-white/5 py-6 px-10 rounded-full flex items-center gap-2">
            <TreePine className="h-5 w-5" /> Global Impact
          </Button>
        </Link>
      </div>

      <p className="mt-20 text-[10px] uppercase tracking-widest text-[#c2caaf]/30">
        © 2026 THE DIGITAL ARBORETUM • SECURE PAYMENT VERIFIED
      </p>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#121410]">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#b2f432] border-t-transparent" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
