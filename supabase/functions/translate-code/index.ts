import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SDEV_SYNTAX_GUIDE = `
SDEV Language Syntax Guide:

KEYWORDS:
- forge <name> be <value> - Variable declaration (const)
- conjure <name>(<params>) :: ... ;; - Function definition
- ponder <condition> :: ... ;; - If statement
- otherwise :: ... ;; - Else clause
- cycle <condition> :: ... ;; - While loop
- iterate <var> through <iterable> :: ... ;; - For-each loop
- yield <value> - Return statement
- speak(<value>) - Print to console
- summon "<module>" - Import

BOOLEANS & NULL:
- yep - true
- nope - false  
- void - null

OPERATORS:
- also - and (&&)
- either - or (||)
- isnt - not (!)
- equals - equality (==)
- differs - not equal (!=)
- plus, minus, times, over - arithmetic

BLOCKS:
- Use :: to start a block and ;; to end it (instead of { })

OOP (Classes):
- essence <ClassName> :: ... ;; - Class definition
- birth(<params>) :: ... ;; - Constructor
- self.<property> - Instance property access
- craft <ClassName>(<args>) - Instantiate class

STRINGS:
- Double quotes: "Hello"
- Template literals: \`Hello \${name}\`
- concat() for string concatenation

ARRAYS:
- [1, 2, 3] - Array literal
- array.push(), array.pop(), array.len()
- array.map(), array.filter(), array.each()

ASYNC:
- async conjure <name>(<params>) :: ... ;;
- await <promise>
- slumber(<ms>) - Sleep function

GRAPHICS/TURTLE (if relevant):
- forward(n), backward(n), left(deg), right(deg)
- penUp(), penDown(), setColor(c), setWidth(n)
- circle(r), rect(w,h), line(x1,y1,x2,y2)

JAVASCRIPT INTEROP:
- js <single-line JS code>
- js { <multi-line JS block> }
- js ( <JS expression returning value> )

EXAMPLE TRANSLATIONS:

Python: if x > 5:
SDEV: ponder x > 5 ::

Python: def greet(name):
SDEV: conjure greet(name) ::

Python: while count < 10:
SDEV: cycle count < 10 ::

Python: for item in items:
SDEV: iterate item through items ::

Python: return result
SDEV: yield result

Python: print("Hello")
SDEV: speak("Hello")

JavaScript: const x = 5;
SDEV: forge x be 5

JavaScript: function add(a, b) { return a + b; }
SDEV: conjure add(a, b) :: yield a plus b ;;

JavaScript: if (x && y) { }
SDEV: ponder x also y :: ;;

JavaScript: class Person { }
SDEV: essence Person :: ;;
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, sourceLanguage } = await req.json();

    if (!code || !sourceLanguage) {
      return new Response(
        JSON.stringify({ error: "Missing code or sourceLanguage" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert code translator that converts code from various programming languages into SDEV, a unique programming language with its own syntax.

${SDEV_SYNTAX_GUIDE}

IMPORTANT RULES:
1. Translate ALL code constructs to their SDEV equivalents
2. Keep comments but translate them to SDEV style (// for single line)
3. Preserve the logic and structure of the original code
4. Use SDEV keywords consistently (forge, conjure, ponder, cycle, yield, etc.)
5. Use :: and ;; for blocks instead of { }
6. Use 'also' for &&, 'either' for ||, 'isnt' for !
7. Use 'yep' for true, 'nope' for false, 'void' for null
8. For complex JS operations that can't be translated, use the js keyword

OUTPUT FORMAT:
- Return ONLY the translated SDEV code
- Do NOT include explanations or markdown code blocks
- Do NOT include the original code
- Add helpful comments in SDEV to explain non-obvious translations`;

    const userPrompt = `Translate this ${sourceLanguage} code to SDEV:

\`\`\`${sourceLanguage}
${code}
\`\`\``;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const translatedCode = data.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ translatedCode }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Translation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Translation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
