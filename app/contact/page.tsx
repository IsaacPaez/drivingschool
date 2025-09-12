"use client";

import ContactForm from "@/app/components/ContactForm";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-40 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            <span className="text-green-600">CONTACT</span>{" "}
            <span className="text-gray-900">AFFORDABLE</span>{" "}
            <span className="text-blue-600">DRIVING</span>{" "}
            <span className="text-gray-900">TRAFFIC SCHOOL</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Have questions? Fill out the form below and we will get back to you as soon as possible.
          </p>
        </div>
        
        {/* Contact Form */}
        <ContactForm />
      </div>
    </div>
  );
};

export default ContactPage;
