import React, { useState, useEffect } from 'react';
import { Send, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export const FeedbackForm = ({ apiUrl }) => {
  const [formData, setFormData] = useState({
    stakeholder_type: '',
    service_category: '',
    contact_channel: '',
    satisfaction_score: '',
    pain_points: '',
    suggestions: '',
    new_ideas: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    pdpa_consent: false,
    address_line_2: '', // Honeypot field
  });


  const [statusText, setStatusText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);

  useEffect(() => {
    const lastSubmission = localStorage.getItem('last_submission_time');
    if (lastSubmission) {
      const timePassed = Math.floor((Date.now() - parseInt(lastSubmission)) / 1000);
      const cooldownRemaining = 180 - timePassed; // 180 seconds = 3 minutes
      if (cooldownRemaining > 0) {
        setCooldownTime(cooldownRemaining);
      } else {
        localStorage.removeItem('last_submission_time');
      }
    }
  }, []);

  useEffect(() => {
    let timer;
    if (cooldownTime > 0) {
      timer = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            localStorage.removeItem('last_submission_time');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownTime]);

  const handleScroll = (e) => {
    // Check if the user has scrolled to the bottom (with a 2px tolerance)
    const bottom = Math.abs(e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight) < 2;
    if (bottom) {
      setHasScrolledToBottom(true);
    }
  };


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ตรวจสอบ Cooldown ป้องกันสแปม
    if (cooldownTime > 0) {
      alert(`กรุณารออีก ${Math.floor(cooldownTime / 60)} นาที ${(cooldownTime % 60).toString().padStart(2, '0')} วินาที เพื่อส่งข้อเสนอแนะครั้งต่อไป`);
      return;
    }

    // ตรวจสอบ Honeypot (ป้องกัน Bot)
    if (formData.address_line_2) {
      console.warn("Spam detected via Honeypot");
      setStatusText('ขออภัย ระบบขัดข้องชั่วคราว (Bot Detection)');
      setIsSuccess(false);
      setLoading(false);
      return;
    }



    setLoading(true);
    setStatusText('กำลังส่งข้อมูล...');
    setIsSuccess(false);

    try {
      // ฟังก์ชันสำหรับกรองข้อความ (Sanitize) เพื่อป้องกันการฝัง Script (XSS) และ Formula Injection ใน Google Sheets
      const sanitizeInput = (str) => {
        if (typeof str !== 'string') return str;
        // 1. แปลงอักขระพิเศษ HTML (ป้องกัน XSS เบื้องต้นแม้ React จะป้องกันให้อยู่แล้วตอนแสดงผล)
        let sanitized = str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        // 2. ป้องกัน Formula Injection ใน Google Sheets (เช่น ฝังสูตร =cmd|... )
        if (/^[=+\-@\t\r\n]/.test(sanitized)) {
          sanitized = "'" + sanitized;
        }
        return sanitized;
      };

      // Create FormData to send as x-www-form-urlencoded (Best for Google Apps Script)
      const dataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        dataToSend.append(key, sanitizeInput(formData[key]));
      });
      // Add a timestamp manually at submission time
      dataToSend.append('timestamp', new Date().toLocaleString('th-TH'));

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: dataToSend,
        // mode: 'no-cors' // Google Apps Script POST sometimes requires no-cors to avoid CORS errors on frontend
      });

      // แสดง Popup ขอบคุณในหน้าเว็บ (กล่องสีเขียว)
      setIsSuccess(true);
      setStatusText('ส่งข้อเสนอแนะสำเร็จ! ขอบคุณสำหรับความคิดเห็นของคุณ ระบบกำลังเคลียร์ข้อมูลฟอร์ม...');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // บันทึกเวลาที่ส่งสำเร็จลงใน Local Storage เพื่อเริ่มนับ Cooldown 3 นาที
      localStorage.setItem('last_submission_time', Date.now().toString());
      setCooldownTime(180);

      // หน่วงเวลา 3 วินาทีเพื่อให้ผู้ใช้อ่านข้อความ แล้วค่อยชาร์จหน้าเว็บใหม่
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (error) {
      console.error("Submission Error:", error);
      setStatusText('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-blue-600 p-6 text-white text-center flex flex-col items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
            แบบฟอร์มแสดงความคิดเห็น
          </h2>
          <p className="mt-1 text-blue-100 opacity-90">กองยุทธศาสตร์และแผนงาน ด้านการให้บริการ</p>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {statusText && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${isSuccess ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {isSuccess ? <CheckCircle /> : <AlertCircle />}
            <span className="font-medium">{statusText}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: ข้อมูลผู้ติดต่อ */}
          <div className="space-y-4">
            {/* Honeypot field - Hidden from users */}
            <div style={{ display: 'none' }} aria-hidden="true">
              <label htmlFor="address_line_2">Please leave this field blank</label>
              <input 
                type="text" 
                id="address_line_2" 
                name="address_line_2" 
                value={formData.address_line_2} 
                onChange={handleChange} 
                tabIndex="-1" 
                autoComplete="off" 
              />
            </div>

            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">ข้อมูลทั่วไป</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">กลุ่มผู้แสดงความคิดเห็น <span className="text-red-500">*</span></label>
                <select name="stakeholder_type" value={formData.stakeholder_type} onChange={handleChange} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">-- เลือกกลุ่ม --</option>
                  <option value="ประชาชนทั่วไป">ประชาชนทั่วไป</option>
                  <option value="ภาคเอกชน">ภาคเอกชน (บริษัท/ห้างร้าน)</option>
                  <option value="ภาครัฐอื่น">หน่วยงานภาครัฐอื่น</option>
                  <option value="หน่วยงานภายใน">หน่วยงานภายใน</option>
                  <option value="นักวิชาการ">องค์กรอิสระ/นักวิชาการ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่บริการ <span className="text-red-500">*</span></label>
                <select name="service_category" value={formData.service_category} onChange={handleChange} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">-- เลือกหมวดหมู่ --</option>

                  <option value="ข้อเสนอแนะ ข้อคิดเห็น">ข้อเสนอแนะ ข้อคิดเห็น</option>
                  <option value="ความคิดเห็นด้านการบริการใหม่">ความคิดเห็นด้านการบริการใหม่</option>
                  <option value="ปรับปรุงบริการเดิมของกองยุทธศาสตร์และแผนงาน">ปรับปรุงบริการเดิมของกองยุทธศาสตร์และแผนงาน</option>
                </select>
              </div>

            </div>
          </div>

          {/* Section 2: Dynamic Form based on Category */}
          {['ข้อเสนอแนะ ข้อคิดเห็น', 'ความคิดเห็นด้านการบริการใหม่', 'ปรับปรุงบริการเดิมของกองยุทธศาสตร์และแผนงาน'].includes(formData.service_category) && (
            <div className="space-y-4 bg-green-50 p-6 rounded-xl border border-green-100">
              <h3 className="text-lg font-semibold text-green-800 border-b border-green-200 pb-2">2. {formData.service_category}</h3>
              <div className="grid grid-cols-1 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ข้อเสนอแนะ <span className="text-red-500">*</span></label>
                  <textarea name="suggestions" value={formData.suggestions} onChange={handleChange} required maxLength="2000" rows="3" placeholder="สิ่งที่คุณอยากให้เราแก้ไขหรือพัฒนา..." className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ไอเดีย หรือ โครงการใหม่ๆ ที่อยากเห็น (ถ้ามี)</label>
                  <textarea name="new_ideas" value={formData.new_ideas} onChange={handleChange} maxLength="2000" rows="2" placeholder="นวัตกรรม หรือบริการรูปแบบใหม่ที่คุณอยากให้มี..." className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"></textarea>
                </div>
              </div>
            </div>
          )}



          <button 
            type="submit" 
            disabled={loading || cooldownTime > 0}
            className={`w-full py-3 px-6 text-white font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 ${loading || cooldownTime > 0 ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? (
              <>กำลังส่งข้อมูล...</>
            ) : cooldownTime > 0 ? (
              <>ระบบป้องกันสแปม (ส่งอีกครั้งใน {Math.floor(cooldownTime / 60)}:{(cooldownTime % 60).toString().padStart(2, '0')} นาที)</>
            ) : (
              <><Send size={20} /> ส่งความเห็น (Submit)</>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};
