"use client";

import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import Image from "next/image";

const faqs = [
  {
    question: "Do I need a learner's permit or a license to take lessons?",
    answer:
      "Yes, you need a learner's permit or a valid driver's license to take lessons with us.",
  },
  {
    question: "Do I have to drive myself to your Driving School?",
    answer:
      "No, our instructors can pick you up from a designated location for your lesson.",
  },
  {
    question: "Are your cars dual controlled?",
    answer:
      "Yes, all our vehicles are dual controlled for maximum safety during lessons.",
  },
  {
    question: "Can I schedule Lessons without my parents?",
    answer:
      "Yes, as long as you meet the age requirements and have a valid learner’s permit.",
  },
  {
    question: "Can I get picked up at home even if my parents aren't there?",
    answer: "Yes, we offer home pick-up services for eligible students.",
  },
  {
    question: "Can I rent one of your cars for the DMV test?",
    answer:
      "Yes, we provide rental vehicles for DMV tests. Contact us for more details.",
  },
];

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-300 py-3">
      <button
        className="flex justify-between items-center w-full text-left font-semibold text-lg text-gray-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        {question}
        <FaChevronDown
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && <p className="mt-2 text-gray-600">{answer}</p>}
    </div>
  );
};

const FAQSection = () => {
  return (
    <section className="max-w-4xl mx-auto py-12 px-6">
      <h2 className="text-4xl font-extrabold text-center mb-6">
        Frequently Asked Questions
      </h2>
      <p className="text-center text-lg text-gray-700 mb-10">Driving Lessons</p>
      <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
        {faqs.map((faq, index) => (
          <FAQItem key={index} {...faq} />
        ))}
      </div>
    </section>
  );
};

const ContactSupport = () => {
  return (
    <section className="mt-12 text-center">
      <h3 className="text-2xl font-semibold">Didn't find an answer?</h3>
      <p className="text-gray-600 mb-6">
        Our team is just an email away and ready to assist you.
      </p>
      <div className="flex justify-center space-x-6 mb-6">
        <Image
          src="/support1.jpg"
          alt="Support"
          width={80}
          height={80}
          className="rounded-full"
        />
        <Image
          src="/support2.jpg"
          alt="Support"
          width={80}
          height={80}
          className="rounded-full"
        />
        <Image
          src="/support3.jpg"
          alt="Support"
          width={80}
          height={80}
          className="rounded-full"
        />
      </div>
      <button className="bg-blue-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-700 transition">
        Contact Us
      </button>
    </section>
  );
};

const FAQPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-16">
      <FAQSection />
      <ContactSupport />
    </div>
  );
};

export default FAQPage;
