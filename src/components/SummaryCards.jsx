import React from 'react';
import { Users, Shield, Banknote, ClipboardList, BarChart2 } from 'lucide-react';

const CATEGORY_KEYS = {
  policy:   'ด้านการพัฒนาและขับเคลื่อนนโยบายและยุทธศาสตร์ด้านการป้องกันควบคุมโรคและภัยสุขภาพ',
  budget:   'ด้านการจัดทำงบประมาณ',
  plan:     'ด้านการจัดทำและบริหารแผนปฏิบัติราชการ',
  monitor:  'ด้านการติดตาม กำกับ สนับสนุน และประเมินผลการดำเนินงาน',
};

const CARD_BASE_CLASS =
  'bg-white rounded-xl shadow-sm p-4 flex items-center space-x-4 border border-gray-100 transition-all hover:shadow-md';

/**
 * @typedef {Object.<string, number | string | null | undefined>} FeedbackCategories
 * @typedef {{ total?: number | string | null, categories?: FeedbackCategories | null }} SummaryData
 */

/**
 * แปลงค่าที่รับมาให้เป็น number เสมอ (invalid -> 0)
 * @param {unknown} value
 * @returns {number}
 */
const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const cardsConfig = [
  {
    id: 'total',
    label: 'เรื่องที่รับทั้งหมด',
    icon: Users,
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-600',
  },
  {
    id: 'policy',
    label: 'นโยบายและยุทธศาสตร์ฯ',
    icon: Shield,
    categoryKey: CATEGORY_KEYS.policy,
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-500',
  },
  {
    id: 'budget',
    label: 'การจัดทำงบประมาณ',
    icon: Banknote,
    categoryKey: CATEGORY_KEYS.budget,
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-500',
  },
  {
    id: 'plan',
    label: 'แผนปฏิบัติราชการ',
    icon: ClipboardList,
    categoryKey: CATEGORY_KEYS.plan,
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-500',
  },
  {
    id: 'monitor',
    label: 'ติดตาม/ประเมินผล',
    icon: BarChart2,
    categoryKey: CATEGORY_KEYS.monitor,
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-500',
  },
];


/**
 * @param {{ data?: SummaryData }} props
 */
export const SummaryCards = ({ data = {} }) => {
  // ฟอลแบ็กเผื่อในกรณีที่ตารางยังว่าง หรือข้อมูลยังโหลดไม่เสร็จสมบูรณ์
  const totalFeedbacks = toNumber(data.total);
  const categories = data.categories || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {cardsConfig.map((card) => {
        const Icon = card.icon;
        const count = card.categoryKey
          ? toNumber(categories[card.categoryKey])
          : totalFeedbacks;

        return (
          <div key={card.id} className={CARD_BASE_CLASS}>
            <div className={`p-3 ${card.bgClass} ${card.textClass} rounded-lg`}>
              <Icon size={20} />
            </div>
            <div>
              <p className={`text-xs font-medium text-gray-500 ${card.labelClass || ''}`}>
                {card.label}
              </p>
              <p className="text-xl font-bold text-gray-900">
                {count} <span className="text-xs font-normal text-gray-500">รายการ</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
