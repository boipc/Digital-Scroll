export async function onRequest(context) {
  // 1. 从环境变量读取 Bearer Token
  const token = context.env.POSEIDON_TOKEN || '';

  if (!token) {
    return new Response(JSON.stringify({
      success: false,
      error: '服务器未配置认证Token，请在Cloudflare Pages环境变量中设置 POSEIDON_TOKEN'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 2. 目标接口地址（直接使用您看到的完整路径）
  const targetUrl = 'https://app.poseidonchain.io/api/publish/market/list?pageNum=1&pageSize=20&tokenName=DSC&publishType=1&currencyType=USD&appKey=POEIDON-APP&timestamp=17837&timestampFormat=yyyyMMddHHmmss&sign=633adfa041b6e57008a6aabbc11091e3';

  try {
    // 3. 发起带 Authorization 头的请求（这是核心变化）
    const response = await fetch(targetUrl, {
      headers: {
        'Authorization': `Bearer ${token}`, // 使用 Bearer Token
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://app.poseidonchain.io/market'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token 已过期或无效，请登录网站后更新环境变量中的 POSEIDON_TOKEN');
      }
      throw new Error(`数据源响应错误: ${response.status}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || '数据获取失败'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
