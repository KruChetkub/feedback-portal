import { useState, useEffect, useCallback } from 'react';

export const useFeedbackData = (apiUrl) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl);
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
  }, [apiUrl, fetchData]);

  return { data, loading, error, refetch: fetchData };
};
