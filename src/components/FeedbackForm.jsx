import React, { useState } from "react";
import { Send, CheckCircle, AlertCircle } from "lucide-react";

// ค่า Secret ที่ใช้ร่วมกับ Apps Script (ต้องตรงกันทั้ง 2 ฝั่ง)
const SHARED_SECRET = 'GYP_FDDS_2569';

export const FeedbackForm = ({ apiUrl }) => {
  const [formData, setFormData] = useState({
    stakeholder_type: "",
    service_category: "",
    suggestions: "",
    address_line_2: "", // Honeypot - ซ่อนจากผู้ใช้ทั่วไป บอทจะกรอกอัตโนมัติ
  });

  const [statusText, setStatusText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // === Method B: Client-side Rate Limiting ===
    // ป้องกันการกดส่งซ้ำถี่เกินไป (ฝั่ง Browser)
    const RATE_LIMIT_KEY = 'last_submit_time';
    const RATE_LIMIT_MS = 30000; // 30 วินาที
    const lastSubmit = parseInt(localStorage.getItem(RATE_LIMIT_KEY) || '0');
    if (Date.now() - lastSubmit < RATE_LIMIT_MS) {
      const remaining = Math.ceil((RATE_LIMIT_MS - (Date.now() - lastSubmit)) / 1000);
      setStatusText(`กรุณารอ ${remaining} วินาที ก่อนส่งความเห็นครั้งถัดไปครับ`);
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setStatusText("กำลังส่งข้อมูล...");
    setIsSuccess(false);

    try {
      // ฟังก์ชันสำหรับกรองข้อความ (Sanitize) เพื่อป้องกันการฝัง Script (XSS) และ Formula Injection
      const sanitizeInput = (str) => {
        if (typeof str !== "string") return str;
        let sanitized = str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        if (/^[=+\-@\t\r\n]/.test(sanitized)) {
          sanitized = "'" + sanitized;
        }
        return sanitized;
      };

      // === Method A: Timestamp Token ===
      // สร้าง Token = timestamp + Secret เพื่อให้ Apps Script ยืนยันว่า request มาจากหน้าเว็บจริงๆ
      const nowTs = Date.now().toString();
      const tokenRaw = nowTs + SHARED_SECRET;
      // Hash แบบง่าย (djb2) เพื่อส่งไปยืนยันฝั่ง Server
      let hash = 5381;
      for (let i = 0; i < tokenRaw.length; i++) {
        hash = ((hash << 5) + hash) + tokenRaw.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
      }
      const clientToken = Math.abs(hash).toString(16);

      const dataToSend = new URLSearchParams({
        stakeholder_type: sanitizeInput(formData.stakeholder_type),
        service_category: sanitizeInput(formData.service_category),
        suggestions: sanitizeInput(formData.suggestions),
        address_line_2: formData.address_line_2 || '', // Honeypot
        _t: nowTs,           // Timestamp สำหรับตรวจสอบ
        _tk: clientToken,    // Token hash สำหรับยืนยัน
      });

      const response = await fetch(apiUrl, {
        method: "POST",
        body: dataToSend,
        mode: "no-cors",
      });
      void response;

      // บันทึกเวลาส่งสำเร็จ สำหรับ Rate Limiting รอบถัดไป
      localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());

      setIsSuccess(true);
      setStatusText(
        "ส่งข้อความสำเร็จ! ขอบคุณสำหรับความคิดเห็นของคุณ ระบบกำลังเคลียร์ข้อมูลฟอร์ม...",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Submission Error:", error);
      setStatusText("เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง");
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
          <p className="mt-1 text-blue-100 opacity-90">
            กองยุทธศาสตร์และแผนงาน ด้านการให้บริการ
          </p>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {statusText && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${isSuccess ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
          >
            {isSuccess ? <CheckCircle /> : <AlertCircle />}
            <span className="font-medium">{statusText}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: ข้อมูลผู้แสดงความคิดเห็น */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              ข้อมูลทั่วไป
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  กลุ่มผู้แสดงความคิดเห็น{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  name="stakeholder_type"
                  value={formData.stakeholder_type}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- เลือกกลุ่ม --</option>
                  <option value="ประชาชนทั่วไป">ประชาชนทั่วไป</option>
                  <option value="ภาคเอกชน">ภาคเอกชน (บริษัท/ห้างร้าน)</option>
                  <option value="ภาครัฐอื่น">หน่วยงานภาครัฐอื่น</option>
                  <option value="หน่วยงานภายใน">หน่วยงานภายใน</option>
                  <option value="นักวิชาการ">องค์กรอิสระ/นักวิชาการ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  หมวดหมู่บริการ <span className="text-red-500">*</span>
                </label>
                <select
                  name="service_category"
                  value={formData.service_category}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- เลือกหมวดหมู่ --</option>
                  <option value="ด้านการพัฒนาและขับเคลื่อนนโยบายและยุทธศาสตร์ด้านการป้องกันควบคุมโรคและภัยสุขภาพ">
                    1.
                    ด้านการพัฒนาและขับเคลื่อนนโยบายและยุทธศาสตร์ด้านการป้องกันควบคุมโรคและภัยสุขภาพ
                  </option>
                  <option value="ด้านการจัดทำงบประมาณ">
                    2. ด้านการจัดทำงบประมาณ
                  </option>
                  <option value="ด้านการจัดทำและบริหารแผนปฏิบัติราชการ">
                    3. ด้านการจัดทำและบริหารแผนปฏิบัติราชการ
                  </option>
                  <option value="ด้านการติดตาม กำกับ สนับสนุน และประเมินผลการดำเนินงาน">
                    4. ด้านการติดตาม กำกับ สนับสนุน และประเมินผลการดำเนินงาน
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Dynamic Form based on Category */}
          {[
            "ด้านการพัฒนาและขับเคลื่อนนโยบายและยุทธศาสตร์ด้านการป้องกันควบคุมโรคและภัยสุขภาพ",
            "ด้านการจัดทำงบประมาณ",
            "ด้านการจัดทำและบริหารแผนปฏิบัติราชการ",
            "ด้านการติดตาม กำกับ สนับสนุน และประเมินผลการดำเนินงาน",
          ].includes(formData.service_category) && (
            <div className="space-y-4 bg-green-50 p-6 rounded-xl border border-green-100">
              <h3 className="text-lg font-semibold text-green-800 border-b border-green-200 pb-2">
                {formData.service_category}
              </h3>
              <div className="grid grid-cols-1 gap-4 mt-4">
                <div>
                  <textarea
                    name="suggestions"
                    value={formData.suggestions}
                    onChange={handleChange}
                    required
                    maxLength="2000"
                    rows="3"
                    placeholder=""
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Honeypot Field - ซ่อนจากคนจริง บอทจะเห็นและกรอก */}
          <input
            type="text"
            name="address_line_2"
            value={formData.address_line_2}
            onChange={handleChange}
            autoComplete="off"
            tabIndex="-1"
            aria-hidden="true"
            style={{ opacity: 0, position: 'absolute', left: '-9999px', height: 0, width: 0 }}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 text-white font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? (
              <>กำลังส่งข้อมูล...</>
            ) : (
              <>
                <Send size={20} /> ส่งความเห็น (Submit)
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
