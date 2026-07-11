// functions/api/poseidon.js
export async function onRequest(context) {
  // 1. 从环境变量读取 Token
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

  // 2. 直接使用您刚刚在浏览器中成功请求的完整URL（包含所有参数）
  // 注意：我从截图中的 path 拼接了完整URL
  const targetUrl = 'https://app.poseidonchain.io/api/index/rate/currency?appKey=POSEIDON-APP&timestamp=1783755211&sign=bec922934c4b92d5b06fd987934a51f9';

  try {
    // 3. 发起带 Token 的请求（完全模拟您成功的请求）
    const response = await fetch(targetUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://app.poseidonchain.io/market'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token 已过期，请重新登录并更新环境变量 POSEIDON_TOKEN');
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
