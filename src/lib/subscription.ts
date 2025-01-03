import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { userSubscriptions } from "./db/schema";
import { eq } from "drizzle-orm";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const checkSubscription = async () => {
  // Step 1: Check if the user is authenticated
  const { userId } = await auth();
  
  if (!userId) {
    console.log("No userId found. Returning false.");
    return false;  // No user authenticated
  }

  // Step 2: Fetch subscriptions from the database
  const _userSubscriptions = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId));

  

  if (!_userSubscriptions[0]) {
    console.log("No subscriptions found. Returning false.");
    return false;  // No subscriptions found
  }

  const userSubscription = _userSubscriptions[0];

  // Step 3: Log subscription details
 

  // Step 4: Check if stripeCurrentPeriodEnd exists and is valid
  const isValid =
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd &&
    userSubscription.stripeCurrentPeriodEnd.getTime() + DAY_IN_MS > Date.now();



  return !!isValid;
};
