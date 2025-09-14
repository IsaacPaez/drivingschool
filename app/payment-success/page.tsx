"use client";
import React, { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useCart } from "../context/CartContext";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const hasInitialized = useRef(false);
  const [countdown, setCountdown] = useState(5);
  const [transactionStatus, setTransactionStatus] = useState<string>("checking");
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<{orderNumber: string; total: number} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [slotsUpdated, setSlotsUpdated] = useState<boolean | null>(null);
  const [isProcessingSlots, setIsProcessingSlots] = useState(false);

  const verifyAllSlotsUpdated = async (orderId: string) => {
    try {
      console.log("🔍 INTERNAL VERIFICATION: Checking if all slots are properly updated...");
      
      const orderResponse = await fetch(`/api/orders/details?orderId=${orderId}`);
      if (!orderResponse.ok) {
        console.error("❌ Failed to fetch order for verification");
        return false;
      }
      
      const orderData = await orderResponse.json();
      const appointments = orderData.order.appointments || [];
      
      if (appointments.length === 0) {
        console.log("✅ No appointments to verify");
        return true;
      }
      
      // Check each appointment slot status
      let allVerified = true;
      for (const appointment of appointments) {
        if (appointment.slotId && appointment.instructorId) {
          try {
            // Check the actual slot status in the database
            const verifyResponse = await fetch('/api/instructors/verify-slot-status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                slotId: appointment.slotId,
                instructorId: appointment.instructorId,
                classType: appointment.classType
              })
            });
            
            if (verifyResponse.ok) {
              const verifyResult = await verifyResponse.json();
              if (verifyResult.status === 'booked' && verifyResult.paid === true) {
                console.log(`✅ Slot ${appointment.slotId} verified as booked and paid`);
              } else {
                console.log(`❌ Slot ${appointment.slotId} NOT properly updated: status=${verifyResult.status}, paid=${verifyResult.paid}`);
                allVerified = false;
              }
            } else {
              console.error(`❌ Failed to verify slot ${appointment.slotId}`);
              allVerified = false;
            }
          } catch (error) {
            console.error(`❌ Error verifying slot ${appointment.slotId}:`, error);
            allVerified = false;
          }
        }
      }
      
      if (allVerified) {
        console.log("✅ INTERNAL VERIFICATION PASSED: All slots properly updated");
      } else {
        console.error("❌ INTERNAL VERIFICATION FAILED: Some slots not properly updated");
      }
      
      return allVerified;
    } catch (error) {
      console.error("❌ Error during internal verification:", error);
      return false;
    }
  };

  const startCountdown = async (orderId?: string) => {
    // Internal verification before starting countdown
    if (orderId) {
      const verified = await verifyAllSlotsUpdated(orderId);
      if (!verified) {
        console.error("❌ Internal verification failed - NOT starting countdown");
        setError("Verification failed. Please contact support if payment was charged.");
        return;
      }
    }
    
    console.log("✅ Starting countdown after successful verification");
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
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId }),
          });
          
          if (transactionResponse.ok) {
            const transactionData = await transactionResponse.json();
            
            if (transactionData.success) {
              setTransactionStatus("approved");
              
              // ✅ Clear cart after successful payment
              console.log("🛒 Payment approved - clearing cart");
              clearCart();
              
              try {
                const orderResponse = await fetch(`/api/orders/details?orderId=${orderId}`);
                if (orderResponse.ok) {
                  const orderData = await orderResponse.json();
                  setOrderDetails(orderData.order);
                  
                  // FORCE UPDATE based on order type - each type needs different handling
                  if (orderData.order.appointments && orderData.order.appointments.length > 0) {
                    console.log(`🎯 Processing order type: ${orderData.order.orderType} with ${orderData.order.appointments.length} appointments`);
                    setIsProcessingSlots(true);
                    
                    let allProcessed = true;
                    
                    // Process each appointment based on its type
                    for (const appointment of orderData.order.appointments) {
                      console.log(`📋 Processing appointment:`, {
                        classType: appointment.classType,
                        ticketClassId: appointment.ticketClassId,
                        slotId: appointment.slotId,
                        instructorId: appointment.instructorId
                      });
                      
                      try {
                        // Handle TICKET CLASSES
                        if (appointment.classType === 'ticket_class' || appointment.ticketClassId) {
                          console.log(`🎫 Processing ticket class: ${appointment.ticketClassId}`);
                          
                          // Call the orders/update-status endpoint to move from studentRequests to students
                          const ticketUpdateResponse = await fetch('/api/orders/update-status', {
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
                          
                          if (ticketUpdateResponse.ok) {
                            const ticketResult = await ticketUpdateResponse.json();
                            console.log(`✅ Ticket class processed successfully:`, ticketResult);
                          } else {
                            const errorText = await ticketUpdateResponse.text();
                            console.error(`❌ Failed to process ticket class:`, errorText);
                            allProcessed = false;
                          }
                        }
                        
                        // Handle DRIVING LESSONS & DRIVING TESTS (flexible matching)
                        else if ((appointment.classType === 'driving_lesson' || appointment.classType === 'driving_test' || appointment.classType === 'driving test') && appointment.slotId) {
                          const appointmentTypeDisplay = (appointment.classType === 'driving_test' || appointment.classType === 'driving test') ? 'driving test' : 'driving lesson';
                          console.log(`🚗 Processing ${appointmentTypeDisplay}: ${appointment.slotId}`);
                          
                          const slotUpdateResponse = await fetch('/api/instructors/update-slot-status', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              slotId: appointment.slotId,
                              instructorId: appointment.instructorId,
                              status: 'booked',
                              paid: true,
                              paymentId: orderId,
                              confirmedAt: new Date().toISOString(),
                              classType: appointment.classType
                            })
                          });
                          
                          if (slotUpdateResponse.ok) {
                            const slotResult = await slotUpdateResponse.json();
                            console.log(`✅ ${appointmentTypeDisplay} slot ${appointment.slotId} updated:`, slotResult);
                          } else {
                            const errorText = await slotUpdateResponse.text();
                            console.error(`❌ Failed to update ${appointmentTypeDisplay} slot ${appointment.slotId}:`, errorText);
                            allProcessed = false;
                          }
                        }
                        
                        else {
                          console.log(`⏭️ Skipping appointment - no recognized type or missing data`);
                          console.log(`🔍 DEBUG - Appointment classType:`, `"${appointment.classType}"`);
                          console.log(`🔍 DEBUG - Appointment slotId:`, appointment.slotId);
                          console.log(`🔍 DEBUG - Full appointment:`, appointment);
                        }
                        
                      } catch (error) {
                        console.error(`❌ Error processing appointment:`, error);
                        allProcessed = false;
                      }
                    }
                    
                    setIsProcessingSlots(false);
                    
                    if (allProcessed) {
                      console.log(`✅ ALL APPOINTMENTS PROCESSED SUCCESSFULLY - Ready for countdown`);
                      setSlotsUpdated(true);
                    } else {
                      console.error(`❌ SOME APPOINTMENTS FAILED TO PROCESS - NOT starting countdown`);
                      setSlotsUpdated(false);
                    }
                  }
                  
                  // LEGACY: Handle old format for driving lessons/tests without mixed appointments
                  else if ((orderData.order.orderType === 'driving_lesson' || orderData.order.orderType === 'driving_test' || orderData.order.orderType === 'drivings') && orderData.order.appointments) {
                    const orderTypeDisplay = orderData.order.orderType === 'driving_test' ? 'driving test' : 
                                          orderData.order.orderType === 'drivings' ? 'driving lessons & tests' : 'driving lesson';
                    console.log(`🎯 FORCING update of ${orderTypeDisplay} slots to booked status...`);
                    console.log('🎯 Order details:', {
                      orderId: orderId,
                      orderType: orderData.order.orderType,
                      appointments: orderData.order.appointments
                    });
                    
                    setIsProcessingSlots(true);
                    
                    // FORCE UPDATE each slot directly using slotId
                    let allSlotsUpdated = true;
                    
                    for (const appointment of orderData.order.appointments) {
                      if (appointment.slotId) {
                        try {
                          console.log(`🔄 FORCING update of ${orderTypeDisplay} slot ${appointment.slotId}...`);
                          console.log(`🔍 Appointment details:`, {
                            slotId: appointment.slotId,
                            classType: appointment.classType,
                            instructorId: appointment.instructorId,
                            orderType: orderData.order.orderType,
                            date: appointment.date,
                            start: appointment.start,
                            end: appointment.end
                          });
                          
                          const directUpdateResponse = await fetch('/api/instructors/update-slot-status', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              slotId: appointment.slotId,
                              instructorId: appointment.instructorId,
                              status: 'booked',
                              paid: true,
                              paymentId: orderId,
                              confirmedAt: new Date().toISOString(),
                              classType: appointment.classType || orderData.order.orderType // Add classType for proper slot identification
                            })
                          });
                          
                          if (directUpdateResponse.ok) {
                            const updateResult = await directUpdateResponse.json();
                            console.log(`✅ ${orderTypeDisplay} slot ${appointment.slotId} FORCED to booked status:`, updateResult);
                          } else {
                            const errorText = await directUpdateResponse.text();
                            console.error(`❌ Failed to FORCE update ${orderTypeDisplay} slot ${appointment.slotId}:`, errorText);
                            allSlotsUpdated = false;
                          }
                        } catch (error) {
                          console.error(`❌ Error FORCING update of ${orderTypeDisplay} slot ${appointment.slotId}:`, error);
                          allSlotsUpdated = false;
                        }
                      }
                    }
                    
                    setIsProcessingSlots(false);
                    
                    if (allSlotsUpdated) {
                      console.log(`✅ ALL ${orderTypeDisplay.toUpperCase()} SLOTS FORCED TO BOOKED - Ready for countdown`);
                      // Set a flag to indicate slots are updated
                      setSlotsUpdated(true);
                    } else {
                      console.error(`❌ SOME ${orderTypeDisplay.toUpperCase()} SLOTS FAILED TO UPDATE - NOT starting countdown`);
                      // Set a flag to indicate slots failed to update
                      setSlotsUpdated(false);
                    }
                  } else {
                    console.log('⏭️ Not a driving lesson/test order or no appointments:', {
                      orderType: orderData.order.orderType,
                      hasAppointments: !!orderData.order.appointments
                    });
                    // Set slots as updated for non-appointment orders
                    setSlotsUpdated(true);
                  }
                } else {
                  console.error("Failed to fetch order details");
                  setSlotsUpdated(false);
                }
              } catch (error) {
                console.error("Error fetching order details:", error);
                setSlotsUpdated(false);
              }
            } else {
              setTransactionStatus("pending");
              
              // If payment is rejected, try to get order details and revert changes back
              try {
                const orderResponse = await fetch(`/api/orders/details?orderId=${orderId}`);
                if (orderResponse.ok) {
                  const orderData = await orderResponse.json();
                  
                  if (orderData.order && orderData.order.appointments) {
                    console.log(`🔄 Payment rejected - Reverting changes for order type: ${orderData.order.orderType}`);
                    
                    // Process each appointment for reversion
                    for (const appointment of orderData.order.appointments) {
                      try {
                        // Handle TICKET CLASSES reversion
                        if (appointment.classType === 'ticket_class' || appointment.ticketClassId) {
                          console.log(`🎫 Reverting ticket class: ${appointment.ticketClassId}`);
                          
                          // Call API to remove student from studentRequests (revert the add-to-cart action)
                          const ticketRevertResponse = await fetch('/api/register-online/cancel-request', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              ticketClassId: appointment.ticketClassId,
                              userId: orderData.order.userId
                            })
                          });
                          
                          if (ticketRevertResponse.ok) {
                            console.log(`✅ Ticket class request reverted successfully`);
                          } else {
                            const errorText = await ticketRevertResponse.text();
                            console.error(`❌ Failed to revert ticket class request:`, errorText);
                          }
                        }
                        
                        // Handle DRIVING LESSONS & DRIVING TESTS reversion
                        else if ((appointment.classType === 'driving_lesson' || appointment.classType === 'driving_test') && appointment.slotId) {
                          const appointmentTypeDisplay = appointment.classType === 'driving_test' ? 'driving test' : 'driving lesson';
                          console.log(`🚗 Reverting ${appointmentTypeDisplay} slot: ${appointment.slotId}`);
                          
                          const revertResponse = await fetch('/api/instructors/update-slot-status', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
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
                          
                          if (revertResponse.ok) {
                            const revertResult = await revertResponse.json();
                            console.log(`✅ ${appointmentTypeDisplay} slot ${appointment.slotId} reverted to available:`, revertResult);
                          } else {
                            const errorText = await revertResponse.text();
                            console.error(`❌ Failed to revert ${appointmentTypeDisplay} slot ${appointment.slotId}:`, errorText);
                          }
                        }
                        
                      } catch (error) {
                        console.error(`❌ Error reverting appointment:`, error);
                      }
                    }
                  }
                }
              } catch (error) {
                console.error("Error fetching order details for reversion:", error);
              }
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
        
        // NO iniciar countdown aquí - esperar a que el pago esté confirmado
        console.log('🎴 Card flipped, waiting for payment confirmation before starting countdown...');
        }, 1000);
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

  // Nuevo useEffect para iniciar countdown solo cuando el pago esté confirmado
  useEffect(() => {
    // Solo iniciar countdown si:
    // 1. La carta ya está volteada
    // 2. El pago está aprobado
    // 3. Los slots se actualizaron correctamente (o no hay slots)
    // 4. El countdown no se ha mostrado aún
    if (isCardFlipped && transactionStatus === "approved" && !showCountdown) {
      if (slotsUpdated === true) {
        console.log('✅ Payment approved and slots updated - Starting countdown');
        setTimeout(() => {
          setShowCountdown(true);
          startCountdown(currentOrderId || undefined);
        }, 1000); // Esperar 1 segundo después de que se confirme el pago
      } else if (slotsUpdated === false) {
        console.log('❌ Payment approved but slots failed to update - NOT starting countdown');
        setTransactionStatus("error");
      } else if (slotsUpdated === null) {
        // Para órdenes sin appointments, iniciar countdown normalmente
        console.log('✅ Payment approved (no appointments) - Starting countdown');
        setTimeout(() => {
          setShowCountdown(true);
          startCountdown(currentOrderId || undefined);
        }, 1000);
      }
    }
  }, [isCardFlipped, transactionStatus, slotsUpdated, showCountdown]);

  const getStatusIcon = () => {
    switch (transactionStatus) {
      case "approved":
        return (
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-emerald-400/40 rounded-full blur-2xl scale-125 animate-pulse"></div>
          </div>
        );
      case "pending":
        return (
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-2xl">
              <svg className="w-12 h-12 text-white animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-amber-400/40 rounded-full blur-2xl scale-125 animate-pulse"></div>
          </div>
        );
      case "error":
        return (
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-red-400/40 rounded-full blur-2xl scale-125 animate-pulse"></div>
          </div>
        );
      default:
        return (
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 mx-auto shadow-2xl border-4 border-blue-200">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
            <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-2xl scale-125 animate-pulse"></div>
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
          {/* Card Container with Flip Effect - Larger */}
          <div className="relative perspective-1000">
            <div className={`relative transition-transform duration-1000 transform-style-preserve-3d h-[36rem] ${isCardFlipped ? 'rotate-y-180' : ''}`}>
              
              {/* Front of Card - Loading/Checking */}
              <div className={`absolute inset-0 backface-hidden ${isCardFlipped ? 'invisible' : 'visible'}`}>
                <div className="relative">
                  {/* Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/30 via-blue-500/30 to-blue-600/30 rounded-3xl blur-xl opacity-75 animate-pulse"></div>
                  
                  {/* Card Front */}
                  <div className="relative bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl p-12 border border-white/20 h-full flex flex-col justify-center">
                    <div className="text-center">
                      {/* Checking Icon - White background with blue spinner */}
                      <div className="relative mb-6">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 mx-auto shadow-2xl border-4 border-blue-200">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        </div>
                        <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-2xl scale-125 animate-pulse"></div>
                      </div>
                      
                      <h1 className="text-4xl font-black mb-6 text-blue-600 tracking-tight">
                        Verifying Payment
                      </h1>
                      
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200/50">
                        <p className="text-xl text-gray-800 mb-2 font-semibold">
                          Processing transaction...
                        </p>
                        
                        <p className="text-base text-gray-600">
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
                            {isProcessingSlots ? 'Updating lesson slots...' : 'Checking payment status...'}
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
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/30 via-blue-500/30 to-blue-600/30 rounded-3xl blur-xl opacity-75 animate-pulse"></div>
                  
                  {/* Card Back */}
                  <div className="relative bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl p-12 border border-white/20 h-full flex flex-col justify-center">
                    <div className="text-center">
                      {/* Floating Status Icon */}
                      <div className="relative mb-6">
                        {getStatusIcon()}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-500/20 rounded-full blur-xl scale-150 -z-10 animate-pulse"></div>
                      </div>
                      
                      <h1 className={`text-4xl font-black mb-6 ${statusInfo.statusClass} tracking-tight`}>
                        {statusInfo.title}
                      </h1>
                      
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200/50">
                        <p className="text-xl text-gray-800 mb-2 font-semibold">
                          {statusInfo.subtitle}
                        </p>
                        
                        <p className="text-base text-gray-600">
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
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}