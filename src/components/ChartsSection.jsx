import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const renderPiePercentLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (!toNumber(percent)) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
    >
      {(toNumber(percent) * 100).toFixed(0)}%
    </text>
  );
};

export const ChartsSection = ({ data = {} }) => {
  // Process data for Bar Chart (Service Category)
  const categoryCount = data.categories || {};
  
  const CATEGORY_COLORS = {
    'ด้านการพัฒนาและขับเคลื่อนนโยบายและยุทธศาสตร์ด้านการป้องกันควบคุมโรคและภัยสุขภาพ': '#3b82f6',
    'ด้านการจัดทำงบประมาณ': '#10b981',
    'ด้านการจัดทำและบริหารแผนปฏิบัติราชการ': '#f59e0b',
    'ด้านการติดตาม กำกับ สนับสนุน และประเมินผลการดำเนินงาน': '#8b5cf6',
  };
  const DEFAULT_COLORS = ['#ec4899', '#64748b', '#14b8a6', '#ef4444'];

  // หมวดหมู่หลัก 4 อย่างสมัยใหม่
  const standardCategories = [
    'ด้านการพัฒนาและขับเคลื่อนนโยบายและยุทธศาสตร์ด้านการป้องกันควบคุมโรคและภัยสุขภาพ',
    'ด้านการจัดทำงบประมาณ',
    'ด้านการจัดทำและบริหารแผนปฏิบัติราชการ',
    'ด้านการติดตาม กำกับ สนับสนุน และประเมินผลการดำเนินงาน',
  ];

  // แสดงเฉพาะ 4 หมวดหมู่ใหม่เท่านั้น (ไม่ดึงหมวดเก่าจาก Google Sheet มาแสดง)
  const allCategories = standardCategories;

  const barData = allCategories.map((key, index) => {
    // ย่อชื่อที่ยาวเกินไปให้แสดงในกราฟใต้แกน X ได้สวยงาม ไม่ทับกัน
    let shortName = key;
    if (key === 'ด้านการพัฒนาและขับเคลื่อนนโยบายและยุทธศาสตร์ด้านการป้องกันควบคุมโรคและภัยสุขภาพ') shortName = 'นโยบายฯ';
    if (key === 'ด้านการจัดทำงบประมาณ') shortName = 'งบประมาณ';
    if (key === 'ด้านการจัดทำและบริหารแผนปฏิบัติราชการ') shortName = 'แผนปฏิบัติราชการ';
    if (key === 'ด้านการติดตาม กำกับ สนับสนุน และประเมินผลการดำเนินงาน') shortName = 'ติดตาม/ประเมินผล';

    return {
      name: shortName, // ชื่อย่อสำหรับแกน X
      originalName: key, // ชื่อเต็มสำหรับอ้างอิง
      จำนวน: toNumber(categoryCount[key]),
      color: CATEGORY_COLORS[key] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
    };
  });

  // Process data for Pie Chart (Stakeholder Type)
  const stakeholderCount = data.stakeholders || {};
  const pieData = Object.keys(stakeholderCount).map(key => ({
    name: key,
    value: toNumber(stakeholderCount[key])
  }));
  const pieDataForRender = pieData.filter(item => toNumber(item.value) > 0);
  const pieTotal = pieDataForRender.reduce((sum, item) => sum + toNumber(item.value), 0);

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
          {pieTotal === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
              ไม่มีข้อมูลกลุ่มผู้แสดงความคิดเห็น
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieDataForRender}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                  label={renderPiePercentLabel}
                >
                  {pieDataForRender.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
