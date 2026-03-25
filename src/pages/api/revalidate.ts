import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get("authorization");
  const cronSecret = import.meta.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const deployHook = import.meta.env.VERCEL_DEPLOY_HOOK;

  if (!deployHook) {
    return new Response(
      JSON.stringify({ error: "VERCEL_DEPLOY_HOOK env var not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const res = await fetch(deployHook, { method: "POST" });

  if (!res.ok) {
    return new Response(
      JSON.stringify({ error: "Deploy hook failed", status: res.status }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  const data = await res.json();

  return new Response(
    JSON.stringify({ ok: true, triggered: new Date().toISOString(), data }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
