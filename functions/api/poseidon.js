// functions/api/poseidon.js
export async function onRequest(context) {
  const token = context.env.POSEIDON_TOKEN || '';

  if (!token) {
    return new Response(JSON.stringify({
      success: false,
      error: '服务器未配置认证Token，请在环境变量中设置 POSEIDON_TOKEN'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 从环境变量读取完整URL，或使用默认值（便于灵活更新）
  const targetUrl = context.env.MARKET_API_URL || 
    'https://app.poseidonchain.io/api/publish/market/list?pageNum=1&pageSize=20&tokenName=DSC&publishType=1&currencyType=USD&appKey=POEIDON-APP&timestamp=17837&timestampFormat=yyyyMMddHHmmss&sign=633adfa041b6e57008a6aabbc11091e3';

  // 超时控制 (10秒)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://app.poseidonchain.io/market'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // 特别处理401，提示更新Token
      if (response.status === 401) {
        throw new Error('Token 已过期或无效，请重新登录并更新环境变量 POSEIDON_TOKEN');
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
    if (error.name === 'AbortError') {
      return new Response(JSON.stringify({
        success: false,
        error: '请求超时，请稍后重试'
      }), { status: 504, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({
      success: false,
      error: error.message || '数据获取失败'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
