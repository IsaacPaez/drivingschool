"use client";
import React, { useEffect, useRef, useState, Suspense } from "react";
import { useCart } from "@/app/context/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function PaymentSuccessContent() {
  const { clearCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasInitialized = useRef(false);
  const [countdown, setCountdown] = useState(5);
  const [transactionStatus, setTransactionStatus] = useState<string>("checking");
  const [orderStatus, setOrderStatus] = useState<string>("pending");
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [currentCard, setCurrentCard] = useState(0);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const checkTransactionAndUpdateOrder = async () => {
      const userId = searchParams ? searchParams.get("userId") : null;
      const orderId = searchParams ? searchParams.get("orderId") : null;
      
      if (userId && orderId) {
        try {
          const transactionResponse = await fetch(`/api/transactions/check-status`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId }),
          });
          
          if (transactionResponse.ok) {
            const transactionData = await transactionResponse.json();
            
            if (transactionData.success) {
              setTransactionStatus("approved");
              setOrderStatus("completed");
              
              try {
                const orderResponse = await fetch(`/api/orders/details?orderId=${orderId}`);
                if (orderResponse.ok) {
                  const orderData = await orderResponse.json();
                  setOrderDetails(orderData.order);
                }
              } catch (error) {
                console.error("Error fetching order details:", error);
              }
            } else {
              setTransactionStatus("pending");
              setOrderStatus("pending");
            }
          } else {
            setTransactionStatus("error");
          }
        } catch (error) {
          console.error("Error checking transaction status:", error);
          setTransactionStatus("error");
        }
      } else {
        setTransactionStatus("error");
      }
    };

    clearCart();
    localStorage.removeItem("cart");
    checkTransactionAndUpdateOrder();
    
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          router.replace("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(countdownTimer);
  }, []);

  // Animación de tarjetas deslizantes
  useEffect(() => {
    const cardInterval = setInterval(() => {
      setCurrentCard(prev => (prev + 1) % 3);
    }, 4000);
    
    return () => clearInterval(cardInterval);
  }, []);

  const getStatusIcon = () => {
    switch (transactionStatus) {
      case "approved":
        return (
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-emerald-300 rounded-full animate-ping opacity-75"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-emerald-400 rounded-full animate-ping opacity-50" style={{animationDelay: '0.5s'}}></div>
          </div>
        );
      case "pending":
        return (
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          </div>
        );
    }
  };

  const getStatusMessage = () => {
    switch (transactionStatus) {
      case "approved":
        return {
          title: "Transaction Successful",
          subtitle: "Payment Confirmed",
          description: "Your order has been processed successfully. You will receive a confirmation email shortly.",
          statusClass: "text-emerald-600",
          bgClass: "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200",
          countdownClass: "text-emerald-700"
        };
      case "pending":
        return {
          title: "Processing Payment",
          subtitle: "Verifying Transaction",
          description: "We are confirming your payment details. This may take a few moments.",
          statusClass: "text-amber-600",
          bgClass: "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200",
          countdownClass: "text-amber-700"
        };
      case "error":
        return {
          title: "Verification Failed",
          subtitle: "Unable to Confirm Payment",
          description: "Please contact our support team for assistance with your transaction.",
          statusClass: "text-red-600",
          bgClass: "bg-gradient-to-r from-red-50 to-pink-50 border-red-200",
          countdownClass: "text-red-700"
        };
      default:
        return {
          title: "Verifying Payment",
          subtitle: "Processing Information",
          description: "Please wait while we verify your transaction details.",
          statusClass: "text-blue-600",
          bgClass: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200",
          countdownClass: "text-blue-700"
        };
    }
  };

  const statusInfo = getStatusMessage();

  const cards = [
    {
      title: "Security Verified",
      description: "Your payment is protected by industry-standard encryption",
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2l4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: "Instant Processing",
      description: "Your order will be available immediately after confirmation",
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: "24/7 Support",
      description: "Our team is available to help with any questions",
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-600 to-blue-700 rounded-full opacity-10 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-600 to-pink-700 rounded-full opacity-5 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Logo */}
      <div className="absolute top-8 left-8 z-20">
        <Image
          src="/DV-removebg-preview.png"
          alt="Driving School Logo"
          width={60}
          height={60}
          className="object-contain"
        />
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 flex flex-col items-center text-center relative z-10 border border-white/20">
        {getStatusIcon()}
        
        <h1 className={`text-3xl font-bold mb-3 ${statusInfo.statusClass} tracking-tight`}>
          {statusInfo.title}
        </h1>
        
        <p className="text-lg text-gray-600 mb-2 font-medium">
          {statusInfo.subtitle}
        </p>
        
        <p className="text-gray-500 mb-6 leading-relaxed text-sm max-w-sm">
          {statusInfo.description}
        </p>

        {/* Order Details Card */}
        {orderDetails && transactionStatus === "approved" && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6 w-full">
            <h3 className="text-base font-semibold text-blue-800 mb-3">Order Summary</h3>
            <div className="space-y-2 text-left text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order Number</span>
                <span className="font-mono text-xs text-gray-800">{orderDetails.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount</span>
                <span className="font-bold text-emerald-600">${orderDetails.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  Completed
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Sliding Cards */}
        <div className="w-full max-w-sm mb-6">
          <div className="relative h-24 overflow-hidden rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
            {cards.map((card, index) => (
              <div
                key={index}
                className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out ${
                  index === currentCard 
                    ? 'translate-x-0 opacity-100' 
                    : index < currentCard 
                      ? '-translate-x-full opacity-0' 
                      : 'translate-x-full opacity-0'
                }`}
              >
                <div className="flex items-center space-x-3 px-4">
                  <div className="flex-shrink-0">
                    {card.icon}
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-semibold text-gray-800">{card.title}</h4>
                    <p className="text-xs text-gray-600">{card.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className={`${statusInfo.bgClass} border rounded-xl p-4 mb-6 w-full`}>
          <div className="flex items-center justify-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className={`text-sm font-semibold ${statusInfo.countdownClass}`}>
              Redirecting in {countdown} seconds
            </span>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          </div>
        </div>
        
        <div className="flex space-x-3 w-full">
          <button 
            onClick={() => router.replace("/")}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-sm"
          >
            Return to Home
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-300 border border-gray-300 hover:shadow-lg text-sm"
          >
            Verify Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-600 to-blue-700 rounded-full opacity-10 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-600 to-pink-700 rounded-full opacity-5 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="absolute top-8 left-8 z-20">
          <Image
            src="/DV-removebg-preview.png"
            alt="Driving School Logo"
            width={60}
            height={60}
            className="object-contain"
          />
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 flex flex-col items-center text-center relative z-10 border border-white/20">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          </div>
          <h1 className="text-3xl font-bold text-blue-600 mb-3 tracking-tight">Verifying Payment</h1>
          <p className="text-lg text-gray-600 mb-2 font-medium">Processing Information</p>
          <p className="text-gray-500 text-sm max-w-sm">Please wait while we verify your transaction details.</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}