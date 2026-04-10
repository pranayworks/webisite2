"use server"

import { stripe } from "@/lib/stripe"
import { supabase } from "@/lib/supabase"
import { PRODUCTS, SUBSCRIPTIONS } from "@/lib/products"

export async function startCheckoutSession(productId: string, userId: string, occasion?: string | null) {
  const allProducts = [...PRODUCTS, ...SUBSCRIPTIONS]
  const product = allProducts.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  const sessionOptions: any = {
    ui_mode: "embedded",
    redirect_on_completion: "always",
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscriptions/success?session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      userId,
      trees: product.trees.toString(),
      productId: product.id,
      occasion: occasion || "Standard Planting"
    },
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: product.mode,
  }

  // Adjust for subscriptions
  if (product.mode === "subscription" && product.interval) {
    sessionOptions.line_items[0].price_data.recurring = {
      interval: product.interval === "quarter" ? "month" : product.interval,
      interval_count: product.interval === "quarter" ? 3 : 1,
    }
  }

  const session = await stripe.checkout.sessions.create(sessionOptions)

  if (!session.client_secret) {
    throw new Error("Failed to create checkout session")
  }
  return session.client_secret
}

export async function createPortalSession(userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single()

  if (!profile?.stripe_customer_id) {
    throw new Error("No billing history found. Please make a purchase first.")
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
  })

  return session.url
}
