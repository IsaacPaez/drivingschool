"use client";

import ContactForm from "@/app/components/ContactForm";

const ContactPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100 px-6 py-12">
      <h1 className="text-4xl font-extrabold text-[#222] leading-tight text-center mt-32">
        <span className="text-[#27ae60]">CONTACT</span> AFFORDABLE <br />
        DRIVING <span className="text-[#0056b3]">TRAFFIC SCHOOL</span>
      </h1>
      <p className="text-lg text-black text-center max-w-2xl mb-6 mt-10">
        Have questions? Fill out the form below and we will get back to you as soon as possible.
      </p>
      <ContactForm />
    </div>
  );
};

export default ContactPage;
