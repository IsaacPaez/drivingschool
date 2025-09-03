"use client";
import React, { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasInitialized = useRef(false);
  const [countdown, setCountdown] = useState(5);
  const [transactionStatus, setTransactionStatus] = useState<string>("checking");
  const [orderDetails, setOrderDetails] = useState<{orderNumber: string; total: number} | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);

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
              
              try {
                const orderResponse = await fetch(`/api/orders/details?orderId=${orderId}`);
                if (orderResponse.ok) {
                  const orderData = await orderResponse.json();
                  setOrderDetails(orderData.order);
                  
                  // Update instructor schedule slots to "booked" if this is a driving lesson order
                  if (orderData.order.orderType === 'driving_lesson' && orderData.order.appointments) {
                    console.log('🎯 Updating driving lesson slots to booked status...');
                    console.log('🎯 Order details:', {
                      orderId: orderId,
                      orderType: orderData.order.orderType,
                      appointments: orderData.order.appointments
                    });
                    
                    // Call update-status API to update all slots at once - MUST COMPLETE BEFORE COUNTDOWN
                    try {
                      console.log('🔄 Calling /api/orders/update-status with:', {
                        orderId: orderId,
                        status: 'completed',
                        paymentStatus: 'completed'
                      });
                      
                      const updateResponse = await fetch('/api/orders/update-status', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          orderId: orderId,
                          status: 'completed',
                          paymentStatus: 'completed'
                        })
                      });
                      
                      console.log('🔄 Update response status:', updateResponse.status);
                      
                      if (updateResponse.ok) {
                        const updateResult = await updateResponse.json();
                        console.log('✅ All driving lesson slots updated to booked status:', updateResult);
                        console.log('✅ SLOT UPDATE COMPLETED - Ready for countdown');
                      } else {
                        const errorText = await updateResponse.text();
                        console.error('❌ Failed to update driving lesson slots:', errorText);
                      }
                    } catch (error) {
                      console.error('❌ Error updating driving lesson slots:', error);
                    }
                  } else {
                    console.log('⏭️ Not a driving lesson order or no appointments:', {
                      orderType: orderData.order.orderType,
                      hasAppointments: !!orderData.order.appointments
                    });
                  }
                }
              } catch (error) {
                console.error("Error fetching order details:", error);
              }
            } else {
              setTransactionStatus("pending");
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

      // Después de obtener el resultado, esperar 1 segundo y voltear la carta
      setTimeout(() => {
        setIsCardFlipped(true);
        
        // Después del flip, esperar 1 segundo más y mostrar el countdown
        setTimeout(() => {
          setShowCountdown(true);
          
          // Iniciar countdown después de mostrar el resultado
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
        }, 1000);
      }, 1000); // Reducido a 1 segundo para que sea más rápido
    };

    // Limpiar carrito completamente
    const clearCartCompletely = async () => {
      try {
        const userId = searchParams ? searchParams.get("userId") : null;
        
        // Limpiar localStorage
        localStorage.removeItem("cart");
        
        // Limpiar carrito en la base de datos si hay userId
        if (userId) {
          await fetch("/api/cart", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
          });
          console.log("✅ Carrito limpiado completamente de la base de datos");
        }
        
        console.log("✅ Carrito limpiado completamente");
      } catch (error) {
        console.error("Error limpiando carrito:", error);
      }
    };

    clearCartCompletely();
    checkTransactionAndUpdateOrder();
  }, [router, searchParams]);

  const getStatusIcon = () => {
    switch (transactionStatus) {
      case "approved":
        return (
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-xl border-2 border-white">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-emerald-400/30 rounded-full blur-xl scale-110 animate-pulse"></div>
          </div>
        );
      case "pending":
        return (
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-xl border-2 border-white">
              <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-xl scale-110 animate-pulse"></div>
          </div>
        );
      case "error":
        return (
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-xl border-2 border-white">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-red-400/30 rounded-full blur-xl scale-110 animate-pulse"></div>
          </div>
        );
      default:
        return (
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-xl border-2 border-white">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            </div>
            <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-xl scale-110 animate-pulse"></div>
          </div>
        );
    }
  };

  const getStatusMessage = () => {
    switch (transactionStatus) {
      case "approved":
        return {
          title: "Payment Successful",
          subtitle: "Transaction confirmed",
          description: "Your order has been processed and you will receive a confirmation email shortly.",
          statusClass: "text-emerald-600",
          bgClass: "bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200",
          countdownClass: "text-emerald-700",
          buttonClass: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
        };
      case "pending":
        return {
          title: "Processing Payment",
          subtitle: "Verifying transaction",
          description: "We are confirming your payment. This may take a few moments.",
          statusClass: "text-amber-600",
          bgClass: "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200",
          countdownClass: "text-amber-700",
          buttonClass: "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
        };
      case "error":
        return {
          title: "Verification Failed",
          subtitle: "Unable to confirm payment",
          description: "Please contact our support team if you have any questions.",
          statusClass: "text-red-600",
          bgClass: "bg-gradient-to-r from-red-50 to-red-100 border-red-200",
          countdownClass: "text-red-700",
          buttonClass: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
        };
      default:
        return {
          title: "Verifying Payment",
          subtitle: "Processing your information",
          description: "Please wait while we verify your transaction details.",
          statusClass: "text-blue-600",
          bgClass: "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200",
          countdownClass: "text-blue-700",
          buttonClass: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Simple Logo without background */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
        <Image 
          src="/favicon.ico" 
          alt="Driving School Logo" 
          width={64} 
          height={64}
          className="rounded-xl"
        />
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Card Container with Flip Effect */}
          <div className="relative perspective-1000">
            <div className={`relative transition-transform duration-1000 transform-style-preserve-3d h-96 ${isCardFlipped ? 'rotate-y-180' : ''}`}>
              
              {/* Front of Card - Loading/Checking */}
              <div className={`absolute inset-0 backface-hidden ${isCardFlipped ? 'invisible' : 'visible'}`}>
                <div className="relative">
                  {/* Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-indigo-400/30 rounded-3xl blur-xl opacity-75 animate-pulse"></div>
                  
                  {/* Card Front */}
                  <div className="relative bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl p-6 border border-white/20 h-full flex flex-col justify-center">
                    <div className="text-center">
                      {/* Checking Icon */}
                      <div className="relative mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-xl border-2 border-white">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                        </div>
                        <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-xl scale-110 animate-pulse"></div>
                      </div>
                      
                      <h1 className="text-2xl font-black mb-4 text-blue-600 tracking-tight">
                        Verifying Payment
                      </h1>
                      
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-4 border border-gray-200/50">
                        <p className="text-lg text-gray-800 mb-1 font-semibold">
                          Processing transaction...
                        </p>
                        
                        <p className="text-sm text-gray-600">
                          Please wait while we verify your payment status.
                        </p>
                      </div>

                      {/* Loading Animation */}
                      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/50 rounded-xl p-4 shadow-inner">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <p className="text-sm font-bold text-blue-700">
                            Checking payment status...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back of Card - Result */}
              <div className={`backface-hidden rotate-y-180 ${isCardFlipped ? 'visible' : 'invisible'}`}>
                <div className="relative">
                  {/* Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-indigo-400/30 rounded-3xl blur-xl opacity-75 animate-pulse"></div>
                  
                  {/* Card Back */}
                  <div className="relative bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl p-6 border border-white/20 h-full flex flex-col justify-center">
                    <div className="text-center">
                      {/* Floating Status Icon */}
                      <div className="relative mb-4">
                        {getStatusIcon()}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl scale-150 -z-10 animate-pulse"></div>
                      </div>
                      
                      <h1 className={`text-2xl font-black mb-4 ${statusInfo.statusClass} tracking-tight`}>
                        {statusInfo.title}
                      </h1>
                      
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-4 border border-gray-200/50">
                        <p className="text-lg text-gray-800 mb-1 font-semibold">
                          {statusInfo.subtitle}
                        </p>
                        
                        <p className="text-sm text-gray-600">
                          {statusInfo.description}
                        </p>
                      </div>

                      {orderDetails && transactionStatus === "approved" && (
                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 mb-6 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-2">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-bold text-emerald-800">Order Confirmed</h3>
                            </div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              COMPLETED
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/70 rounded-lg p-3 border border-emerald-200/50">
                              <div className="text-xs text-gray-600 font-medium mb-1">Order #</div>
                              <div className="font-mono text-sm text-emerald-700 font-bold">{orderDetails.orderNumber}</div>
                            </div>
                            <div className="bg-white/70 rounded-lg p-3 border border-emerald-200/50">
                              <div className="text-xs text-gray-600 font-medium mb-1">Amount</div>
                              <div className="text-lg font-bold text-emerald-600">${orderDetails.total}</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Countdown Timer */}
                      {showCountdown && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mb-4 shadow-sm animate-fade-in">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center animate-spin">
                              <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <p className="text-xs font-semibold text-blue-700">
                              Redirecting in <span className="text-sm text-blue-800 font-bold">{countdown}</span> seconds
                            </p>
                          </div>
                        </div>
                      )}
                      

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
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
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-indigo-400/30 rounded-3xl blur-xl opacity-75 animate-pulse"></div>
              
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
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}