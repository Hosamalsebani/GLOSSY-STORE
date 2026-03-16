'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: "Do you offer delivery across Libya?",
    answer: "Yes, we proudly deliver our luxury beauty products to all major cities in Libya including Tripoli, Benghazi, Misrata, Zawiya, Zliten, Khoms, Sabha, Sirte, and Ajdabiya."
  },
  {
    question: "How long does delivery take?",
    answer: "Delivery usually takes 1–3 business days depending on your city. Our team will contact you by phone to confirm the order before shipping."
  },
  {
    question: "How can I pay for my order?",
    answer: "We currently accept cash on delivery (COD) for all orders within Libya. Simply pay the delivery agent when you receive your package."
  },
  {
    question: "Are your products 100% authentic?",
    answer: "Absolutely. Quality and authenticity are our top priorities. All our luxury cosmetics and skincare products are sourced directly from authorized distributors and the brands themselves."
  },
  {
    question: "What is your return policy?",
    answer: "We accept returns for unopened and unused products in their original packaging within 14 days of delivery. For hygiene reasons, opened cosmetics cannot be returned unless they are defective."
  },
  {
    question: "How do I track my order?",
    answer: "Once your order is confirmed, our delivery team will contact you. You can also reach out to our customer support with your order number for real-time updates."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-serif text-[var(--color-luxury-black)] text-center mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-500 text-center mb-12">
          Find answers to common questions about our products, delivery, and services.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300"
            >
              <button
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none bg-white hover:bg-gray-50 transition-colors"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
              >
                <span className="font-medium text-lg text-[var(--color-luxury-black)] pr-8">
                  {faq.question}
                </span>
                <span className={`flex-shrink-0 text-[var(--color-rose-gold)] transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-6 h-6" />
                </span>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-[var(--color-rose-gold)]/5 p-8 rounded-xl border border-[var(--color-rose-gold)]/20">
          <h2 className="text-2xl font-serif text-[var(--color-luxury-black)] mb-3">Still have questions?</h2>
          <p className="text-gray-600 mb-6">If you couldn't find the answer you were looking for, our team is ready to help.</p>
          <a href="/en/contact" className="inline-block bg-[var(--color-luxury-black)] text-white px-8 py-3 uppercase tracking-wider text-sm font-medium hover:bg-gray-800 transition-colors">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
