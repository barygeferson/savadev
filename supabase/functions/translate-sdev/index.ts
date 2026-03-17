import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SDEV_KEYWORDS = `
SDEV IS A PROGRAMMING LANGUAGE WITH THESE EXACT ENGLISH KEYWORDS:
- forge <name> be <value>        → variable declaration  
- <name> be <value>              → assignment
- conjure <name>(<params>) :: ... ;; → function declaration
- yield <value>                  → return
- ponder <cond> :: ... ;;        → if
- otherwise ponder <cond> :: ;; → else if
- otherwise :: ... ;;            → else
- cycle <cond> :: ... ;;         → while loop
- iterate <var> through <expr> :: ... ;; → for-each loop
- within <var> be <list> :: ... ;; → for-in loop
- yeet                           → break
- skip                           → continue
- speak(...)                     → print / console.log
- essence <Name> :: ... ;;       → class
- extend                         → inheritance
- self                           → this
- super                          → parent class
- new <Class>(...)               → instantiate
- attempt :: ... ;; rescue <err> :: ... ;; → try/catch
- also                           → and
- either                         → or
- isnt                           → not
- equals                         → ==
- differs                        → !=
- yep                            → true
- nope                           → false
- void                           → null
- summon "<path>"                → import
- async conjure                  → async function
- await <expr>                   → await
- spawn(fn)                      → async task
- #                              → comment (single line)
- <cond> ~ <then> : <else>       → ternary
- |>                             → pipe operator
- ::;;                           → empty dict literal
`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { code, sourceLanguage } = await req.json();

    if (!code || typeof code !== "string") {
      return new Response(JSON.stringify({ error: "No code provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const langHint = sourceLanguage && sourceLanguage !== "auto"
      ? `The code is written in ${sourceLanguage}.`
      : "The code may be written in any human language.";

    const systemPrompt = `You are a translator for the sdev programming language. Your job is to translate sdev code written in any human language (Spanish, French, German, Portuguese, Japanese, Arabic, Russian, Chinese, etc.) into sdev code written with ENGLISH keywords and identifiers.

${SDEV_KEYWORDS}

TRANSLATION RULES — follow them strictly:
1. Translate ALL keywords, identifiers, variable names, function names, and string contents to their English equivalents.
2. Preserve the EXACT sdev syntax structure: ::, ;;, ->, |>, etc. Do NOT change any operators or delimiters.
3. Translate comments (lines starting with #) to English.
4. Translate string literals to English, keeping their meaning.
5. If an identifier is already in English, leave it as-is.
6. If a keyword in another language maps to a sdev keyword, use the sdev keyword (e.g. Spanish "ciclo" → "cycle", "forjar" → "forge").
7. Do NOT add explanations, markdown code blocks, or any extra text.
8. Return ONLY the translated sdev source code, nothing else.
9. Preserve all whitespace, indentation, and line structure.
10. If the code is already 100% in English sdev, return it unchanged.`;

    const userPrompt = `${langHint} Please translate this sdev code to English sdev:

${code}`;

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
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "AI rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const translated = data.choices?.[0]?.message?.content ?? "";

    // Detect what language was used (ask AI to identify)
    const detectResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: "You detect the human language used in source code (variable names, comments, strings). Reply with ONLY the language name in English (e.g. 'Spanish', 'French', 'English', 'Japanese'). One word only.",
          },
          { role: "user", content: code.substring(0, 500) },
        ],
        stream: false,
      }),
    });

    let detectedLanguage = "Unknown";
    if (detectResponse.ok) {
      const detectData = await detectResponse.json();
      detectedLanguage = (detectData.choices?.[0]?.message?.content ?? "Unknown").trim().replace(/[.,"']/g, "");
    }

    return new Response(
      JSON.stringify({ translated, detectedLanguage, original: code }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("translate-sdev error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
