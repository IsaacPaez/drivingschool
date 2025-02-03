"use client";

import { useState } from "react";
import Image from "next/image";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    subject: "General Inquiry",
    inquiry: "",
  });

  const subjects = [
    "General Inquiry",
    "Account Inquiry",
    "Reschedule a booking",
    "Cancel a booking",
    "12hr (ADI) Advanced Driving Improvement Class",
    "12hr ADI Advanced Driving Improvement Multi Day",
    "3 Crashes in 3 Years",
    "4 hr (BDI) Basic Driving Improvement Class",
    "4 hr / 8 hr Youthful Offender Class",
    "4hr Traffic Law & Substance Abuse Class",
    "8 hr Aggressive Driving Improvement Class",
    "8hr Court Ordered IDI Intermediate Driving Improvement Class",
    "Corporate Programs",
    "Driving Lessons",
    "Driving Test",
    "Senior Insurance Discount",
    "Written Test",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted", formData);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6 py-10">
      {/* 📌 CONTENEDOR PRINCIPAL CON DOS SECCIONES */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-8 w-full max-w-5xl">
        {/* 🔹 Contenedor del Formulario */}
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md border border-gray-300">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            {/* Name */}
            <div className="flex flex-col">
              <label className="font-bold text-black">Name:</label>
              <input
                type="text"
                name="name"
                className="border border-black text-black rounded-md p-2 w-full"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="font-bold text-black">Email:</label>
              <input
                type="email"
                name="email"
                className="border border-black text-black rounded-md p-2 w-full"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col">
              <label className="font-bold text-black">Phone:</label>
              <input
                type="text"
                name="phone"
                className="border border-black text-black rounded-md p-2 w-full"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            {/* City */}
            <div className="flex flex-col">
              <label className="font-bold text-black">City:</label>
              <input
                type="text"
                name="city"
                className="border border-black text-black rounded-md p-2 w-full"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            {/* Subject (Dropdown) */}
            <div className="flex flex-col">
              <label className="font-bold text-black">Subject:</label>
              <select
                name="subject"
                className="border border-black rounded-md p-2 w-full text-black"
                value={formData.subject}
                onChange={handleChange}
              >
                {subjects.map((subject, index) => (
                  <option key={index} value={subject} className="text-black">
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Inquiry (Text Area) */}
            <div className="flex flex-col">
              <label className="font-bold text-black">Inquiry:</label>
              <textarea
                name="inquiry"
                rows={3}
                className="border border-black text-black rounded-md p-2 w-full"
                value={formData.inquiry}
                onChange={handleChange}
              />
            </div>

            {/* ✅ Botón de Enviar (Centrado) */}
            <div className="flex justify-center mt-4">
              <button
                type="submit"
                className="bg-[#27ae60] text-white font-bold py-2 px-6 rounded-md shadow-lg hover:shadow-black hover:bg-[#0056b3] transition hover:-translate-y-3 duration-300 ease-out cursor-pointer active:translate-y-1"
              >
                Send
              </button>
            </div>
          </form>
        </div>

        {/* 🔹 Contenedor de Información de Contacto */}
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg border border-gray-300 flex flex-col items-center">
          <Image src="/DV-removebg-preview.png" alt="Logo" width={120} height={120} className="mb-2" />
          <h3 className="text-lg font-bold text-[#0056b3]">Affordable Driving Traffic School</h3>

          <p className="text-gray-600 flex items-center mt-3">
            📞 <span className="font-bold text-black ml-2">561 735 1615</span>
          </p>
          <p className="text-gray-600 mt-2">
            ✉️ <a href="mailto:info@drivingschoolpalmbeach.com" className="text-[#0056b3] hover:underline">info@drivingschoolpalmbeach.com</a>
          </p>

          <div className="text-left mt-4">
            <p className="text-black font-bold">Phone:</p>
            <p className="text-[#0056b3] font-bold">561 330 7007</p>
            <p className="text-black font-bold mt-2">Address:</p>
            <p className="text-black">3167 Forest Hill Blvd West, Palm Beach, Florida 33406</p>
            <p className="text-black font-bold mt-2">Email:</p>
            <p className="text-[#0056b3] hover:underline">
              <a href="mailto:info@drivingschoolpalmbeach.com">info@drivingschoolpalmbeach.com</a>
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ContactPage;
