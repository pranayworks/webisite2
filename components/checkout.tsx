"use client"

import { useEffect, useState } from "react"
import { createRazorpayOrder, verifyRazorpayPayment } from "@/app/actions/razorpay"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function Checkout({ 
  productId, 
  occasion, 
  isCsr, 
  companyName, 
  gstNumber 
}: { 
  productId: string, 
  occasion?: string | null, 
  isCsr?: boolean,
  companyName?: string,
  gstNumber?: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Load Razorpay Script
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePayment = async () => {
    setLoading(true)
    const toastId = toast.loading("Initializing secure payment...")

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please login to continue", { id: toastId })
        router.push("/login")
        return
      }

      // 1. Create Order
      const order = await createRazorpayOrder(productId, user.id, occasion, isCsr, companyName, gstNumber)

      // 2. Open Razorpay Checkout
      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Arboretum",
        description: `Planting Plan: ${productId}`,
      }

      if (order.mode === 'subscription') {
        options.subscription_id = order.id
      } else {
        options.order_id = order.id
      }

      options.handler = async function (response: any) {
        toast.loading("Verifying transaction...", { id: toastId })
        
        const result = await verifyRazorpayPayment(
          order.id,
          response.razorpay_payment_id,
          response.razorpay_signature,
          { 
            userId: user.id, 
            productId, 
            occasion: occasion || "",
            is_csr: isCsr || false,
            company_name: companyName || "",
            gst_number: gstNumber || ""
          }
        )

        if (result.success) {
          toast.success("Botanical Legacy Established!", { id: toastId })
          router.push("/dashboard")
        } else {
          toast.error(result.error || "Payment verification failed", { id: toastId })
        }
      }

      options.prefill = {
        email: user.email,
      }

      options.theme = {
        color: "#b2f432",
      }

      options.modal = {
        ondismiss: function() {
          setLoading(false)
          toast.dismiss(toastId)
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Failed to start payment", { id: toastId })
      setLoading(false)
    }
  }

  const [paymentMode, setPaymentMode] = useState<'razorpay' | 'rtgs'>('razorpay')

  const handleOfflinePayment = async () => {
    setLoading(true)
    const toastId = toast.loading("Generating Corporate Invoice...")

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please login to continue", { id: toastId })
        router.push("/login")
        return
      }

      // Simulate sending to backend to create an Invoice.
      // E.g. fetch('/api/b2b-invoice', { ... }) 
      await new Promise(res => setTimeout(res, 1500))

      toast.success("Invoice Generated. Please check your email for Bank Details.", { id: toastId })
      // For B2B, it's manually reconciled, so we push them to a pending area or dashboard directly.
      router.push("/dashboard")
      
    } catch (error: any) {
      toast.error(error.message || "Failed to generate Invoice", { id: toastId })
      setLoading(false)
    }
  }

  return (
    <div id="checkout" className="w-full flex-col flex items-center pt-8">
      {isCsr && (
        <div className="w-full max-w-md mb-6 bg-card border border-border p-1.5 rounded-xl flex">
          <button 
            onClick={() => setPaymentMode('razorpay')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${paymentMode === 'razorpay' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
          >
            Credit / Razorpay
          </button>
          <button 
            onClick={() => setPaymentMode('rtgs')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${paymentMode === 'rtgs' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
          >
            RTGS / Wire Transfer
          </button>
        </div>
      )}

      {paymentMode === 'razorpay' ? (
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full max-w-md bg-[#b2f432] text-[#233600] py-4 rounded-full font-bold text-sm uppercase tracking-widest shadow-[0_20px_40px_-5px_rgba(178,244,50,0.3)] active:scale-95 transition-all hover:bg-[#97d700] disabled:opacity-50"
        >
          {loading ? "Processing..." : "Continue to Payment Gateway"}
        </button>
      ) : (
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="bg-muted/50 w-full p-4 rounded-xl border border-border mb-4 text-center">
            <span className="material-symbols-outlined text-4xl text-accent mb-2">account_balance</span>
            <h4 className="font-bold text-sm mb-1 uppercase tracking-widest">Offline Settlement</h4>
            <p className="text-xs text-muted-foreground">Select this option to receive a Proforma Invoice with our Bank Details. Your Grove will be allotted upon successful reconciliation.</p>
          </div>
          <button
            onClick={handleOfflinePayment}
            disabled={loading}
            className="w-full bg-[#1c1c18] text-white py-4 rounded-full font-bold text-sm uppercase tracking-widest border border-[#424935] shadow-xl active:scale-95 transition-all hover:bg-[#2a2c26] disabled:opacity-50"
          >
            {loading ? "Generating Invoice..." : "Request Proforma Invoice"}
          </button>
        </div>
      )}
    </div>
  )
}
