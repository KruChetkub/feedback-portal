import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export const ChartsSection = ({ data }) => {
  // Process data for Bar Chart (Service Category)
  const categoryCount = data.categories || {};
  
  const CATEGORY_COLORS = {
    'แจ้งเรื่องร้องเรียน': '#ef4444', // สีแดง
    'ข้อเสนอแนะ ข้อคิดเห็น': '#3b82f6', // สีฟ้า
    'ความคิดเห็นด้านการบริการใหม่': '#f59e0b', // สีเหลืองทอง
    'ปรับปรุงบริการเดิมของกองยุทธศาสตร์และแผนงาน': '#10b981', // สีเขียว
  };
  const DEFAULT_COLORS = ['#8b5cf6', '#ec4899', '#64748b', '#14b8a6'];

  // บังคับให้แสดงหมวดหมู่หลักเสมอ แม้จะยังไม่มีข้อมูล (ข้อมูลเป็น 0)
  const standardCategories = [
    'ข้อเสนอแนะ ข้อคิดเห็น',
    'ความคิดเห็นด้านการบริการใหม่',
    'ปรับปรุงบริการเดิมของกองยุทธศาสตร์และแผนงาน'
  ];

  // นำหมวดหมู่หลักมารวมกับหมวดหมู่อื่นๆ ที่อาจหลงเหลือใน Google Sheets (แต่กรอง 'แจ้งเรื่องร้องเรียน' ทิ้ง)
  const allCategories = [...new Set([...standardCategories, ...Object.keys(categoryCount)])].filter(cat => cat !== 'แจ้งเรื่องร้องเรียน');

  const barData = allCategories.map((key, index) => {
    // ย่อชื่อที่ยาวเกินไปให้แสดงในกราฟใต้แกน X ได้สวยงาม ไม่ทับกัน
    let shortName = key;
    if (key === 'ปรับปรุงบริการเดิมของกองยุทธศาสตร์และแผนงาน') shortName = 'ปรับปรุงบริการเดิมฯ';
    if (key === 'ความคิดเห็นด้านการบริการใหม่') shortName = 'บริการใหม่';
    if (key === 'ข้อเสนอแนะ ข้อคิดเห็น') shortName = 'ข้อเสนอแนะ';
    
    return {
      name: shortName, // ชื่อย่อสำหรับแกน X
      originalName: key, // ชื่อเต็มสำหรับอ้างอิง
      จำนวน: categoryCount[key] || 0,
      color: CATEGORY_COLORS[key] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
    };
  });

  // Process data for Pie Chart (Stakeholder Type)
  const stakeholderCount = data.stakeholders || {};
  const pieData = Object.keys(stakeholderCount).map(key => ({
    name: key,
    value: stakeholderCount[key]
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">จำนวนรายการจำแนกตามหมวดหมู่บริการ</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                axisLine={false} 
                tickLine={false}
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fill: '#64748b', fontSize: 12 }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="จำนวน" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">สัดส่วนกลุ่มผู้แสดงความคิดเห็น</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
