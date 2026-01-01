import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, selectedLabel, userMessage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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