"use server"

import { stripe } from "@/lib/stripe"
import { PRODUCTS, SUBSCRIPTIONS } from "@/lib/products"

export async function startCheckoutSession(productId: string) {
  const allProducts = [...PRODUCTS, ...SUBSCRIPTIONS]
  const product = allProducts.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  // priceInCents already represents the smallest currency unit (paisa for INR)
  if (product.mode === "subscription" && product.interval) {
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      redirect_on_completion: "never",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.priceInCents,
            recurring: {
              interval: product.interval === "quarter" ? "month" : product.interval,
              interval_count: product.interval === "quarter" ? 3 : 1,
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
    })
    if (!session.client_secret) {
      throw new Error("Failed to create checkout session")
    }
    return session.client_secret
  }

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
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
    mode: "payment",
  })

  if (!session.client_secret) {
    throw new Error("Failed to create checkout session")
  }
  return session.client_secret
}
