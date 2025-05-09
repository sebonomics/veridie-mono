import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"
import { getStripe } from "./stripe"

// Create a Supabase client for server components
export function createClient() {
  return createServerComponentClient<Database>({ cookies })
}

// Create a Supabase admin client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
}

export const supabaseAdmin = createSupabaseClient(supabaseUrl || "", supabaseServiceKey || "")

// Stripe Connect functions for server-side operations
export async function createStripeConnectAccount(userId: string, email: string, name: string) {
  try {
    console.log("Creating Stripe Connect account for:", userId, email, name)

    // Validate inputs
    if (!userId) throw new Error("User ID is required")
    if (!email) throw new Error("Email is required")

    // Verify Stripe is initialized
    const stripe = getStripe()
    if (!stripe) {
      throw new Error("Stripe is not initialized - missing STRIPE_SECRET_KEY")
    }

    // Verify Supabase admin is initialized
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client is not initialized")
    }

    // Check if mentor already has a Stripe Connect account
    let existingAccount
    try {
      const { data, error: fetchError } = await supabaseAdmin
        .from("mentors")
        .select("stripe_connect_accounts")
        .eq("id", userId)
        .single()

      if (fetchError) {
        // Check if it's a "no rows returned" error
        if (fetchError.code === "PGRST116") {
          console.log("No mentor record found, will create one")

          // Create a mentor record if it doesn't exist
          const { error: insertError } = await supabaseAdmin.from("mentors").insert([{ id: userId }])

          if (insertError) {
            console.error("Error creating mentor record:", insertError)
            throw new Error(`Failed to create mentor record: ${insertError.message}`)
          }
        } else {
          // Real error
          console.error("Error fetching existing account:", fetchError)
          throw new Error(`Database error: ${fetchError.message}`)
        }
      } else {
        existingAccount = data
      }
    } catch (error) {
      if (error instanceof Error) throw error
      throw new Error("Failed to check for existing Stripe account")
    }

    let account

    // If account exists, retrieve it from Stripe
    if (existingAccount?.stripe_connect_accounts) {
      console.log("Found existing Stripe account:", existingAccount.stripe_connect_accounts)
      try {
        account = await stripe.accounts.retrieve(existingAccount.stripe_connect_accounts)
      } catch (stripeError: any) {
        console.error("Error retrieving Stripe account:", stripeError)

        // If the account doesn't exist in Stripe anymore, create a new one
        if (stripeError.code === "account_invalid") {
          console.log("Stripe account no longer exists, creating a new one")
        } else {
          throw new Error(`Stripe API error: ${stripeError.message}`)
        }
      }
    }

    // Create new account if needed
    if (!account) {
      console.log("Creating new Stripe Connect account")
      try {
        // Create new Stripe Connect account
        account = await stripe.accounts.create({
          type: "express",
          country: "US", // Default to US, can be changed by user during onboarding
          email,
          business_type: "individual",
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          business_profile: {
            name: name || "College Consultant",
            url: process.env.NEXT_PUBLIC_BASE_URL,
          },
        })

        console.log("Created Stripe account:", account.id)
      } catch (stripeError: any) {
        console.error("Error creating Stripe account:", stripeError)
        throw new Error(`Stripe API error: ${stripeError.message}`)
      }

      // Update mentor record with Stripe Connect account ID
      try {
        const { error: updateError } = await supabaseAdmin
          .from("mentors")
          .update({
            stripe_connect_accounts: account.id,
            stripe_account_details_submitted: account.details_submitted,
            stripe_account_charges_enabled: account.charges_enabled,
            stripe_account_payouts_enabled: account.payouts_enabled,
          })
          .eq("id", userId)

        if (updateError) {
          console.error("Error updating mentor record:", updateError)
          throw new Error(`Database error: ${updateError.message}`)
        }
      } catch (error) {
        if (error instanceof Error) throw error
        throw new Error("Failed to update mentor record with Stripe account")
      }
    }

    return { account, error: null }
  } catch (error) {
    console.error("Error creating Stripe Connect account:", error)
    return { account: null, error }
  }
}

// Create Stripe Connect account link for onboarding
export async function createStripeConnectAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
  try {
    console.log("Creating account link for:", accountId)
    console.log("Refresh URL:", refreshUrl)
    console.log("Return URL:", returnUrl)

    // Validate inputs
    if (!accountId) throw new Error("Account ID is required")
    if (!refreshUrl) throw new Error("Refresh URL is required")
    if (!returnUrl) throw new Error("Return URL is required")

    const stripe = getStripe()
    if (!stripe) {
      throw new Error("Stripe is not initialized - missing STRIPE_SECRET_KEY")
    }

    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: "account_onboarding",
      })

      console.log("Created account link:", accountLink.url)
      return { url: accountLink.url, error: null }
    } catch (stripeError: any) {
      console.error("Stripe API error creating account link:", stripeError)
      throw new Error(`Stripe API error: ${stripeError.message}`)
    }
  } catch (error) {
    console.error("Error creating Stripe Connect account link:", error)
    return { url: null, error }
  }
}

// Get Stripe Connect account
export async function getStripeConnectAccount(userId: string) {
  try {
    // Get account ID from database
    const { data, error } = await supabaseAdmin
      .from("mentors")
      .select(
        "stripe_connect_accounts, stripe_account_details_submitted, stripe_account_charges_enabled, stripe_account_payouts_enabled",
      )
      .eq("id", userId)
      .single()

    if (error) {
      throw error
    }

    if (!data.stripe_connect_accounts) {
      return { account: null, error: null }
    }

    // Get latest account details from Stripe
    const stripe = getStripe()
    if (!stripe) {
      throw new Error("Stripe is not initialized")
    }

    const stripeAccount = await stripe.accounts.retrieve(data.stripe_connect_accounts)

    // Update database with latest status
    if (
      stripeAccount.details_submitted !== data.stripe_account_details_submitted ||
      stripeAccount.charges_enabled !== data.stripe_account_charges_enabled ||
      stripeAccount.payouts_enabled !== data.stripe_account_payouts_enabled
    ) {
      await supabaseAdmin
        .from("mentors")
        .update({
          stripe_account_details_submitted: stripeAccount.details_submitted,
          stripe_account_charges_enabled: stripeAccount.charges_enabled,
          stripe_account_payouts_enabled: stripeAccount.payouts_enabled,
        })
        .eq("id", userId)
    }

    return {
      account: {
        id: stripeAccount.id,
        details_submitted: stripeAccount.details_submitted,
        charges_enabled: stripeAccount.charges_enabled,
        payouts_enabled: stripeAccount.payouts_enabled,
      },
      error: null,
    }
  } catch (error) {
    console.error("Error getting Stripe Connect account:", error)
    return { account: null, error }
  }
}

// Add service with Stripe product
export async function addService(
  mentorId: string,
  serviceData: {
    name: string
    description: string
    price: number
    calendlyEventTypeUri?: string
  },
) {
  try {
    // Get mentor's Stripe Connect account ID
    const { data: mentor, error: mentorError } = await supabaseAdmin
      .from("mentors")
      .select("stripe_connect_accounts")
      .eq("id", mentorId)
      .single()

    if (mentorError || !mentor) {
      throw new Error("Failed to fetch mentor profile")
    }

    const stripeConnectAccountId = mentor.stripe_connect_accounts

    if (!stripeConnectAccountId) {
      throw new Error("Mentor has not connected their Stripe account")
    }

    // Create product in Stripe
    const stripe = getStripe()
    if (!stripe) {
      throw new Error("Stripe is not initialized")
    }

    const product = await stripe.products.create({
      name: serviceData.name,
      description: serviceData.description,
    })

    // Create price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(serviceData.price * 100), // Convert to cents
      currency: "usd",
    })

    // Add service to database with Stripe product and price IDs
    const { data, error } = await supabaseAdmin
      .from("services")
      .insert([
        {
          mentor_id: mentorId,
          name: serviceData.name,
          description: serviceData.description,
          price: serviceData.price,
          stripe_product_id: product.id,
          stripe_price_id: price.id,
          calendly_event_type_uri: serviceData.calendlyEventTypeUri,
        },
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error adding service:", error)
    return { data: null, error }
  }
}

// Delete service and associated Stripe product
export async function deleteService(serviceId: string) {
  try {
    // Get service details
    const { data: service, error: fetchError } = await supabaseAdmin
      .from("services")
      .select("stripe_product_id")
      .eq("id", serviceId)
      .single()

    if (fetchError) {
      console.error("Error fetching service:", fetchError)
      return { data: null, error: fetchError }
    }

    // Delete product in Stripe if it exists
    if (service?.stripe_product_id) {
      try {
        const stripe = getStripe()
        if (stripe) {
          await stripe.products.update(service.stripe_product_id, { active: false })
          console.log(`Deactivated Stripe product: ${service.stripe_product_id}`)
        } else {
          console.warn("Stripe not initialized, skipping product deactivation")
        }
      } catch (stripeError) {
        console.error("Error deactivating Stripe product:", stripeError)
        // Continue with database deletion even if Stripe update fails
      }
    }

    // Delete service from database
    const { data, error } = await supabaseAdmin.from("services").delete().eq("id", serviceId).select()

    if (error) {
      console.error("Error deleting service from database:", error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Unexpected error in deleteService:", error)
    return {
      data: null,
      error: error instanceof Error ? { message: error.message } : { message: "Unknown error occurred" },
    }
  }
}

// Add getMentorProfile function if it doesn't exist
export async function getMentorProfile(mentorId: string) {
  try {
    const { data, error } = await supabaseAdmin.from("mentors").select("*, profiles(*)").eq("id", mentorId).single()

    if (error) {
      console.error("Error fetching mentor profile:", error)
      return { mentor: null, error }
    }

    return { mentor: data, error: null }
  } catch (error) {
    console.error("Error in getMentorProfile:", error)
    return { mentor: null, error }
  }
}
