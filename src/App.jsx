import React, { useState } from 'react';
import { useFeedbackData } from './hooks/useFeedbackData';
import { SummaryCards } from './components/SummaryCards';
import { ChartsSection } from './components/ChartsSection';
import { DataTable } from './components/DataTable';
import { FeedbackForm } from './components/FeedbackForm';
import { RefreshCw, AlertCircle, LayoutDashboard, Edit3 } from 'lucide-react';

// Use environment variable instead of hardcoded string for security
const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const { data, loading, error, refetch } = useFeedbackData(API_URL);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

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

    if (data.length === 0) {
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

    // --- Extract Year Safely (Handle Both CE and BE from string) ---
    const getBuddhistYear = (dateString) => {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return null;
      let year = d.getFullYear();
      // If year is less than 2500, it's likely CE/AD, so we add 543 to make it BE
      // If it's already 25xx or more, it's likely already BE recorded by the system
      if (year < 2500) {
        year += 543;
      }
      return year;
    };

    // --- Filter Logic ---
    // Extract unique years from data for the dropdown
    const availableYears = [...new Set(data.map(item => {
      if (!item.timestamp) return null;
      return getBuddhistYear(item.timestamp);
    }).filter(Boolean))].sort((a, b) => b - a); // Sort descending

    // Filter data based on selected month and year
    const filteredData = data.filter(item => {
      if (!item.timestamp) return false;
      const date = new Date(item.timestamp);
      if (isNaN(date.getTime())) return false; // Skip invalid dates
      
      const itemMonth = (date.getMonth() + 1).toString(); // getMonth is 0-indexed
      const itemYear = getBuddhistYear(item.timestamp)?.toString();

      const monthMatch = selectedMonth === 'all' || itemMonth === selectedMonth;
      const yearMatch = selectedYear === 'all' || itemYear === selectedYear;

      return monthMatch && yearMatch;
    });

    const months = [
      { value: '1', label: 'มกราคม' }, { value: '2', label: 'กุมภาพันธ์' },
      { value: '3', label: 'มีนาคม' }, { value: '4', label: 'เมษายน' },
      { value: '5', label: 'พฤษภาคม' }, { value: '6', label: 'มิถุนายน' },
      { value: '7', label: 'กรกฎาคม' }, { value: '8', label: 'สิงหาคม' },
      { value: '9', label: 'กันยายน' }, { value: '10', label: 'ตุลาคม' },
      { value: '11', label: 'พฤศจิกายน' }, { value: '12', label: 'ธันวาคม' }
    ];

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

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            ตัวกรองข้อมูล
          </div>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 min-w-[150px]"
            >
              <option value="all">ทุกเดือน</option>
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 min-w-[120px]"
            >
              <option value="all">ทุกปี</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option> // ระบบดึงปี พ.ศ. ที่ถูกต้องมาแล้ว
              ))}
            </select>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm mb-8">
            <p className="text-gray-500">ไม่มีข้อมูลในช่วงเวลาที่คุณเลือก</p>
          </div>
        ) : (
          <>
            <SummaryCards data={filteredData} />
            <ChartsSection data={filteredData} />
          </>
        )}
        
        {/* <DataTable data={data} /> ขอซ่อนตารางข้อมูลเอาไว้ก่อนตามที่ต้องการ */}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Edit3 size={20} />
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">Public Feedback Portal</h1>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight sm:hidden">Feedback Portal</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 mt-4">
        
        {/* Header Setup for Form Section */}
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            แบบฟอร์มรับฟังความคิดเห็นสาธารณะ
          </h2>
          <p className="text-gray-500 mt-3 md:text-lg">
            กรุณากรอกข้อมูลเพื่อช่วยเราพัฒนาการให้บริการที่ดีขึ้น ความคิดเห็นของคุณมีความหมายต่อเรา
          </p>
        </div>

        {/* Form Component */}
        <FeedbackForm apiUrl={API_URL} />

        {/* Dashboard Component */}
        {renderDashboard()}

      </main>
      
    </div>
  );
}

export default App;
