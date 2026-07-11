export async function onRequestGet({ request }) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json;charset=utf-8"
  };
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 直接调用公开 API，不需要登录和 Cookie
    const res = await fetch("https://app.poseidonchain.io/api/publish/market/list?tokenName=DSC", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120"
      }
    });
    const data = await res.json();

    // 从 API 里提取你要的字段（和你截图对应）
    const dscData = data.data.list[0];
    const result = {
      price: dscData.price + " CNY",
      volume24h: dscData.tradeAmount24h + " DSC",
      marketCap: dscData.totalMarketCap + " CNY",
      staked: dscData.stakeAmount + " DSC",
      circulation: dscData.circulation + " DSC"
    };

    return Response.json({ code: 200, data: result }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ code: 500, error: err.message }, { headers: corsHeaders });
  }
}
