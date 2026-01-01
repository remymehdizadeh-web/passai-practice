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
    const { question } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating similar question for:", question.id, "category:", question.category);

    const systemPrompt = `You are an expert NCLEX question writer. Create a similar practice question based on the provided question. The new question should:
- Test the same concept/category but with a different clinical scenario
- Have the same difficulty level
- Follow NCLEX-style format (single best answer)
- Be clinically accurate and relevant

ORIGINAL QUESTION:
Category: ${question.category}
Difficulty: ${question.difficulty}
Stem: ${question.stem}
Correct Answer: ${question.correct_label}
Takeaway concept: ${question.takeaway}

You MUST respond with a JSON object using this exact function call format.`;

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
          { role: "user", content: "Generate a similar NCLEX practice question with 4 options (A, B, C, D), one correct answer, and a brief explanation." }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_question",
              description: "Create a new NCLEX-style practice question",
              parameters: {
                type: "object",
                properties: {
                  stem: {
                    type: "string",
                    description: "The question stem/scenario (2-4 sentences)"
                  },
                  options: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        label: { type: "string", enum: ["A", "B", "C", "D"] },
                        text: { type: "string" }
                      },
                      required: ["label", "text"]
                    },
                    description: "Four answer options labeled A-D"
                  },
                  correct_label: {
                    type: "string",
                    enum: ["A", "B", "C", "D"],
                    description: "The correct answer label"
                  },
                  explanation: {
                    type: "string",
                    description: "Brief explanation of why the correct answer is right (1-2 sentences)"
                  },
                  key_concept: {
                    type: "string",
                    description: "The key nursing concept being tested"
                  }
                },
                required: ["stem", "options", "correct_label", "explanation", "key_concept"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_question" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits needed." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data, null, 2));

    // Extract the function call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "create_question") {
      throw new Error("Invalid response format from AI");
    }

    const generatedQuestion = JSON.parse(toolCall.function.arguments);
    
    // Add metadata
    generatedQuestion.id = `similar-${question.id}-${Date.now()}`;
    generatedQuestion.category = question.category;
    generatedQuestion.difficulty = question.difficulty;
    generatedQuestion.is_generated = true;
    generatedQuestion.original_question_id = question.id;

    console.log("Generated question:", generatedQuestion.stem.substring(0, 50) + "...");

    return new Response(JSON.stringify({ question: generatedQuestion }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-similar error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate question" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
