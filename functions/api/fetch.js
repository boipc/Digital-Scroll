export async function onRequestGet({ request }) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Content-Type": "application/json;charset=utf-8"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const urlObj = new URL(request.url);
  const targetUrl = urlObj.searchParams.get("target");
  if (!targetUrl) {
    return Response.json({ code: 400, msg: "缺少 target 参数" }, { headers: corsHeaders });
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    const html = await res.text();
    return Response.json({
      code: 200,
      source: targetUrl,
      html: html
    }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ code: 500, msg: "抓取失败", error: err.message }, { headers: corsHeaders });
  }
}
