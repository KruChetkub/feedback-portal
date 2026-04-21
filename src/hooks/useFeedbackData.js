import { useState, useEffect, useCallback } from 'react';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const CATEGORY_LABELS = {
  suggestion: 'ข้อเสนอแนะ ข้อคิดเห็น',
  new_service: 'ความคิดเห็นด้านการบริการใหม่',
  improve_existing_service: 'ปรับปรุงบริการเดิมของกองยุทธศาสตร์และแผนงาน',
};

const normalizeTextKey = (value) => (value || '').toString().trim().replace(/\s+/g, ' ');

const CATEGORY_ALIAS_TO_KEY = {
  suggestion: 'suggestion',
  'ข้อเสนอแนะ ข้อคิดเห็น': 'suggestion',
  'ข้อเสนอแนะ': 'suggestion',

  new_service: 'new_service',
  'ความคิดเห็นด้านการบริการใหม่': 'new_service',
  'บริการใหม่': 'new_service',

  improve_existing_service: 'improve_existing_service',
  'ปรับปรุงบริการเดิมของกองยุทธศาสตร์และแผนงาน': 'improve_existing_service',
  'ปรับปรุงบริการเดิมฯ': 'improve_existing_service',
};

const STAKEHOLDER_LABELS = {
  public: 'ประชาชนทั่วไป',
  private_sector: 'ภาคเอกชน',
  other_government: 'ภาครัฐอื่น',
  internal_unit: 'หน่วยงานภายใน',
  academic: 'นักวิชาการ',
  other: 'อื่นๆ',
};

const sanitizeCountMap = (mapLike) => {
  if (!mapLike || typeof mapLike !== 'object') return {};
  return Object.entries(mapLike).reduce((acc, [key, value]) => {
    acc[key] = toNumber(value);
    return acc;
  }, {});
};

const normalizeCategoryCounts = (raw) => {
  const rawMap = sanitizeCountMap(raw?.categories || raw?.category_counts);
  const normalized = {};

  Object.entries(rawMap).forEach(([key, value]) => {
    const normalizedKey = normalizeTextKey(key);
    const canonicalKey = CATEGORY_ALIAS_TO_KEY[normalizedKey] || normalizedKey;
    const label = CATEGORY_LABELS[canonicalKey] || key;
    normalized[label] = toNumber(normalized[label]) + value;
  });

  // บังคับ key หลักให้มีเสมอ
  Object.values(CATEGORY_LABELS).forEach((label) => {
    if (!(label in normalized)) normalized[label] = 0;
  });

  return normalized;
};

const normalizeStakeholderCounts = (raw) => {
  const rawMap = sanitizeCountMap(raw?.stakeholders || raw?.stakeholder_counts);
  const normalized = {};

  Object.entries(rawMap).forEach(([key, value]) => {
    const label = STAKEHOLDER_LABELS[key] || key;
    normalized[label] = toNumber(normalized[label]) + value;
  });

  return normalized;
};

const sanitizeDashboardData = (raw) => {
  const categories = normalizeCategoryCounts(raw);
  const fallbackTotal = Object.values(categories).reduce((sum, count) => sum + toNumber(count), 0);
  const total = toNumber(raw?.total) || fallbackTotal;

  return {
    total,
    categories,
    stakeholders: normalizeStakeholderCounts(raw),
  };
};

export const useFeedbackData = (apiUrl, filters = { month: '', year: '' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const CACHE_KEY = `dashboard_data_${apiUrl}_${filters.month}_${filters.year}`;
  const CACHE_TIME_KEY = `dashboard_data_time_${apiUrl}_${filters.month}_${filters.year}`;
  const CACHE_DURATION = 60 * 1000; // 60 seconds cache

  const fetchData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    // --- Caching Logic: ป้องกันการยิง API ถี่ๆ จากการ Refresh ---
    const currentTime = Date.now();
    const lastFetchTime = sessionStorage.getItem(CACHE_TIME_KEY);
    const cachedData = sessionStorage.getItem(CACHE_KEY);

    if (!forceRefresh && lastFetchTime && cachedData && (currentTime - parseInt(lastFetchTime) < CACHE_DURATION)) {
      try {
        const parsedData = JSON.parse(cachedData);
        setData(sanitizeDashboardData(parsedData));
        setLoading(false);
        console.log("Using cached dashboard data (Anti-Spam active)");
        return; // ออกจากฟังก์ชันทันที ไม่ต้อง Fetch
      } catch (e) {
        console.error("Cache parse error", e);
      }
    }

    try {
      // ป้องกัน Google Apps Script แคชข้อมูลเก่า โดยการเติม ?t=timestamp ต่อท้าย URL เสมอ
      // ป้องกัน Google Apps Script และ Browser แคชข้อมูลเก่าแบบขั้นสูงสุด (Force Bypass Cache)
      const separator = apiUrl.includes('?') ? '&' : '?';
      const filterParams = `month=${encodeURIComponent(filters.month)}&year=${encodeURIComponent(filters.year)}`;
      const noCacheUrl = `${apiUrl}${separator}${filterParams}&t=${Date.now()}`;
      
      const response = await fetch(noCacheUrl, { 
        cache: 'no-store'
        // ห้ามส่ง custom headers (เช่น Cache-Control) เพราะ Google Apps Script ไม่รองรับ CORS Preflight
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type') || '';
      const rawBody = await response.text();
      let jsonData;
      try {
        jsonData = JSON.parse(rawBody);
      } catch {
        const preview = rawBody.slice(0, 120).replace(/\s+/g, ' ');
        throw new Error(`API did not return JSON (content-type: ${contentType || 'unknown'}). Preview: ${preview}`);
      }
      
      // Handle case where server returns error internally in JSON
      if (jsonData.error) {
         throw new Error(jsonData.error);
      }

      // เก็บเฉพาะข้อมูลสรุปที่จำเป็นต่อการแสดงผลเท่านั้น
      const safeData = sanitizeDashboardData(jsonData);
      setData(safeData);
      
      // บันทึกลง Cache หลังดึงสำเร็จ
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(safeData));
      sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    } catch (err) {
      console.error("Fetch error:", err);
      setError("ไม่สามารถดึงข้อมูลได้: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, filters.month, filters.year, CACHE_DURATION, CACHE_KEY, CACHE_TIME_KEY]);

  useEffect(() => {
    if (apiUrl) {
      fetchData();
    } else {
      setLoading(false);
      setError('ยังไม่ได้ตั้งค่า API URL');
    }
  }, [apiUrl, fetchData, filters.month, filters.year]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  return { data, loading, error, refetch };
};
