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
        <h3 className="text-lg font-semibold text-gray-800">ข้อมูลข้อเสนอแนะทั้งหมด</h3>
        <span className="text-sm text-gray-500">ทั้งหมด {data.length} รายการ</span>
      </div>
      <div className="overflow-x-auto h-96">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm sticky top-0 shadow-sm z-10">
            <tr>
              <th className="p-4 font-semibold border-b">วันที่</th>
              <th className="p-4 font-semibold border-b">ผู้มีส่วนได้ส่วนเสีย</th>
              <th className="p-4 font-semibold border-b">หมวดหมู่บริการ</th>
              <th className="p-4 font-semibold border-b w-1/2">รายละเอียด (ปัญหา/ข้อเสนอแนะ)</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">ไม่พบข้อมูล</td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 whitespace-nowrap">{formatDate(row.timestamp)}</td>
                  <td className="p-4">{row.stakeholder_type || '-'}</td>
                  <td className="p-4">{row.service_category || '-'}</td>
                  <td className="p-4 text-gray-600 truncate max-w-lg cursor-default" title={row.pain_points || row.suggestions}>
                    {row.pain_points || row.suggestions || '-'}
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
