import React from 'react';

export const DataTable = ({ data }) => {
  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('pending') || s.includes('รอดำเนินการ')) {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">รอดำเนินการ (Pending)</span>;
    }
    if (s.includes('in progress') || s.includes('กำลังดำเนินการ')) {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">กำลังดำเนินการ (In Progress)</span>;
    }
    if (s.includes('resolved') || s.includes('แก้ไขแล้ว')) {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">แก้ไขแล้ว (Resolved)</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status || 'ไม่ระบุ'}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      // Handle timestamp format 2569-03-09T08:03:24.000Z or similar formats
      const date = new Date(dateString);
      // Check if Date is valid
      if (isNaN(date.getTime())) return dateString;
      
      // หากปีเป็น พ.ศ. (2500 ขึ้นไป) อยู่แล้ว ให้แปลงกลับเป็น ค.ศ. ก่อน 
      // เพื่อป้องกันไม่ให้ toLocaleDateString('th-TH') ไปบวกซ้ำอีก 543
      let year = date.getFullYear();
      if (year >= 2500) {
        date.setFullYear(year - 543);
      }

      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">รายการรับเรื่องล่าสุด</h3>
        <span className="text-sm text-gray-500">
          ข้อมูลถูกตั้งค่าให้ปกปิดรายละเอียดเพื่อความปลอดภัย
        </span>
      </div>
      <div className="overflow-x-auto h-96">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm sticky top-0 shadow-sm z-10">
            <tr>
              <th className="p-4 font-semibold border-b w-1/3">วัน-เวลาที่ส่งเรื่อง</th>
              <th className="p-4 font-semibold border-b w-1/3">หมวดหมู่บริการ</th>
              <th className="p-4 font-semibold border-b w-1/3">สถานะข้อมูล</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
            {(!data.latest_timestamps || data.latest_timestamps.length === 0) ? (
              <tr>
                <td colSpan="3" className="p-8 text-center text-gray-500">ไม่พบข้อมูลใหม่</td>
              </tr>
            ) : (
              data.latest_timestamps.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 whitespace-nowrap">{formatDate(row.timestamp)}</td>
                  <td className="p-4">{row.category || '-'}</td>
                  <td className="p-4 text-gray-400 italic">
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                      เซ็นเซอร์เนื้อหาเพื่อความปลอดภัย
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
