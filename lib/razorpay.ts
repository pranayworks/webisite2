import Razorpay from "razorpay"

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn("Razorpay API keys are missing. Payments will not work.")
}

export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummy",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
})
