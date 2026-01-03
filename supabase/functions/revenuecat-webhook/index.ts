import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REVENUECAT-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    // Verify the webhook secret
    const authHeader = req.headers.get('Authorization');
    const expectedSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
    
    if (!expectedSecret) {
      logStep("ERROR: REVENUECAT_WEBHOOK_SECRET not configured");
      return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // RevenueCat sends the secret in Authorization header
    // Could be "Bearer <secret>" or just "<secret>"
    const providedSecret = authHeader?.replace('Bearer ', '').trim();
    
    logStep("Auth comparison", { 
      authHeaderReceived: authHeader ? `${authHeader.substring(0, 10)}...` : 'null',
      expectedLength: expectedSecret.length,
      providedLength: providedSecret?.length || 0
    });
    
    if (providedSecret !== expectedSecret) {
      logStep("ERROR: Invalid webhook secret", {
        match: providedSecret === expectedSecret
      });
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    logStep("Webhook secret verified");

    // Parse the webhook payload
    const payload = await req.json();
    logStep("Payload received", { event_type: payload.event?.type });

    const event = payload.event;
    if (!event) {
      logStep("ERROR: No event in payload");
      return new Response(JSON.stringify({ error: 'No event in payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client with service role for inserting data
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Map RevenueCat event to our database structure
    const subscriptionEvent = {
      event_id: event.id,
      event_type: event.type,
      user_id: event.app_user_id,
      product_id: event.product_id,
      store: event.store,
      environment: event.environment,
      is_trial: event.period_type === 'TRIAL',
      price: event.price ? parseFloat(event.price) : null,
      currency: event.currency,
      expiration_at: event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null,
      original_purchase_date: event.original_purchase_date_ms 
        ? new Date(event.original_purchase_date_ms).toISOString() 
        : null,
      raw_payload: payload,
    };

    logStep("Inserting subscription event", { 
      event_type: subscriptionEvent.event_type,
      user_id: subscriptionEvent.user_id,
      product_id: subscriptionEvent.product_id 
    });

    // Insert the event into the database
    const { error: insertError } = await supabaseClient
      .from('subscription_events')
      .insert(subscriptionEvent);

    if (insertError) {
      logStep("ERROR: Failed to insert event", { error: insertError.message });
      return new Response(JSON.stringify({ error: 'Failed to store event' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    logStep("Event stored successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR: Unexpected error", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
