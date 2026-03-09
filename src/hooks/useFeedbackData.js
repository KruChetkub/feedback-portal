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

      const formattedData = jsonData.map(row => {
         // ตัดข้อมูลส่วนบุคคล (PII) ทิ้งทันที ไม่ให้ React นำไปใช้งานหรือเก็บไว้ใน State
         const { 
           contact_name, 
           contact_phone, 
           contact_email, 
           pdpa_consent, 
           ...safeRow 
         } = row;
         
         return {
           ...safeRow,
           satisfaction_score: parseFloat(safeRow.satisfaction_score) || 0
         };
      });

      setData(formattedData);
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
