import React, { useState } from "react";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <section className="w-full max-w-3xl mx-auto py-12 px-4 md:px-0">
      <h2 className="text-3xl font-bold mb-10 text-center text-gray-900 tracking-wide">常見問題</h2>
      <div className="flex flex-col divide-y divide-gray-200">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="">
              <button
                className={`w-full flex items-center justify-between py-6 px-2 md:px-4 focus:outline-none bg-transparent hover:bg-gray-50 transition`}
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${idx}`}
              >
                <span className="text-lg md:text-xl font-semibold text-left text-gray-900">
                  {faq.question}
                </span>
                <span className="ml-4 flex-shrink-0">
                  {isOpen ? (
                    <svg className="w-7 h-7 text-gray-500 transform transition-transform duration-200 rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="6" y1="18" x2="18" y2="6" />
                    </svg>
                  ) : (
                    <svg className="w-7 h-7 text-gray-500 transform transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  )}
                </span>
              </button>
              <div
                id={`faq-panel-${idx}`}
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-40 opacity-100 mb-4' : 'max-h-0 opacity-0'} px-2 md:px-6`}
                style={{}}
              >
                <div className={`py-2 text-base md:text-lg text-gray-700 whitespace-pre-line`}>{faq.answer}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FAQSection;
