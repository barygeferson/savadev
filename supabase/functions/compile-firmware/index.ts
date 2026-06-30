// supabase/functions/compile-firmware/index.ts
// Compiles a transpiled Arduino sketch into a flashable .hex/.bin.
//
// Strategy: forward the sketch to a configurable arduino-cli build server.
//   - ARDUINO_BUILD_URL  (required for real builds)
//   - ARDUINO_BUILD_KEY  (optional bearer token)
//
// The build server is expected to accept:
//   POST <url>
//   { fqbn: string, ino: string, libraries: string[] }
//   -> { ok: true, hex: string, format: "ihex" | "base64-bin" }
//   -> { ok: false, error: string, log?: string }
//
// If ARDUINO_BUILD_URL isn't set, we return a structured "build_unavailable"
// response carrying the .ino so the IDE can offer "Download .ino" instead.

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';

const Body = z.object({
  fqbn: z.string().min(1).max(200),
  ino: z.string().min(1).max(500_000),
  libraries: z.array(z.string().min(1).max(120)).max(64).default([]),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST')   return json({ error: 'method not allowed' }, 405);

  let parsed;
  try {
    parsed = Body.safeParse(await req.json());
  } catch {
    return json({ error: 'invalid json' }, 400);
  }
  if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
  const { fqbn, ino, libraries } = parsed.data;

  const buildUrl = Deno.env.get('ARDUINO_BUILD_URL');
  if (!buildUrl) {
    return json({
      ok: false,
      reason: 'build_unavailable',
      message: 'No Arduino build server is configured. The .ino has been generated and can be compiled locally with `arduino-cli compile --fqbn ' + fqbn + '` or by opening it in the Arduino IDE.',
      ino,
      fqbn,
      libraries,
    }, 200);
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const key = Deno.env.get('ARDUINO_BUILD_KEY');
  if (key) headers['Authorization'] = `Bearer ${key}`;

  let upstream: Response;
  try {
    upstream = await fetch(buildUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ fqbn, ino, libraries }),
    });
  } catch (e) {
    return json({ ok: false, reason: 'network', message: String(e), ino }, 502);
  }

  const text = await upstream.text();
  let payload: unknown;
  try { payload = JSON.parse(text); } catch { payload = { ok: false, message: text }; }

  return new Response(JSON.stringify(payload), {
    status: upstream.status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
