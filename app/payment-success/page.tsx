import React from "react";
import Link from "next/link";

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full flex flex-col items-center">
        <svg className="w-20 h-20 text-green-500 mb-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2l4-4" /></svg>
        <h1 className="text-3xl font-bold text-green-700 mb-2 text-center">Payment Successful!</h1>
        <p className="text-gray-700 text-center mb-6">Thank you for your purchase. Your payment has been processed successfully.<br/>A receipt has been sent to your email.</p>
        <Link href="/">
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow transition">Back to Home</button>
        </Link>
      </div>
    </div>
  );
} 