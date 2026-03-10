import React, { useState } from 'react';
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
  });


  const [statusText, setStatusText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

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
    
    // ตรวจสอบว่าเช็ค PDPA หรือยัง
    if (!formData.pdpa_consent) {
      alert('กรุณาติ๊กช่อง "ข้าพเจ้าให้ความยินยอมฯ" เพื่อยอมรับข้อกำหนดและเงื่อนไขก่อนส่งข้อมูล');
      setStatusText('กรุณาติ๊กยินยอมให้เก็บรวบรวมข้อมูลส่วนบุคคล (PDPA) ก่อนส่งแบบฟอร์ม');
      setIsSuccess(false);
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

      // Because of 'no-cors', response.ok will be false/opaque, so we assume success if no error thrown
      setIsSuccess(true);
      setStatusText('ส่งข้อเสนอแนะสำเร็จ! ขอบคุณสำหรับความคิดเห็นของคุณ');
      
      // Reset form
      setFormData({
        stakeholder_type: '', service_category: '', contact_channel: '',
        satisfaction_score: '', pain_points: '', suggestions: '', new_ideas: '',
        contact_name: '', contact_phone: '', contact_email: '', pdpa_consent: false,
      });

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
      <div className="bg-blue-600 p-6 text-white text-center">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <FileText /> แบบฟอร์มแสดงความคิดเห็น
        </h2>
        <p className="mt-2 text-blue-100">เราใส่ใจทุกเสียงสะท้อนของคุณ เพื่อนำไปพัฒนานโยบายและบริการให้ดียิ่งขึ้น</p>
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
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">1. ข้อมูลทั่วไป</h3>
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
                  <option value="แจ้งเรื่องร้องเรียน">แจ้งเรื่องร้องเรียน</option>
                  <option value="ข้อเสนอแนะ ข้อคิดเห็น">ข้อเสนอแนะ ข้อคิดเห็น</option>
                </select>
              </div>

            </div>
          </div>

          {/* Section 2: Dynamic Form based on Category */}
          {formData.service_category === 'แจ้งเรื่องร้องเรียน' && (
            <div className="space-y-4 bg-red-50 p-6 rounded-xl border border-red-100">
              <h3 className="text-lg font-semibold text-red-800 border-b border-red-200 pb-2">2. รายละเอียดการแจ้งเรื่องร้องเรียน</h3>
              <div className="grid grid-cols-1 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ปัญหาที่พบ หรือ เรื่องที่ต้องการร้องเรียน <span className="text-red-500">*</span></label>
                  <textarea name="pain_points" value={formData.pain_points} onChange={handleChange} required rows="4" placeholder="ระบุรายละเอียดปัญหา บาดแผล หรือเหตุการณ์ที่คุณพบเจออย่างละเอียด..." className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ข้อเสนอแนะในการปรับปรุงแก้ไข (ถ้ามี)</label>
                  <textarea name="suggestions" value={formData.suggestions} onChange={handleChange} rows="3" placeholder="สิ่งที่คุณต้องการให้หน่วยงานดำเนินการแก้ไขหรือปรับปรุง..." className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"></textarea>
                </div>
              </div>
            </div>
          )}

          {formData.service_category === 'ข้อเสนอแนะ ข้อคิดเห็น' && (
            <div className="space-y-4 bg-green-50 p-6 rounded-xl border border-green-100">
              <h3 className="text-lg font-semibold text-green-800 border-b border-green-200 pb-2">2. ข้อเสนอแนะและข้อคิดเห็น</h3>
              <div className="grid grid-cols-1 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ข้อเสนอแนะ <span className="text-red-500">*</span></label>
                  <textarea name="suggestions" value={formData.suggestions} onChange={handleChange} required rows="3" placeholder="สิ่งที่คุณอยากให้เราแก้ไขหรือพัฒนา..." className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ไอเดีย หรือ โครงการใหม่ๆ ที่อยากเห็น (ถ้ามี)</label>
                  <textarea name="new_ideas" value={formData.new_ideas} onChange={handleChange} rows="2" placeholder="นวัตกรรม หรือบริการรูปแบบใหม่ที่คุณอยากให้มี..." className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: ข้อมูลส่วนตัว (PII) */}
          <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">2. ข้อมูลติดต่อ (ข้อมูลส่วนตัวจะไม่ถูกเปิดเผยต่อสาธารณะ)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                <input type="text" name="contact_name" value={formData.contact_name} onChange={handleChange} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                <input type="tel" name="contact_phone" value={formData.contact_phone} onChange={handleChange} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                <h4 className="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">i</span>
                  ข้อกำหนดและเงื่อนไขการใช้บริการ
                </h4>
                
                <div 
                  className="text-sm text-gray-700 space-y-4 max-h-64 overflow-y-auto pr-2 mb-6 custom-scrollbar"
                  onScroll={handleScroll}
                >
                  <div>
                    <h5 className="font-bold text-base text-gray-900 mb-2">ข้าพเจ้าให้ความยินยอมในการเก็บรวบรวมข้อมูลส่วนบุคคล</h5>
                    <p className="font-bold mb-1">ข้อกำหนดและเงื่อนไข</p>
                    <p className="ml-4 text-gray-600">ข้อกำหนดและเงื่อนไขฉบับนี้ ถือเป็นข้อตกลงระหว่างกรมควบคุมโรคและผู้ใช้บริการ</p>
                    <p className="ml-4 text-gray-600">ข้าพเจ้าเข้าใจดีว่ากองโรคติดต่อทั่วไปจะเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของข้าพเจ้า เพื่อวัตถุประสงค์ในการให้บริการตามสัญญานี้ การวิเคราะห์ข้อมูลเพื่อนำไปแก้ไขหรือพัฒนา แจ้งผลความคืบหน้า รวมถึงวัตถุประสงค์อื่นๆ ตามที่กองโรคติดต่อทั่วไปเห็นสมควร</p>
                  </div>

                  <div>
                    <h5 className="font-bold text-gray-900 mb-1">1. ข้อมูลส่วนบุคคลที่เก็บรวบรวม</h5>
                    <p className="mb-2">ข้าพเจ้าให้ความยินยอมแก่ ส่วนราชการ ในการเก็บรวบรวมข้อมูลส่วนบุคคล อันได้แก่</p>
                    <ul className="list-disc ml-8 space-y-1 text-gray-600">
                      <li>ข้อมูลส่วนบุคคลทั่วไป เช่น ชื่อ-นามสกุล เบอร์โทรติดต่อ และ อีเมล ของข้าพเจ้าตามที่ระบุในแบบฟอร์มรับเรื่องแสดงความคิดเห็น รวมถึงนโยบายคุ้มครองความเป็นส่วนตัว สำหรับผู้แสดงความคิดเห็นต่อกรมควบคุมโรค (เฉพาะส่วนของผู้แสดงความคิดเห็น)</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-gray-900 mb-1">2. วัตถุประสงค์ของการเก็บรวบรวม</h5>
                    <ul className="list-disc ml-8 space-y-2 text-gray-600">
                      <li>ข้าพเจ้าให้ความยินยอมแก่ส่วนราชการ ในการใช้และ/หรือเปิดเผยข้อมูลส่วนบุคคลที่เก็บรวบรวมเพื่อประโยชน์ในการ การติดต่อสื่อสารเพื่อแจ้งผลการดำเนินการ รวมถึงเพื่อวัตถุประสงค์ในการพิจารณาและเสนอข้อมูลอื่นๆ</li>
                      <li>โดยข้าพเจ้ารับทราบว่า เพื่อวัตถุประสงค์ดังกล่าว ส่วนราชการ มีความจำเป็นที่จะต้องเปิดเผยข้อมูลส่วนบุคคลที่เก็บรวบรวมให้กับส่วนราชการเพื่อการแจ้งกลับผลการดำเนินการ</li>
                      <li>ข้าพเจ้าจึงให้ความยินยอมแก่ส่วนราชการที่เกี่ยวข้องในการเก็บรวบรวม ใช้ และหรือเปิดเผยข้อมูลส่วนบุคคลที่เก็บรวบรวมเพื่อวัตถุประสงค์ดังกล่าวด้วย</li>
                      <li>ข้าพเจ้ารับทราบว่า ส่วนราชการ จะดำเนินการเก็บรวบรวม ใช้ และ/หรือเปิดเผย ข้อมูลส่วนบุคคลโดยปฏิบัติตามนโยบาย คุ้มครองความเป็นส่วนตัว</li>
                      <li>ข้าพเจ้าได้อ่านรับทราบและเข้าใจข้อความเกี่ยวกับ การเก็บรวบรวม ใช้ และ/หรือเปิดเผยข้อมูลส่วนบุคคล ที่เก็บรวบรวมซึ่งเกี่ยวกับข้าพเจ้าในหนังสือฉบับนี้โดยตลอดแล้วเห็นว่าถูกต้องตรงตามเจตนาและความประสงค์ของ ข้าพเจ้าทุกประการ รวมทั้ง ข้าพเจ้ายินยอมให้ ส่วนราชการ ดำเนินการเก็บรวบรวม ใช้ และ/หรือเปิดเผยข้อมูลส่วนบุคคล ตามรายละเอียดที่ระบุข้างต้น</li>
                    </ul>
                  </div>
                  
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <p className="text-red-500 font-semibold text-xs md:text-sm">
                      * ข้าพเจ้ารับทราบดีว่า หากข้าพเจ้าไม่ตกลงยอมรับข้อกำหนดและเงื่อนไขนี้ ผู้ให้บริการสงวนสิทธิไม่ให้บริการแก่ข้าพเจ้าได้
                    </p>
                  </div>
                </div>

                <div className={`flex items-start p-4 rounded-lg border ${hasScrolledToBottom ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex-shrink-0 mt-1">
                    <input 
                      type="checkbox" id="pdpa_consent" name="pdpa_consent" 
                      checked={formData.pdpa_consent} onChange={handleChange} required 
                      disabled={!hasScrolledToBottom}
                      className={`w-5 h-5 rounded focus:ring-blue-500 ${hasScrolledToBottom ? 'text-blue-600 border-gray-300 cursor-pointer' : 'text-gray-400 border-gray-300 bg-gray-100 cursor-not-allowed'}`} 
                    />
                  </div>
                  <label htmlFor="pdpa_consent" className={`ml-3 text-sm font-medium ${hasScrolledToBottom ? 'text-gray-800 cursor-pointer' : 'text-gray-500 cursor-not-allowed'}`}>
                    ข้าพเจ้าให้ความยินยอมในการเก็บรวบรวมข้อมูลส่วนบุคคล ตามข้อกำหนดและเงื่อนไขข้างต้น <span className="text-red-500">*</span>
                    {!hasScrolledToBottom && (
                      <span className="block mt-1 text-xs text-red-600 font-bold">
                        (กรุณาเลื่อนอ่านข้อกำหนดและเงื่อนไขด้านบนให้ครบถ้วนก่อนติ๊กยอมรับ)
                      </span>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 px-6 text-white font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? (
              <>กำลังส่งข้อมูล...</>
            ) : (
              <><Send size={20} /> ส่งความเห็น (Submit)</>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};
