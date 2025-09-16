import React from "react";
import Image from "next/image";
import { PaymentCard } from "./PaymentCard";
import { PaymentSuccessState } from "../hooks/usePaymentSuccess";

interface PaymentUIProps {
  state: PaymentSuccessState;
}

export const PaymentUI: React.FC<PaymentUIProps> = ({ state }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Logo without circle - clean and simple */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-2xl border border-white/40">
          <Image 
            src="/favicon.ico" 
            alt="Driving School Logo" 
            width={80} 
            height={80}
            className="rounded-lg"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-6 relative z-10">
        <div className="w-full max-w-2xl">
          <PaymentCard state={state} />
        </div>
      </div>
    </div>
  );
};
