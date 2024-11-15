// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/getting_started/setup_your_environment

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

console.log("Hello from Functions!")

serve(async (req) => {
  try {
    const { name } = await req.json()
    const data = {
      message: `Hello ${name}!`,
    }

    return new Response(
      JSON.stringify(data),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON payload' }),
      { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
})
