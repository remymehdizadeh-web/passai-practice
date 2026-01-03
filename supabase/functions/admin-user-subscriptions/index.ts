import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-USER-SUBSCRIPTIONS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin status
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const adminUser = userData.user;
    if (!adminUser) throw new Error("User not authenticated");

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", adminUser.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      throw new Error("Access denied - admin role required");
    }
    logStep("Admin verified", { userId: adminUser.id });

    // Get user emails from request body
    const { userIds } = await req.json();
    if (!userIds || !Array.isArray(userIds)) {
      throw new Error("userIds array required");
    }
    logStep("Fetching subscriptions for users", { count: userIds.length });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get all users' emails
    const { data: users, error: usersError } = await supabaseClient.auth.admin.listUsers();
    if (usersError) throw usersError;

    const emailMap = new Map<string, string>();
    users.users.forEach(u => {
      if (u.email) emailMap.set(u.id, u.email);
    });

    // Check subscription status for each user
    const subscriptionStatuses: Record<string, { subscribed: boolean; tier: string | null }> = {};

    for (const userId of userIds) {
      const email = emailMap.get(userId);
      if (!email) {
        subscriptionStatuses[userId] = { subscribed: false, tier: null };
        continue;
      }

      try {
        const customers = await stripe.customers.list({ email, limit: 1 });
        if (customers.data.length === 0) {
          subscriptionStatuses[userId] = { subscribed: false, tier: null };
          continue;
        }

        const customerId = customers.data[0].id;
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: "active",
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          const sub = subscriptions.data[0];
          const priceId = sub.items.data[0]?.price?.id;
          // Determine tier based on price
          let tier = "pro";
          if (priceId === "price_1Skv5UPiNbm75vyPgDiVlJzT") tier = "weekly";
          else if (priceId === "price_1Skv5gPiNbm75vyPZEiE8GAR") tier = "monthly";
          
          subscriptionStatuses[userId] = { 
            subscribed: true, 
            tier: sub.status === "trialing" ? "trial" : tier
          };
        } else {
          subscriptionStatuses[userId] = { subscribed: false, tier: null };
        }
      } catch (err) {
        logStep("Error checking user subscription", { userId, error: String(err) });
        subscriptionStatuses[userId] = { subscribed: false, tier: null };
      }
    }

    logStep("Subscriptions fetched", { count: Object.keys(subscriptionStatuses).length });

    return new Response(JSON.stringify({ subscriptions: subscriptionStatuses }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
