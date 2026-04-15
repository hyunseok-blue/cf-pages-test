const GATEWAY = "https://api-auth.madup-dct.site/api/slack/send-message";
const MAX_TEXT_LEN = 4000;

export async function onRequestPost({ request, env }) {
  if (!env.API_KEY) {
    return Response.json(
      { success: false, error: "API_KEY secret is not configured on Pages" },
      { status: 500 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  const channel = typeof body?.channel === "string" ? body.channel.trim() : "";
  const text = typeof body?.text === "string" ? body.text : "";

  if (!channel) {
    return Response.json(
      { success: false, error: "channel is required" },
      { status: 400 },
    );
  }
  if (!text || text.length > MAX_TEXT_LEN) {
    return Response.json(
      {
        success: false,
        error: `text must be 1-${MAX_TEXT_LEN} characters`,
      },
      { status: 400 },
    );
  }

  let upstream;
  try {
    upstream = await fetch(GATEWAY, {
      method: "POST",
      headers: {
        "X-API-Key": env.API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ channel, text }),
    });
  } catch (e) {
    return Response.json(
      { success: false, error: `upstream fetch failed: ${e?.message || e}` },
      { status: 502 },
    );
  }

  const payload = await upstream.json().catch(() => ({}));
  return Response.json(payload, { status: upstream.status });
}
