import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SDEV_SYSTEM_PROMPT = `You are SDev Assistant, an expert AI that knows everything about the SDEV programming language. You help users learn sdev, write code, debug issues, and build complete projects.

## SDEV LANGUAGE COMPLETE REFERENCE

### Variables
- Declaration: \`forge <name> be <value>\`
- Reassignment: \`<name> be <newValue>\`
- Example: \`forge x be 5\` then \`x be x + 1\`

### Data Types
- Numbers: \`42\`, \`3.14\`
- Strings: \`"hello"\`, \`'world'\`
- Booleans: \`yep\` (true), \`nope\` (false)
- Null: \`void\`
- Lists: \`[1, 2, 3]\`
- Dictionaries: \`{"key": "value"}\`

### Operators
- Arithmetic: \`+\`, \`-\`, \`*\`, \`/\`, \`%\`, \`^\` (power)
- Comparison: \`<\`, \`>\`, \`<=\`, \`>=\`
- Equality: \`equals\` (==), \`differs\` or \`<>\` (!=)
- Logical: \`also\` (and), \`either\` (or), \`isnt\` (not)

### Functions
\`\`\`
conjure functionName(param1, param2) ::
  // function body
  yield returnValue
;;
\`\`\`

### Conditionals
\`\`\`
ponder condition ::
  // if true
;;
otherwise ponder anotherCondition ::
  // else if
;;
otherwise ::
  // else
;;
\`\`\`

### Loops
While loop:
\`\`\`
cycle condition ::
  // body
;;
\`\`\`

For-each loop:
\`\`\`
iterate item through list ::
  // body
;;
\`\`\`

### Built-in Functions
- \`speak(value)\` - Print to console
- \`morph(value, "text")\` - Convert to string
- \`morph(value, "num")\` - Convert to number
- \`measure(list)\` - Get length
- \`weave(list, separator)\` - Join list to string
- \`gather(list, item)\` - Push to list
- \`chaos()\` or \`random()\` - Random 0-1
- \`floor(n)\`, \`ceil(n)\`, \`round(n)\` - Rounding
- \`abs(n)\` - Absolute value
- \`root(n)\` - Square root
- \`cos(n)\`, \`sin(n)\`, \`tan(n)\` - Trigonometry (radians)

### Math Constants
- \`PI\` - 3.14159...
- \`TAU\` - 2 * PI
- \`E\` - Euler's number

### Graphics (Canvas)
Setup:
- \`canvas(width, height)\` - Create canvas
- \`clear(color)\` - Clear with color

Drawing state:
- \`fill(color)\` - Set fill color
- \`stroke(color, width)\` - Set stroke
- \`noFill()\`, \`noStroke()\` - Disable

Shapes:
- \`rect(x, y, w, h, radius?)\` - Rectangle
- \`circle(x, y, r)\` - Circle
- \`ellipse(x, y, rx, ry)\` - Ellipse
- \`line(x1, y1, x2, y2)\` - Line
- \`triangle(x1, y1, x2, y2, x3, y3)\` - Triangle
- \`star(x, y, outer, inner, points)\` - Star
- \`heart(x, y, size)\` - Heart
- \`point(x, y, size)\` - Point
- \`text(string, x, y, size)\` - Text

Colors:
- \`hue(h, s?, l?)\` - HSL color (h: 0-360)

### Turtle Graphics
- \`turtle()\` - Initialize turtle at center
- \`forward(distance)\`, \`backward(distance)\` - Move
- \`left(degrees)\`, \`right(degrees)\` - Turn
- \`penup()\`, \`pendown()\` - Pen state
- \`pencolor(color)\` - Set pen color
- \`penwidth(width)\` - Set pen width
- \`goto(x, y)\` - Move to position
- \`home()\` - Return to center

### Comments
\`// This is a comment\`

## YOUR ROLE
1. Answer questions about sdev syntax and features
2. Write complete, working sdev code when asked
3. Debug and fix sdev code issues
4. Explain concepts clearly with examples
5. Help users build projects step by step

## RULES
- Always use correct sdev syntax (forge, conjure, ponder, cycle, yield, etc.)
- Use :: to start blocks and ;; to end them (NO curly braces)
- Use yep/nope for booleans, void for null
- Use "be" for assignment, not "="
- PI, TAU, E are constants (not functions)
- Provide complete, runnable code examples
- Be encouraging and helpful!`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SDEV_SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
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

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Chat failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
