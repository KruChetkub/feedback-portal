import React from 'react';
import { Users, AlertTriangle, Lightbulb } from 'lucide-react';

export const SummaryCards = ({ data }) => {
  // ฟอลแบ็กเผื่อในกรณีที่ตารางยังว่าง หรือข้อมูลยังโหลดไม่เสร็จสมบูรณ์
  const totalFeedbacks = data.total || 0;
  
  const complaintCount = data.categories ? (data.categories['แจ้งเรื่องร้องเรียน'] || 0) : 0;
  const suggestionCount = data.categories ? (data.categories['ข้อเสนอแนะ ข้อคิดเห็น'] || 0) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4 border border-gray-100 transition-all hover:shadow-md">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
          <Users size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">เรื่องที่รับทั้งหมด</p>
          <p className="text-2xl font-bold text-gray-900 flex items-baseline gap-2">
            {totalFeedbacks} <span className="text-sm font-normal text-gray-500">รายการ</span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4 border border-gray-100 transition-all hover:shadow-md">
        <div className="p-3 bg-amber-50 text-amber-500 rounded-lg">
          <AlertTriangle size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">เรื่องร้องเรียน</p>
          <p className="text-2xl font-bold text-gray-900 flex items-baseline gap-2">
            {complaintCount} <span className="text-sm font-normal text-gray-500">รายการ</span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4 border border-gray-100 transition-all hover:shadow-md">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
          <Lightbulb size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">ข้อเสนอแนะ</p>
          <p className="text-2xl font-bold text-gray-900 flex items-baseline gap-2">
            {suggestionCount} <span className="text-sm font-normal text-gray-500">รายการ</span>
          </p>
        </div>
      </div>
    </div>
  );
};
