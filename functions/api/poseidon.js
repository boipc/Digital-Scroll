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

  // 使用正确的市场列表接口（从您的截图中获得）
  const targetUrl = context.env.MARKET_API_URL || 
    'https://app.poseidonchain.io/api/publish/market/list?pageNum=1&pageSize=20&tokenName=DSC&publishType=1&currencyType=USD&appKey=POEIDON-APP&timestamp=1783755211&sign=bec922934c4b92d5b06fd987934a51f9';

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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

    // 检查数据是否包含 list
    if (!data.data || !data.data.list) {
      throw new Error('接口返回数据格式异常，未找到 list 字段');
    }

    // 查找 DSC 的数据
    const dscItem = data.data.list.find(item => item.tokenName === 'DSC' || item.symbol === 'DSC');
    if (!dscItem) {
      throw new Error('未找到 DSC 的市场数据');
    }

    // 将找到的 DSC 数据单独返回，方便前端处理
    return new Response(JSON.stringify({
      success: true,
      data: dscItem,
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
