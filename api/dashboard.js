/**
 * Vercel Serverless Function: GET /api/dashboard
 * Proxy สำหรับดึงข้อมูล Dashboard จาก Google Apps Script
 * URL และ Secret อยู่ใน Server เท่านั้น — Browser ไม่เห็น
 */
export default async function handler(req, res) {
  // อนุญาตเฉพาะ GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GAS_URL = process.env.GAS_API_URL;
  if (!GAS_URL) {
    return res.status(500).json({ error: 'API not configured' });
  }

  try {
    const { month = '', year = '' } = req.query;
    const params = new URLSearchParams({ month, year, t: Date.now() });
    const response = await fetch(`${GAS_URL}?${params}`);

    if (!response.ok) throw new Error(`Upstream error: ${response.status}`);

    const data = await response.json();

    // Cache 60 วินาที ที่ Vercel Edge
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: 'Failed to fetch dashboard data' });
  }
}
