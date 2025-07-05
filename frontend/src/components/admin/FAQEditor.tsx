"use client";
import { FAQ } from "@/services/admin";
import { FaPlus, FaTrash, FaGripVertical } from "react-icons/fa";

interface FAQEditorProps {
  faqs: FAQ[];
  onChange: (faqs: FAQ[]) => void;
}

export default function FAQEditor({ faqs, onChange }: FAQEditorProps) {
  const addFAQ = () => {
    const newFAQ: FAQ = {
      question: "",
      answer: "",
    };
    onChange([...faqs, newFAQ]);
  };

  const removeFAQ = (index: number) => {
    const newFAQs = faqs.filter((_, i) => i !== index);
    onChange(newFAQs);
  };

  const updateFAQ = (index: number, field: keyof FAQ, value: string) => {
    const newFAQs = faqs.map((faq, i) => 
      i === index ? { ...faq, [field]: value } : faq
    );
    onChange(newFAQs);
  };

  const moveFAQ = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === faqs.length - 1) return;

    const newFAQs = [...faqs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newFAQs[index], newFAQs[targetIndex]] = [newFAQs[targetIndex], newFAQs[index]];
    onChange(newFAQs);
  };

  return (
    <div className="space-y-4">
      {faqs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">尚未添加任何常見問答</p>
          <button
            type="button"
            onClick={addFAQ}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <FaPlus className="w-4 h-4" />
            添加第一個問答
          </button>
        </div>
      ) : (
        <>
          {faqs.map((faq, index) => (
            <div key={index} className="rounded-lg p-4 bg-gray-50" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaGripVertical className="text-gray-400" />
                  <span className="font-medium text-gray-700">問答 {index + 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveFAQ(index, 'up')}
                    disabled={index === 0}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFAQ(index, 'down')}
                    disabled={index === faqs.length - 1}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFAQ(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    問題
                  </label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-black"
                    placeholder="請輸入問題"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    回答
                  </label>
                  <textarea
                    value={faq.answer}
                    onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-black"
                    placeholder="請輸入回答"
                  />
                </div>
              </div>

              {/* 預覽 */}
              {(faq.question || faq.answer) && (
                <div className="mt-4 p-3 bg-white rounded border">
                  <p className="text-xs text-gray-500 mb-2">預覽：</p>
                  {faq.question && (
                    <h4 className="font-semibold text-gray-900 mb-2">Q: {faq.question}</h4>
                  )}
                  {faq.answer && (
                    <p className="text-gray-700">A: {faq.answer}</p>
                  )}
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addFAQ}
            className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            添加常見問答
          </button>
        </>
      )}
    </div>
  );
}