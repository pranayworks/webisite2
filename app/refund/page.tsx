import React from "react"
import Link from "next/link"

const MaterialIcon = ({ name, className = "" }: { name: string, className?: string }) => (
  <span className={`material-symbols-outlined shrink-0 ${className}`} style={{ fontSize: 'inherit' }}>
    {name}
  </span>
)

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#121410] text-[#e3e3db] font-['Manrope'] selection:bg-[#b2f432] selection:text-[#233600]">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#121410]/70 backdrop-blur-xl border-b border-[#424935]/10 flex justify-between items-center px-8 h-20">
        <Link href="/" className="flex items-center gap-3 text-[#c2caaf] hover:text-[#b2f432] transition-colors">
          <MaterialIcon name="arrow_back" />
          <span className="font-bold text-xs uppercase tracking-widest">Back to Home</span>
        </Link>
        <Link href="/">
          <h1 className="font-['Noto_Serif'] italic text-xl text-[#b2f432]">Green Legacy</h1>
        </Link>
      </header>

      <main className="pt-32 pb-20 px-8 max-w-3xl mx-auto">
        <header className="mb-16">
          <div className="text-[10px] text-[#b2f432] font-bold uppercase tracking-[0.5em] mb-4">Financial Protocol</div>
          <h2 className="font-['Noto_Serif'] text-5xl font-bold">Refund & Cancellation Policy</h2>
          <p className="text-[#c2caaf] mt-4 text-sm font-bold uppercase tracking-widest">Version: 1.2 • April 16, 2026</p>
        </header>

        <section className="space-y-12 leading-relaxed text-[#c2caaf]">
          <div className="space-y-4">
            <h3 className="font-['Noto_Serif'] text-2xl font-bold text-[#e3e3db]">1. Plantation Commitment</h3>
            <p>Once a planting sequence is initiated, the funds are immediately allocated to our partner nurseries and field labor for sapling procurement and land preparation. Therefore, payments for successful plantation orders are generally non-refundable once the physical work begins.</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-['Noto_Serif'] text-2xl font-bold text-[#e3e3db]">2. Cancellation Window</h3>
            <p>You may request a cancellation of your order within 24 hours of payment, provided the sapling has not yet been established. If the cancellation is approved, a full refund will be issued to your original payment method (Razorpay/Stripe) within 5-7 business days.</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-['Noto_Serif'] text-2xl font-bold text-[#e3e3db]">3. Subscription Management</h3>
            <p>Subscription plans (Annual/Monthly Stewardship) can be cancelled at any time through your Billing Dashboard. Cancellation stops future billing, but past payments are non-refundable as they have already been committed to the maintenance of your existing forest grove.</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-['Noto_Serif'] text-2xl font-bold text-[#e3e3db]">4. Failed Transactions & Auto-Refunds</h3>
            <p>In the event of a technical failure where a payment is deducted but an order is not recorded, our system will automatically initiate a refund within 48-72 hours. The refund will be credited back to the original source of payment (Bank Account/Card/UPI).</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-['Noto_Serif'] text-2xl font-bold text-[#e3e3db]">5. Contact for Support</h3>
            <p>For any issues related to cancellations or refunds, please reach out to our support team directly. We are committed to resolving all financial queries within 48 hours of receipt.</p>
            <div className="bg-[#1a1c18] p-6 rounded-2xl border border-[#424935]/20 space-y-2 mt-4 text-sm">
                <p><span className="text-[#b2f432] font-bold">Email:</span> greenlegacy.org@gmail.com</p>
                <p><span className="text-[#b2f432] font-bold">WhatsApp Support:</span> +91 8074935169</p>
            </div>
          </div>
        </section>

        <section className="mt-20 bg-[#1a1c18] p-10 rounded-[2.5rem] border border-[#b2f432]/20 flex flex-col items-center text-center space-y-6">
          <MaterialIcon name="verified_user" className="text-5xl text-[#b2f432]" />
          <h3 className="font-['Noto_Serif'] text-2xl font-bold">Guaranteed Stewardship</h3>
          <p className="max-w-md mx-auto text-sm text-[#c2caaf]">We are committed to total transparency. If we cannot fulfill a planting for any biological reason, we will provide an alternative site or a full credit toward future legacy initiatives.</p>
        </section>
      </main>
    </div>
  )
}
