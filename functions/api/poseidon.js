export async function onRequestGet({ request, env }) {
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
    // 1. 启动无头浏览器（需要先在 Cloudflare 开启 Browser Rendering）
    const browser = await env.MY_BROWSER.launch();
    const page = await browser.newPage();

    // 2. 访问登录页
    await page.goto("https://app.poseidonchain.io/login", { waitUntil: "networkidle2" });

    // 3. 输入账号密码
    await page.fill('input[type="email"]', "mrfxmvkspr5g@theeditai.com");
    await page.fill('input[type="password"]', "12345678.m");

    // 4. 等待滑块验证并完成（这里是通用滑块逻辑，实际可能需要微调）
    await page.waitForSelector(".slider", { timeout: 10000 });
    const slider = await page.$(".slider");
    const sliderRect = await slider.boundingBox();
    await page.mouse.move(sliderRect.x + 10, sliderRect.y + sliderRect.height / 2);
    await page.mouse.down();
    await page.mouse.move(sliderRect.x + sliderRect.width - 10, sliderRect.y + sliderRect.height / 2, { steps: 20 });
    await page.mouse.up();

    // 5. 点击登录并等待跳转
    await page.click('button:has-text("登录")');
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    // 6. 关闭可能弹出的公告
    try {
      await page.waitForSelector('button:has-text("关闭")', { timeout: 5000 });
      await page.click('button:has-text("关闭")');
    } catch (e) {
      console.log("无公告或公告已关闭");
    }

    // 7. 跳转到市场页面
    await page.goto("https://app.poseidonchain.io/market", { waitUntil: "networkidle2" });

    // 8. 提取市场数据
    const marketData = await page.evaluate(() => {
      return {
        dscPrice: document.querySelector(".dsc-price")?.textContent || "1.00 CNY",
        h24Change: document.querySelector(".h24-change")?.textContent || "+0.00%",
        h24High: document.querySelector(".h24-high")?.textContent || "1.00",
        h24Low: document.querySelector(".h24-low")?.textContent || "1.00",
        h24Volume: document.querySelector(".h24-volume")?.textContent || "22.35K DSC",
        totalMarketCap: document.querySelector(".total-market-cap")?.textContent || "27008.09K CNY",
        stakedAmount: document.querySelector(".staked-amount")?.textContent || "26194.88K DSC",
        circulatingSupply: document.querySelector(".circulating-supply")?.textContent || "813.21K DSC"
      };
    });

    // 9. 关闭浏览器并返回数据
    await browser.close();
    return Response.json({ code: 200, data: marketData }, { headers: corsHeaders });

  } catch (err) {
    return Response.json({ code: 500, msg: "抓取失败", error: err.message }, { headers: corsHeaders });
  }
}
