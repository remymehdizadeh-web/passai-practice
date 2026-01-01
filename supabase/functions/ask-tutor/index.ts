import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DAILY_LIMIT = 20; // Max tutor requests per day

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, selectedLabel, userMessage, sessionId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Check rate limit
    const today = new Date().toISOString().split('T')[0];
    const { data: usageData } = await supabase
      .from('ai_tutor_usage')
      .select('request_count')
      .eq('session_id', sessionId)
      .eq('usage_date', today)
      .single();

    if (usageData && usageData.request_count >= DAILY_LIMIT) {
      return new Response(
        JSON.stringify({ error: "Daily tutor limit reached. Try again tomorrow!" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check cache for common questions
    const queryHash = `${question.id}-${selectedLabel}-${userMessage.toLowerCase().trim().slice(0, 50)}`;
    const { data: cachedResponse } = await supabase
      .from('ai_tutor_cache')
      .select('response')
      .eq('question_id', question.id)
      .eq('query_hash', queryHash)
      .single();

    if (cachedResponse) {
      console.log("Returning cached response");
      // Update usage
      await updateUsage(supabase, sessionId, today, usageData?.request_count);
      
      // Return cached as streaming format
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const chunk = `data: ${JSON.stringify({
            choices: [{ delta: { content: cachedResponse.response } }]
          })}\n\n`;
          controller.enqueue(encoder.encode(chunk));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Update usage counter
    await updateUsage(supabase, sessionId, today, usageData?.request_count);

    const isCorrect = selectedLabel === question.correct_label;
    const selectedOption = question.options.find((o: any) => o.label === selectedLabel);
    const correctOption = question.options.find((o: any) => o.label === question.correct_label);

    const systemPrompt = `You are an expert NCLEX tutor helping a nursing student understand a practice question. Be concise, clinical, and supportive.

QUESTION CONTEXT:
Question: ${question.stem}

Options:
${question.options.map((o: any) => `${o.label}. ${o.text}`).join('\n')}

Student selected: ${selectedLabel}. ${selectedOption?.text || ''}
Correct answer: ${question.correct_label}. ${correctOption?.text || ''}
Student was: ${isCorrect ? 'CORRECT' : 'INCORRECT'}

Key rationale: ${question.rationale_bullets?.slice(0, 2).join(' ') || ''}
Takeaway: ${question.takeaway}
Category: ${question.category}

RULES:
- Keep responses under 150 words
- Be encouraging but honest
- Focus on clinical reasoning and test-taking strategy
- If asked about why an answer is wrong, explain the specific error
- Provide memory tricks or mnemonics when helpful
- Never make up clinical facts - if uncertain, say so
- Reference the specific question context in your answers`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cache common questions after response (simplified - would need to collect full response)
    // For now, just stream through

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("ask-tutor error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function updateUsage(supabase: any, sessionId: string, today: string, currentCount?: number) {
  if (currentCount) {
    await supabase
      .from('ai_tutor_usage')
      .update({ request_count: currentCount + 1 })
      .eq('session_id', sessionId)
      .eq('usage_date', today);
  } else {
    await supabase
      .from('ai_tutor_usage')
      .insert({ session_id: sessionId, usage_date: today, request_count: 1 });
  }
}