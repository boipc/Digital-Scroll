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

  try {
    const res = await fetch("https://app.poseidonchain.io/api/publish/market/list?tokenName=DSC", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome 120.0.0.0 Safari/537.36"
      }
    });
    const apiData = await res.json();
    const dsc = apiData.data.list[0];

    const data = {
      price: dsc.price,
      volume24h: dsc.tradeAmount24h,
      marketCap: dsc.totalMarketCap,
      staked: dsc.stakeAmount,
      circulation: dsc.circulation
    };

    return Response.json({ code: 200, data }, { headers: corsHeaders });
  } catch (err)
    return Response.json({ code: 500, msg: "数据拉取失败", err: err.message }, { headers: corsHeaders });
  }
}
