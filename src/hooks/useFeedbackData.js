import { useState, useEffect, useCallback } from 'react';

export const useFeedbackData = (apiUrl, filters = { month: '', year: '' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const CACHE_KEY = `dashboard_data_${apiUrl}_${filters.month}_${filters.year}`;
  const CACHE_TIME_KEY = `dashboard_data_time_${apiUrl}_${filters.month}_${filters.year}`;
  const CACHE_DURATION = 60 * 1000; // 60 seconds cache

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // --- Caching Logic: ป้องกันการยิง API ถี่ๆ จากการ Refresh ---
    const currentTime = Date.now();
    const lastFetchTime = sessionStorage.getItem(CACHE_TIME_KEY);
    const cachedData = sessionStorage.getItem(CACHE_KEY);

    if (lastFetchTime && cachedData && (currentTime - parseInt(lastFetchTime) < CACHE_DURATION)) {
      try {
        const parsedData = JSON.parse(cachedData);
        setData(parsedData);
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
      const filterParams = `month=${filters.month}&year=${filters.year}`;
      const noCacheUrl = `${apiUrl}${separator}${filterParams}&t=${Date.now()}`;
      
      const response = await fetch(noCacheUrl, { 
        cache: 'no-store'
        // ห้ามส่ง custom headers (เช่น Cache-Control) เพราะ Google Apps Script ไม่รองรับ CORS Preflight
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonData = await response.json();
      
      // Handle case where server returns error internally in JSON
      if (jsonData.error) {
         throw new Error(jsonData.error);
      }

      // ข้อมูลที่ได้ตอนนี้เป็น Object สรุปแล้ว (ไม่ใช่ Array)
      // โครงสร้างเช่น { total: 0, categories: {}, stakeholders: {}, latest_timestamps: [] }
      setData(jsonData);
      
      // บันทึกลง Cache หลังดึงสำเร็จ
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(jsonData));
      sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    } catch (err) {
      console.error("Fetch error:", err);
      setError("ไม่สามารถดึงข้อมูลได้: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (apiUrl) {
      fetchData();
    }
  }, [apiUrl, fetchData, filters.month, filters.year]);

  return { data, loading, error, refetch: fetchData };
};
