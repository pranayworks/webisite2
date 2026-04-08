"use server"

import { stripe } from "@/lib/stripe"
import { PRODUCTS, SUBSCRIPTIONS } from "@/lib/products"

export async function startCheckoutSession(productId: string, userId: string) {
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
      productId: product.id
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
