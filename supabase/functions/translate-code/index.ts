import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SDEV_SYNTAX_GUIDE = `
SDEV Language Syntax Guide - CRITICAL: Follow these rules EXACTLY

=== VARIABLES ===
ALWAYS use "forge <name> be <value>" for variable declarations
- "forge x be 5" NOT "let x = 5" or "const x = 5"
- Variable reassignment: "x be x + 1" NOT "x = x + 1"

=== FUNCTIONS ===
ALWAYS use "conjure <name>(<params>) :: ... ;;" for function definitions
- "conjure greet(name) :: yield "Hello " + name ;;" 
- Parameters have NO types
- Use "yield" instead of "return"

=== CONDITIONALS ===
ALWAYS use "ponder <condition> :: ... ;;" for if statements
- "ponder x > 5 :: speak("big") ;;"
- Use "otherwise ::" for else (NOT "else")
- Use "otherwise ponder <condition> ::" for else-if

=== LOOPS ===
ALWAYS use "cycle <condition> :: ... ;;" for while loops
- "cycle i < 10 :: speak(i) ;; i be i + 1 ;;"
- Use "iterate <var> through <iterable> :: ... ;;" for for-each loops

=== BOOLEANS & NULL ===
- "yep" for true (NOT "true")
- "nope" for false (NOT "false")  
- "void" for null (NOT "null" or "None")

=== OPERATORS ===
- "also" for && (logical and)
- "either" for || (logical or)
- "isnt" for ! (logical not)
- "equals" for == (equality check)
- "differs" for != (not equal) - can also use "<>"
- Use standard +, -, *, / for arithmetic

=== BLOCKS ===
CRITICAL: Use "::" to START a block and ";;" to END a block
- NO curly braces { }
- Every :: must have a matching ;;

=== BUILT-IN FUNCTIONS ===
- speak(<value>) - Print to console (NOT print, console.log)
- morph(<value>, "text") - Convert to string
- morph(<value>, "num") - Convert to number
- measure(<list>) - Get length of list/string
- weave(<list>, <separator>) - Join list to string
- gather(<list>, <item>) - Push item to list
- chaos() or random() - Random number 0-1

=== MATH CONSTANTS ===
- PI - The value of pi (NOT PI(), just PI)
- TAU - 2 * PI
- E - Euler's number
- cos(angle), sin(angle), tan(angle) - Trigonometry (radians)
- root(n) - Square root

=== COMMENTS ===
- // single line comment

=== COMPLETE EXAMPLES ===

Example 1 - Hello World:
speak("Hello, World!")

Example 2 - Variables and Math:
forge radius be 5
forge area be PI * radius * radius
speak("Area: " + morph(area, "text"))

Example 3 - Function:
conjure factorial(n) ::
  ponder n <= 1 :: yield 1 ;;
  yield n * factorial(n - 1)
;;
speak(morph(factorial(5), "text"))

Example 4 - Loop with condition:
forge i be 0
cycle i < 5 ::
  ponder i % 2 equals 0 ::
    speak(morph(i, "text") + " is even")
  ;;
  otherwise ::
    speak(morph(i, "text") + " is odd")
  ;;
  i be i + 1
;;

Example 5 - List operations:
forge numbers be [1, 2, 3, 4, 5]
forge sum be 0
forge idx be 0
cycle idx < measure(numbers) ::
  sum be sum + numbers[idx]
  idx be idx + 1
;;
speak("Sum: " + morph(sum, "text"))

IMPORTANT REMINDERS:
1. NEVER use curly braces - use :: and ;;
2. NEVER use return - use yield
3. NEVER use true/false - use yep/nope
4. NEVER use print or console.log - use speak
5. Use "be" for assignment, NOT "="
6. PI is a constant, NOT a function - use "PI" not "PI()"
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

    const systemPrompt = `You are an expert code translator specializing in SDEV, a unique programming language. Your ONLY task is to convert source code into valid, working SDEV code.

${SDEV_SYNTAX_GUIDE}

CRITICAL TRANSLATION RULES:
1. EVERY variable declaration MUST use "forge <name> be <value>"
2. EVERY function MUST use "conjure <name>(<params>) :: ... ;;"  
3. EVERY if statement MUST use "ponder <condition> :: ... ;;"
4. EVERY while loop MUST use "cycle <condition> :: ... ;;"
5. EVERY return MUST use "yield <value>"
6. EVERY print/log MUST use "speak(<value>)"
7. EVERY code block MUST start with "::" and end with ";;"
8. NEVER use curly braces { } - they don't exist in SDEV
9. NEVER use "=" for assignment - ALWAYS use "be"
10. NEVER use true/false/null - use yep/nope/void
11. PI, TAU, E are CONSTANTS not functions - use "PI" not "PI()"

OUTPUT FORMAT:
- Return ONLY valid SDEV code
- NO markdown code blocks (\`\`\`)
- NO explanations before or after
- Include brief // comments only where helpful
- The output must be immediately executable in the SDEV interpreter`;

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
