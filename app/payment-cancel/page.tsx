import React from "react";
import Link from "next/link";

export default function PaymentCancel() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-100 to-yellow-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full flex flex-col items-center">
        <svg className="w-20 h-20 text-yellow-500 mb-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" /></svg>
        <h1 className="text-3xl font-bold text-yellow-700 mb-2 text-center">Payment Cancelled</h1>
        <p className="text-gray-700 text-center mb-6">Your payment was not completed. If you wish to try again, please return to the checkout page.</p>
        <Link href="/">
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg shadow transition">Back to Home</button>
        </Link>
      </div>
    </div>
  );
} 