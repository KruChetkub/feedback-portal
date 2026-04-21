/**
 * Vercel Serverless Function: POST /api/submit
 * Proxy สำหรับรับ Form Submission แล้วส่งต่อไปยัง Google Apps Script
 * URL, Secret, และ Token Verification อยู่ใน Server เท่านั้น — Browser ไม่เห็น
 */

// djb2 hash เหมือนกับที่ FeedbackForm.jsx ใช้
function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// Rate Limiting แบบ In-memory (รีเซ็ตเมื่อ Function instance ถูก recycle)
const submissionLog = new Map();
const RATE_WINDOW_MS = 60 * 1000; // 1 นาที
const MAX_PER_WINDOW = 100;       // สูงสุด 100 ครั้ง/นาที (global)

function checkRateLimit() {
  const now = Date.now();
  const windowKey = Math.floor(now / RATE_WINDOW_MS);
  const count = submissionLog.get(windowKey) || 0;
  if (count >= MAX_PER_WINDOW) return false;
  submissionLog.set(windowKey, count + 1);
  // Cleanup keys เก่า
  for (const [k] of submissionLog) {
    if (k < windowKey - 1) submissionLog.delete(k);
  }
  return true;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const GAS_URL    = process.env.GAS_API_URL;
  const GAS_SECRET = process.env.GAS_SECRET;

  if (!GAS_URL || !GAS_SECRET) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  // === ด่าน 1: Rate Limiting (Server-side) ===
  if (!checkRateLimit()) {
    return res.status(429).json({ error: 'rate_limited' });
  }

  // อ่าน body (Vercel parse ให้อัตโนมัติถ้าเป็น application/x-www-form-urlencoded)
  const body = req.body || {};
  const get = (key) => (typeof body[key] === 'string' ? body[key] : '').trim();

  // === ด่าน 2: Honeypot ===
  if (get('address_line_2') !== '') {
    // หลอกว่าสำเร็จ แต่ไม่บันทึก
    return res.status(200).json({ result: 'success' });
  }

  // === ด่าน 3: Timestamp Token Verification ===
  const clientTs = get('_t');
  const clientTk = get('_tk');
  const tsNum    = parseInt(clientTs || '0');

  // Token ต้องไม่เก่าเกิน 5 นาที
  if (!clientTs || Math.abs(Date.now() - tsNum) > 300000) {
    return res.status(403).json({ error: 'Token expired' });
  }

  // ตรวจสอบ hash ตรงกันไหม
  const expected = djb2Hash(clientTs + GAS_SECRET);
  if (clientTk !== expected) {
    return res.status(403).json({ error: 'Invalid token' });
  }

  // === ด่าน 4: ส่งต่อไปยัง Apps Script ===
  try {
    const allowedFields = ['stakeholder_type', 'service_category', 'suggestions'];
    const params = new URLSearchParams();
    allowedFields.forEach(f => params.set(f, get(f)));
    // ส่ง internal token ใหม่ให้ Apps Script ยืนยันเพิ่มเติม
    const serverTs = Date.now().toString();
    params.set('_t', serverTs);
    params.set('_tk', djb2Hash(serverTs + GAS_SECRET));

    const gasRes = await fetch(GAS_URL, {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    void gasRes;
    return res.status(200).json({ result: 'success' });
  } catch (err) {
    return res.status(502).json({ error: 'Failed to submit' });
  }
}
