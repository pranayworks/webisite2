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

export default function Checkout({ productId, occasion, isCsr }: { productId: string, occasion?: string | null, isCsr?: boolean }) {
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
      const order = await createRazorpayOrder(productId, user.id, occasion)

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
          order.id, // This will be either orderId or subscriptionId
          response.razorpay_payment_id,
          response.razorpay_signature,
          { userId: user.id, productId, occasion: occasion || "" }
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

  return (
    <div id="checkout" className="w-full flex justify-center pt-8">
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full max-w-md bg-[#b2f432] text-[#233600] py-4 rounded-full font-bold text-sm uppercase tracking-widest shadow-[0_20px_40px_-5px_rgba(178,244,50,0.3)] active:scale-95 transition-all hover:bg-[#97d700] disabled:opacity-50"
      >
        {loading ? "Processing..." : "Continue to Payment"}
      </button>
    </div>
  )
}
