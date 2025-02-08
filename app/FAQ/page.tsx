"use client";

import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

const drivingLessonsFaqs = [
  { question: "Do I need a learner's permit or a license to take lessons?", answer: "Yes, it is against the law in the State of Florida to drive without a Driver’s License or Learners Permit." },
  { question: "Do I have to drive myself to your Driving School?", answer: "No, depending on the area you live, work or go to school, we offer pick-up and drop-off service at no extra charge. Call us for more details." },
  { question: "Are your cars dual controlled?", answer: "Yes, At Affordable Driving School all our vehicles are dual controlled vehicles (brake and yes!!, accelerator pedal) that allow us, the Instructors, to have complete control of the automobile in dangerous situations." },
  { question: "Can I schedule Lessons without my parents?", answer: "No, if you are under 18, we need permission from a parent or guardian to be able to schedule any Driving Lessons Appointments." },
  { question: "Can I get picked up at home even if my parents aren't there?", answer: "Yes, as long as Affordable Driving School has permission from your parents to pick you up, they don’t have to be home." },
  { question: "Will I be able to make my own schedule?", answer: "Yes, Here at Affordable Driving School we will do our best to accommodate to your schedule, since we work by appointments, we will do our best to satisfy your needs." },
  { question: "Do I share my lesson with other students?", answer: "No, at Affordable Driving School, you will only obtain one-on-one instruction, meaning that you won’t share your lessons with anyone else. We only offer individual lessons." },
  { question: "What happens if I need more than one lesson?", answer: "At Affordable Driving School we offer different Driving Lesson Packages so our students can save some money. We offer Eight-Hours, Ten-Hours and 12-Hours Driving Packages. Highway Driving is included in all our packages at Instructor's discretion." },
  { question: "Can I rent one of your cars for the DMV test?", answer: "Yes, we provide rental vehicles for DMV tests. Contact us for more details." },
  { question: "Are your instructors state certified?", answer: "Yes, all our instructors are Florida State Certified and undergo extensive training to ensure quality driving instruction." },
  { question: "Do I receive a certificate of completion for insurance discount?", answer: "Yes, upon completion of six or more hours, Students will receive a Certificate of Completion, which is accepted by most insurance companies." },
  { question: "Are gift certificates available for driving lessons?", answer: "Yes, we have gift certificates for driving lessons." }
];

const adiFaqs = [
  { question: "What is an ADI Class?", answer: "ADI Class stands for Advanced Driving Improvement Course." },
  { question: "How many hours is the ADI class?", answer: "The ADI class is 12 Hours." },
  { question: "Where can I attend the 12 hours ADI traffic class?", answer: "At Affordable Driving Traffic School which is conveniently located at: 3167 Forest Hill Blvd. West Palm Beach, FL 33406." },
  { question: "How can I register for the ADI class at Affordable Driving Traffic School?", answer: "You can register by calling (561) 969-0150 or online by Clicking HERE." },
  { question: "Can the ADI class provide an enrollment form to reinstate my Florida Driver's license?", answer: "Yes, you can Register for the 12 Hours ADI Traffic School Class and get a School Enrollment Form at Affordable Driving Traffic School." },
  { question: "Who must attend the ADI class?", answer: "A person who is Court Ordered or required by the Florida DMV due to accumulating too many points or being a Habitual Traffic Offender (HTO)." },
  { question: "Is the ADI class at Affordable Driving Traffic School accepted in other counties?", answer: "Yes, the 12 Hours ADI Traffic School Class taken at Affordable Driving Traffic School is accepted in all Florida Courts and in other States DMVs." },
  { question: "When is the ADI class held?", answer: "The ADI class is available on Wednesdays from 10:00 am to 10:00 pm and Saturdays from 8:30 am to 8:30 pm." },
  { question: "What is the cost of the ADI class?", answer: "The cost of the ADI Class is $100.00 with no hidden fees." }
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
        className="flex justify-between items-center w-full text-left font-semibold text-lg text-black"
        onClick={() => setIsOpen(!isOpen)}
      >
        {question}
        <FaChevronDown className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <p className="mt-2 text-gray-600">
          {answer.includes("HERE") ? (
            <>{answer.replace("HERE", "")} <a href="/Book-Now" className="text-blue-600 font-semibold">HERE</a></>
          ) : (
            answer
          )}
        </p>
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
