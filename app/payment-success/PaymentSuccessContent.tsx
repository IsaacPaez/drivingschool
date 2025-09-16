"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "../context/CartContext";

export default function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const hasInitialized = useRef(false);
  const [countdown, setCountdown] = useState(5);
  const [transactionStatus, setTransactionStatus] = useState<string>("checking");
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<{ orderNumber: string; total: number } | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [slotsUpdated, setSlotsUpdated] = useState<boolean | null>(null);
  const [isProcessingSlots, setIsProcessingSlots] = useState(false);

  const verifyAllSlotsUpdated = async (orderId: string) => {
    try {
      const orderResponse = await fetch(`/api/orders/details?orderId=${orderId}`);
      if (!orderResponse.ok) return false;
      const orderData = await orderResponse.json();
      const appointments = orderData.order.appointments || [];
      if (appointments.length === 0) return true;
      let allVerified = true;
      for (const appointment of appointments) {
        if (appointment.classType === 'ticket_class' || appointment.ticketClassId) continue;
        if (appointment.slotId && appointment.instructorId) {
          const verifyResponse = await fetch('/api/instructors/verify-slot-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              slotId: appointment.slotId,
              instructorId: appointment.instructorId,
              classType: appointment.classType
            })
          });
          if (verifyResponse.ok) {
            const verifyResult = await verifyResponse.json();
            if (!(verifyResult.status === 'booked' && verifyResult.paid === true)) allVerified = false;
          } else {
            allVerified = false;
          }
        }
      }
      return allVerified;
    } catch {
      return false;
    }
  };

  const startCountdown = async (orderId?: string) => {
    if (orderId) {
      const verified = await verifyAllSlotsUpdated(orderId);
      if (!verified) {
        setTransactionStatus("error");
        return;
      }
    }
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
  };

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const checkTransactionAndUpdateOrder = async () => {
      const userId = searchParams ? searchParams.get("userId") : null;
      const orderId = searchParams ? searchParams.get("orderId") : null;
      if (userId && orderId) {
        setCurrentOrderId(orderId);
        try {
          const transactionResponse = await fetch(`/api/transactions/check-status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId })
          });
          if (!transactionResponse.ok) {
            setTransactionStatus("error");
            return;
          }
          const transactionData = await transactionResponse.json();
          if (transactionData.success) {
            setTransactionStatus("approved");
            clearCart();
            try {
              const orderResponse = await fetch(`/api/orders/details?orderId=${orderId}`);
              if (!orderResponse.ok) {
                setSlotsUpdated(false);
                return;
              }
              const orderData = await orderResponse.json();
              setOrderDetails(orderData.order);
              if (orderData.order.appointments && orderData.order.appointments.length > 0) {
                setIsProcessingSlots(true);
                let allProcessed = true;
                const ticketClasses = orderData.order.appointments.filter((apt: any) => apt.classType === 'ticket_class' || apt.ticketClassId);
                const drivingLessons = orderData.order.appointments.filter((apt: any) => (apt.classType === 'driving_lesson' || apt.classType === 'driving_test' || apt.classType === 'driving test') && apt.slotId);
                interface DrivingLessonGroup { instructorId: string; classType: string; slotIds: string[]; }
                const drivingLessonsByInstructor = drivingLessons.reduce((acc: Record<string, DrivingLessonGroup>, apt: any) => {
                  const key = apt.instructorId;
                  if (!acc[key]) acc[key] = { instructorId: apt.instructorId, classType: apt.classType, slotIds: [] };
                  acc[key].slotIds.push(apt.slotId);
                  return acc;
                }, {} as Record<string, DrivingLessonGroup>);

                for (const appointment of ticketClasses) {
                  try {
                    const enrollResponse = await fetch('/api/ticketclasses/enroll-student', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        ticketClassId: appointment.ticketClassId,
                        studentId: userId,
                        orderId: orderId,
                        orderNumber: orderData.order.orderNumber
                      })
                    });
                    if (!enrollResponse.ok) allProcessed = false;
                  } catch { allProcessed = false; }
                }

                for (const [instructorId, data] of Object.entries(drivingLessonsByInstructor)) {
                  try {
                    const groupData = data as DrivingLessonGroup;
                    const slotUpdateResponse = await fetch('/api/instructors/update-slot-status', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        instructorId,
                        status: 'booked',
                        paid: true,
                        paymentId: orderId,
                        classType: groupData.classType,
                        slotIds: groupData.slotIds
                      })
                    });
                    if (!slotUpdateResponse.ok) allProcessed = false;
                  } catch { allProcessed = false; }
                }

                setIsProcessingSlots(false);
                setSlotsUpdated(allProcessed);
              } else {
                setSlotsUpdated(true);
              }
            } catch {
              setSlotsUpdated(false);
            }
          } else {
            setTransactionStatus("pending");
            try {
              const orderResponse = await fetch(`/api/orders/details?orderId=${orderId}`);
              if (!orderResponse.ok) return;
              const orderData = await orderResponse.json();
              if (orderData.order && orderData.order.appointments) {
                for (const appointment of orderData.order.appointments) {
                  try {
                    if ((appointment.classType === 'driving_lesson' || appointment.classType === 'driving_test') && appointment.slotId) {
                      await fetch('/api/instructors/update-slot-status', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          slotId: appointment.slotId,
                          instructorId: appointment.instructorId,
                          status: 'available',
                          paid: false,
                          paymentId: null,
                          confirmedAt: null,
                          classType: appointment.classType
                        })
                      });
                    }
                  } catch { /* noop */ }
                }
              }
            } catch { /* noop */ }
          }
        } catch {
          setTransactionStatus("error");
        }
      } else {
        setTransactionStatus("error");
      }

      setTimeout(() => {
        setIsCardFlipped(true);
      }, 1000);
    };

    const clearCartCompletely = async () => {
      try {
        const userId = searchParams ? searchParams.get("userId") : null;
        localStorage.removeItem("cart");
        if (userId) {
          await fetch("/api/cart", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
        }
      } catch { /* noop */ }
    };

    clearCartCompletely();
    checkTransactionAndUpdateOrder();
  }, [router, searchParams]);

  useEffect(() => {
    if (isCardFlipped && transactionStatus === "approved" && !showCountdown) {
      if (slotsUpdated === true) {
        setTimeout(() => { setShowCountdown(true); startCountdown(currentOrderId || undefined); }, 1000);
      } else if (slotsUpdated === false) {
        setTransactionStatus("error");
      } else if (slotsUpdated === null) {
        setTimeout(() => { setShowCountdown(true); startCountdown(currentOrderId || undefined); }, 1000);
      }
    }
  }, [isCardFlipped, transactionStatus, slotsUpdated, showCountdown]);

  const statusInfo = (() => {
    switch (transactionStatus) {
      case "approved":
        return { title: "Payment Successful", subtitle: "Transaction confirmed", description: "Your order has been processed and you will receive a confirmation email shortly.", statusClass: "text-emerald-600", bgClass: "bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200", countdownClass: "text-emerald-700" };
      case "pending":
        return { title: "Processing Payment", subtitle: "Verifying transaction", description: "We are confirming your payment. This may take a few moments.", statusClass: "text-amber-600", bgClass: "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200", countdownClass: "text-amber-700" };
      case "error":
        return { title: "Verification Failed", subtitle: "Unable to confirm payment", description: "Please contact our support team if you have any questions.", statusClass: "text-red-600", bgClass: "bg-gradient-to-r from-red-50 to-red-100 border-red-200", countdownClass: "text-red-700" };
      default:
        return { title: "Verifying Payment", subtitle: "Processing your information", description: "Please wait while we verify your transaction details.", statusClass: "text-blue-600", bgClass: "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200", countdownClass: "text-blue-700" };
    }
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="flex items-center justify-center min-h-screen p-6 relative z-10">
        <div className="w-full max-w-2xl">
          <div className="relative perspective-1000">
            <div className={`relative transition-transform duration-1000 transform-style-preserve-3d h-[36rem] ${isCardFlipped ? 'rotate-y-180' : ''}`}>
              <div className={`absolute inset-0 backface-hidden ${isCardFlipped ? 'invisible' : 'visible'}`}>
                <div className="relative">
                  <div className="relative bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl p-12 border border-white/20 h-full flex flex-col justify-center">
                    <div className="text-center">
                      <div className="relative mb-6">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 mx-auto shadow-2xl border-4 border-blue-200">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        </div>
                      </div>
                      <h1 className="text-4xl font-black mb-6 text-blue-600 tracking-tight">Verifying Payment</h1>
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200/50">
                        <p className="text-xl text-gray-800 mb-2 font-semibold">Processing transaction...</p>
                        <p className="text-base text-gray-600">Please wait while we verify your payment status.</p>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/50 rounded-xl p-4 shadow-inner">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <p className="text-sm font-bold text-blue-700">{isProcessingSlots ? 'Updating lesson slots...' : 'Checking payment status...'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`backface-hidden rotate-y-180 ${isCardFlipped ? 'visible' : 'invisible'}`}>
                <div className="relative">
                  <div className="relative bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl p-12 border border-white/20 h-full flex flex-col justify-center">
                    <div className="text-center">
                      <h1 className={`text-4xl font-black mb-6 ${statusInfo.statusClass} tracking-tight`}>{statusInfo.title}</h1>
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200/50">
                        <p className="text-xl text-gray-800 mb-2 font-semibold">{statusInfo.subtitle}</p>
                        <p className="text-base text-gray-600">{statusInfo.description}</p>
                      </div>
                      {orderDetails && transactionStatus === "approved" && (
                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 mb-6 shadow-sm">
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
                      {showCountdown && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mb-4 shadow-sm animate-fade-in">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center animate-spin"></div>
                            <p className="text-xs font-semibold text-blue-700">Redirecting in <span className="text-sm text-blue-800 font-bold">{countdown}</span> seconds</p>
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


