import React from "react";
import Image from "next/image";

export const PaymentFallback: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Floating Logo with Glass Effect */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="relative">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-2xl border border-white/20 hover:scale-110 transition-transform duration-500">
            <Image 
              src="/favicon.ico" 
              alt="Driving School Logo" 
              width={48} 
              height={48}
              className="rounded-xl drop-shadow-lg"
            />
          </div>
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-3xl blur-xl -z-10 animate-pulse"></div>
        </div>
      </div>

      {/* Loading Content */}
      <div className="flex items-center justify-center min-h-screen p-6 relative z-10">
        <div className="w-full max-w-lg">
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/30 via-blue-500/30 to-blue-600/30 rounded-3xl blur-xl opacity-75 animate-pulse"></div>
            
            {/* Main Card */}
            <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-12 border border-white/20">
              <div className="text-center">
                {/* Loading Icon */}
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-2xl border-4 border-white">
                    <div className="animate-spin rounded-full h-10 w-10 border-3 border-white border-t-transparent"></div>
                  </div>
                  <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-xl scale-110 animate-pulse"></div>
                </div>
                
                <h1 className="text-4xl font-black mb-6 text-blue-600 tracking-tight">
                  Loading...
                </h1>
                
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-8 border border-gray-200/50">
                  <p className="text-xl text-gray-800 mb-2 font-semibold">
                    Processing your information
                  </p>
                  
                  <p className="text-gray-600 leading-relaxed">
                    Please wait while we verify your transaction details.
                  </p>
                </div>

                {/* Loading Animation */}
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200/50 rounded-2xl p-6 shadow-inner">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <p className="text-lg font-bold text-blue-700">
                      Verifying payment status...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
