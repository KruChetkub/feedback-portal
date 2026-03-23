import React from 'react';
import { Users, Lightbulb, Zap, Settings } from 'lucide-react';

export const SummaryCards = ({ data }) => {
  // ฟอลแบ็กเผื่อในกรณีที่ตารางยังว่าง หรือข้อมูลยังโหลดไม่เสร็จสมบูรณ์
  const totalFeedbacks = data.total || 0;
  
  const complaintCount = data.categories ? (data.categories['แจ้งเรื่องร้องเรียน'] || 0) : 0;
  
  const suggestion1 = data.categories ? (data.categories['ข้อเสนอแนะ ข้อคิดเห็น'] || 0) : 0;
  const suggestion2 = data.categories ? (data.categories['ความคิดเห็นด้านการบริการใหม่'] || 0) : 0;
  const suggestion3 = data.categories ? (data.categories['ปรับปรุงบริการเดิมของกองยุทธศาสตร์และแผนงาน'] || 0) : 0;
  const suggestionCount = suggestion1 + suggestion2 + suggestion3;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 1. ยอดรวม */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center space-x-4 border border-gray-100 transition-all hover:shadow-md">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
          <Users size={20} />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">เรื่องที่รับทั้งหมด</p>
          <p className="text-xl font-bold text-gray-900">
            {totalFeedbacks} <span className="text-xs font-normal text-gray-500">รายการ</span>
          </p>
        </div>
      </div>

      {/* 2. ข้อเสนอแนะ */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center space-x-4 border border-gray-100 transition-all hover:shadow-md">
        <div className="p-3 bg-blue-50 text-blue-500 rounded-lg">
          <Lightbulb size={20} />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">ข้อเสนอแนะ</p>
          <p className="text-xl font-bold text-gray-900">
            {suggestion1} <span className="text-xs font-normal text-gray-500">รายการ</span>
          </p>
        </div>
      </div>

      {/* 3. บริการใหม่ */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center space-x-4 border border-gray-100 transition-all hover:shadow-md">
        <div className="p-3 bg-amber-50 text-amber-500 rounded-lg">
          <Zap size={20} />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 whitespace-nowrap">บริการใหม่</p>
          <p className="text-xl font-bold text-gray-900">
            {suggestion2} <span className="text-xs font-normal text-gray-500">รายการ</span>
          </p>
        </div>
      </div>

      {/* 4. ปรับปรุงบริการเดิมฯ */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center space-x-4 border border-gray-100 transition-all hover:shadow-md">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
          <Settings size={20} />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">ปรับปรุงบริการเดิมฯ</p>
          <p className="text-xl font-bold text-gray-900">
            {suggestion3} <span className="text-xs font-normal text-gray-500">รายการ</span>
          </p>
        </div>
      </div>
    </div>
  );
};
