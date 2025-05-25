"use client";

import React, { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-300 py-3">
      <button
        className="flex justify-between items-center w-full text-left font-semibold text-lg text-black"
        onClick={() => setIsOpen(!isOpen)}
      >
        {question}
        <FaChevronDown className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <p className="mt-2 text-gray-600" dangerouslySetInnerHTML={{ __html: answer }} />
      )}
    </div>
  );
};

const FAQSection = ({ title, faqs }: { title: string; faqs: FAQItemProps[] }) => {
  return (
    <section className="max-w-4xl mx-auto py-12 px-6">
      <h2 className="text-3xl font-extrabold text-center mb-6 text-black">{title}</h2>
      <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
        {faqs.map((faq, index) => (
          <FAQItem key={index} {...faq} />
        ))}
      </div>
    </section>
  );
};

const FAQPage = () => {
  const [drivingLessonsFaqs, setDrivingLessonsFaqs] = useState<FAQItemProps[]>([]);
  const [adiFaqs, setAdiFaqs] = useState<FAQItemProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/faq")
      .then(res => res.json())
      .then(data => {
        setDrivingLessonsFaqs(data?.drivingLessons || []);
        setAdiFaqs(data?.advancedDrivingImprovementCourse || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 pt-40 pb-20">
      <h1 className="text-4xl font-extrabold text-center mb-16 text-black">Frequently Asked Questions</h1>
      <FAQSection title="Driving Lessons" faqs={drivingLessonsFaqs} />
      <div className="py-12" />
      <FAQSection title="Advanced Driving Improvement Course" faqs={adiFaqs} />
    </div>
  );
};

export default FAQPage;
