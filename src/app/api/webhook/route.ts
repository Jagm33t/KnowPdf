import { db } from "@/lib/db";
import { userSubscriptions } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();

  // Resolve headers promise and get the Stripe-Signature
  const requestHeaders = await headers();
  const signature = requestHeaders.get("Stripe-Signature");

  if (!signature) {
    console.error("Missing Stripe-Signature header");
    return new NextResponse("Missing Stripe-Signature header", { status: 400 });
  }

  console.log("Received Stripe webhook");
  console.log("Request body:", body);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SIGNING_SECRET as string
    );
    console.log("Webhook event verified:", event.type);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return new NextResponse("Webhook error", { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    console.log("Handling 'checkout.session.completed' event");
    console.log("Session object:", session);

    try {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      console.log("Subscription retrieved:", subscription);

      if (!session?.metadata?.userId) {
        console.error("Missing userId in session metadata");
        return new NextResponse("No userId in session metadata", { status: 400 });
      }

      await db.insert(userSubscriptions).values({
        userId: session.metadata.userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      });
      console.log("User subscription record inserted into database");
    } catch (error) {
      console.error("Error handling 'checkout.session.completed':", error);
      return new NextResponse("Database insertion error", { status: 500 });
    }
  }

  if (event.type === "invoice.payment_succeeded") {
    console.log("Handling 'invoice.payment_succeeded' event");
    console.log("Session object:", session);

    try {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      console.log("Subscription retrieved:", subscription);

      await db
        .update(userSubscriptions)
        .set({
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        })
        .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));
      console.log("User subscription record updated in database");
    } catch (error) {
      console.error("Error handling 'invoice.payment_succeeded':", error);
      return new NextResponse("Database update error", { status: 500 });
    }
  }

  return new NextResponse(null, { status: 200 });
}
