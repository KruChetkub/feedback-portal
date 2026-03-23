import React, { useState } from 'react';
import { useFeedbackData } from './hooks/useFeedbackData';
import { SummaryCards } from './components/SummaryCards';
import { ChartsSection } from './components/ChartsSection';
import { FeedbackForm } from './components/FeedbackForm';
import { RefreshCw, AlertCircle, LayoutDashboard, Edit3 } from 'lucide-react';

// ฝังลิงก์ API เสมือนจริงลงไปในโค้ดเลย เพื่อแก้ปัญหาที่ Vercel ไม่ดึงค่าจากไฟล์ .env
const API_URL = 'https://script.google.com/macros/s/AKfycbwVEbK3uKJbn9sS1ucfieban7cV5Q8rTVcPm_vtMDDZ2s8ObpGYmr-0uSzB0z96ruFw/exec';


function App() {
  const { data, loading, error, refetch } = useFeedbackData(API_URL);

  const renderDashboard = () => {
    if (loading) {
      return (
        <div className="mt-12 min-h-[40vh] flex flex-col items-center justify-center space-y-4 bg-gray-50 rounded-xl border border-gray-100 p-8">
          <RefreshCw className="animate-spin text-blue-500" size={40} />
          <p className="text-gray-600 font-medium font-sans">กำลังอัปเดตข้อมูลแดชบอร์ดสรุปผล...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="mt-12 min-h-[40vh] flex flex-col items-center justify-center space-y-4 bg-gray-50 p-6 text-center font-sans rounded-xl border border-red-100">
          <div className="bg-red-50 text-red-600 p-4 rounded-full">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">เกิดข้อผิดพลาดในการโหลดข้อมูลแดชบอร์ด</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={18} /> รอดึงข้อมูลใหม่อีกครั้ง
          </button>
        </div>
      );
    }

    if (!data || data.total === undefined || data.total === 0) {
      return (
        <div className="mt-12 text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 mb-4">ยังไม่มีข้อมูลข้อเสนอแนะในระบบ</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} /> รีเฟรชข้อมูล
          </button>
        </div>
      );
    }

    return (
      <div className="mt-16 pt-12 border-t border-gray-200">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <LayoutDashboard className="text-blue-600" /> แดชบอร์ดสรุปผล
            </h2>
            <p className="text-gray-500 mt-2">
              สรุปผลการรับฟังความคิดเห็นและการกำหนดนโยบาย (ข้อมูลอัปเดตแบบเรียลไทม์)
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full md:w-auto">
            <button 
              onClick={refetch}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              title="อัปเดตข้อมูลล่าสุด"
            >
              <RefreshCw size={16} className={loading ? "animate-spin text-blue-500" : "text-gray-500"} />
              <span className="font-medium">รีเฟรชอัปเดต</span>
            </button>
            <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              อัปเดตล่าสุด: {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
            </div>
          </div>
        </div>

        <SummaryCards data={data} />
        <ChartsSection data={data} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src="/logoCopyDsp.png" alt="Logo" className="h-10 w-auto" />
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">กองยุทธศาสตร์และแผนงาน</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 mt-4">
        
        {/* Form Component */}
        <FeedbackForm apiUrl={API_URL} />

        {/* Dashboard Component */}
        {renderDashboard()}

      </main>
      
    </div>
  );
}

export default App;
