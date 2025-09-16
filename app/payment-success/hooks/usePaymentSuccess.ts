import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { 
  fetchOrderDetails,
  processTicketClasses,
  groupDrivingLessonsByInstructor,
  updateInstructorSlotsBatch,
  forceUpdateLegacySlots,
  revertAppointmentsOnFailure
} from "../helpers";

export interface PaymentSuccessState {
  countdown: number;
  transactionStatus: string;
  currentOrderId: string | null;
  orderDetails: { orderNumber: string; total: number } | null;
  error: string | null;
  isCardFlipped: boolean;
  showCountdown: boolean;
  slotsUpdated: boolean | null;
  isProcessingSlots: boolean;
}

export const usePaymentSuccess = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const hasInitialized = useRef(false);

  const [state, setState] = useState<PaymentSuccessState>({
    countdown: 5,
    transactionStatus: "checking",
    currentOrderId: null,
    orderDetails: null,
    error: null,
    isCardFlipped: false,
    showCountdown: false,
    slotsUpdated: null,
    isProcessingSlots: false,
  });

  const updateState = (updates: Partial<PaymentSuccessState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

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
      
      // Check each appointment slot status (ONLY for driving lessons and driving tests)
      let allVerified = true;
      for (const appointment of appointments) {
        // Skip verification for ticket classes - they don't have slots in instructors
        if (appointment.classType === 'ticket_class' || appointment.ticketClassId) {
          console.log(`🎫 Skipping verification for ticket class: ${appointment.ticketClassId}`);
          continue;
        }
        
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
        updateState({ error: "Verification failed. Please contact support if payment was charged." });
        return;
      }
    }
    
    console.log("✅ Starting countdown after successful verification");
    const countdownTimer = setInterval(() => {
      setState(prev => {
        if (prev.countdown <= 1) {
          clearInterval(countdownTimer);
          router.replace("/");
          return { ...prev, countdown: 0 };
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);
    
    return () => clearInterval(countdownTimer);
  };

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

  const checkTransactionAndUpdateOrder = async () => {
    const userId = searchParams ? searchParams.get("userId") : null;
    const orderId = searchParams ? searchParams.get("orderId") : null;
    
    if (userId && orderId) {
      updateState({ currentOrderId: orderId });
      
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
            updateState({ transactionStatus: "approved" });
            
            // ✅ Clear cart after successful payment
            console.log("🛒 Payment approved - clearing cart");
            clearCart();
            
            try {
              const orderResponse = await fetch(`/api/orders/details?orderId=${orderId}`);
              if (orderResponse.ok) {
                const orderData = await orderResponse.json();
                updateState({ orderDetails: orderData.order });
                
                // FORCE UPDATE based on order type - each type needs different handling
                if (orderData.order.appointments && orderData.order.appointments.length > 0) {
                  console.log(`🎯 Processing order type: ${orderData.order.orderType} with ${orderData.order.appointments.length} appointments`);
                  updateState({ isProcessingSlots: true });
                  
                  let allProcessed = true;
                  
                  // Group appointments by type for batch processing
                  const ticketClasses = orderData.order.appointments.filter(apt => apt.classType === 'ticket_class' || apt.ticketClassId);
                    const drivingLessons = orderData.order.appointments.filter(apt => 
                      (apt.classType === 'driving_lesson' || apt.classType === 'driving_test') && apt.slotId
                    );
                  
                  console.log('🎯 [PAYMENT-SUCCESS] Modular processing - Appointments summary:', {
                    total: orderData.order.appointments.length,
                    drivingLessons: drivingLessons.length,
                    ticketClasses: ticketClasses.length,
                    orderType: orderData.order.orderType
                  });
                  
                  if (drivingLessons.length > 0) {
                    console.log('🚗 [PAYMENT-SUCCESS] Driving lessons appointments detail:', drivingLessons.map((a: any) => ({
                      instructorId: a.instructorId,
                      slotId: a.slotId,
                      classType: a.classType,
                      date: a.date,
                      start: a.start,
                      end: a.end
                    })));
                  }
                  
                  if (ticketClasses.length > 0) {
                    console.log('🎫 [PAYMENT-SUCCESS] Ticket classes appointments detail:', ticketClasses.map((a: any) => ({
                      ticketClassId: a.ticketClassId,
                      classType: a.classType,
                      date: a.date,
                      start: a.start,
                      end: a.end
                    })));
                  }
                  
                  // Group driving lessons by instructor
                  const drivingLessonsByInstructor = groupDrivingLessonsByInstructor(drivingLessons);
                  
                  // Process TICKET CLASSES using specific route
                  if (ticketClasses.length > 0) {
                    console.log('🎫 [PAYMENT-SUCCESS] Processing ticket classes with specific route...');
                    const ok = await processTicketClasses(ticketClasses, userId!, orderId, state.orderDetails?.orderNumber);
                    if (!ok) {
                      console.error('❌ [PAYMENT-SUCCESS] Ticket classes processing failed');
                      allProcessed = false;
                    } else {
                      console.log('✅ [PAYMENT-SUCCESS] Ticket classes processed successfully');
                    }
                  }
                  
                  // Process DRIVING LESSONS & DRIVING TESTS using specific routes (batch by instructor)
                  if (Object.keys(drivingLessonsByInstructor).length > 0) {
                    console.log('🚗 [PAYMENT-SUCCESS] Processing driving lessons/tests with specific routes...');
                    const batchOk = await updateInstructorSlotsBatch(drivingLessonsByInstructor, orderId);
                    if (!batchOk) {
                      console.error('❌ [PAYMENT-SUCCESS] Driving lessons/tests processing failed');
                      allProcessed = false;
                    } else {
                      console.log('✅ [PAYMENT-SUCCESS] Driving lessons/tests processed successfully');
                    }
                  }
                  
                  updateState({ isProcessingSlots: false });
                  
                  if (allProcessed) {
                    console.log(`✅ ALL APPOINTMENTS PROCESSED SUCCESSFULLY - Ready for countdown`);
                    updateState({ slotsUpdated: true });
                  } else {
                    console.error(`❌ SOME APPOINTMENTS FAILED TO PROCESS - NOT starting countdown`);
                    updateState({ slotsUpdated: false });
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
                  
                  updateState({ isProcessingSlots: true });
                  
                  const allSlotsUpdated = await forceUpdateLegacySlots(orderData.order, orderId);
                  updateState({ isProcessingSlots: false });
                  
                  if (allSlotsUpdated) {
                    console.log(`✅ ALL ${orderTypeDisplay.toUpperCase()} SLOTS FORCED TO BOOKED - Ready for countdown`);
                    updateState({ slotsUpdated: true });
                  } else {
                    console.error(`❌ SOME ${orderTypeDisplay.toUpperCase()} SLOTS FAILED TO UPDATE - NOT starting countdown`);
                    updateState({ slotsUpdated: false });
                  }
                } else {
                  console.log('⏭️ Not a driving lesson/test order or no appointments:', {
                    orderType: orderData.order.orderType,
                    hasAppointments: !!orderData.order.appointments
                  });
                  updateState({ slotsUpdated: true });
                }
              } else {
                console.error("Failed to fetch order details");
                updateState({ slotsUpdated: false });
              }
            } catch (error) {
              console.error("Error fetching order details:", error);
              updateState({ slotsUpdated: false });
            }
          } else {
            updateState({ transactionStatus: "pending" });
            
            // If payment is rejected, try to get order details and revert changes back
            try {
              const orderResponse = await fetch(`/api/orders/details?orderId=${orderId}`);
              if (orderResponse.ok) {
                const orderData = await orderResponse.json();
                
                if (orderData.order && orderData.order.appointments) {
                  console.log(`🔄 Payment rejected - Reverting changes for order type: ${orderData.order.orderType}`);
                  
                  await revertAppointmentsOnFailure(orderData.order, userId);
                }
              }
            } catch (error) {
              console.error("Error fetching order details for reversion:", error);
            }
          }
        } else {
          updateState({ transactionStatus: "error" });
        }
      } catch (error) {
        console.error("Error checking transaction status:", error);
        updateState({ transactionStatus: "error" });
      }
    } else {
      updateState({ transactionStatus: "error" });
    }

    // Después de obtener el resultado, esperar 1 segundo y voltear la carta
    setTimeout(() => {
      updateState({ isCardFlipped: true });
      console.log('🎴 Card flipped, waiting for payment confirmation before starting countdown...');
    }, 1000);
  };

  // Initialize effect
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    clearCartCompletely();
    checkTransactionAndUpdateOrder();
  }, [router, searchParams]);

  // Countdown effect
  useEffect(() => {
    // Solo iniciar countdown si:
    // 1. La carta ya está volteada
    // 2. El pago está aprobado
    // 3. Los slots se actualizaron correctamente (o no hay slots)
    // 4. El countdown no se ha mostrado aún
    if (state.isCardFlipped && state.transactionStatus === "approved" && !state.showCountdown) {
      if (state.slotsUpdated === true) {
        console.log('✅ Payment approved and slots updated - Starting countdown');
        setTimeout(() => {
          updateState({ showCountdown: true });
          startCountdown(state.currentOrderId || undefined);
        }, 1000); // Esperar 1 segundo después de que se confirme el pago
      } else if (state.slotsUpdated === false) {
        console.log('❌ Payment approved but slots failed to update - NOT starting countdown');
        updateState({ transactionStatus: "error" });
      } else if (state.slotsUpdated === null) {
        // Para órdenes sin appointments, iniciar countdown normalmente
        console.log('✅ Payment approved (no appointments) - Starting countdown');
        setTimeout(() => {
          updateState({ showCountdown: true });
          startCountdown(state.currentOrderId || undefined);
        }, 1000);
      }
    }
  }, [state.isCardFlipped, state.transactionStatus, state.slotsUpdated, state.showCountdown]);

  return {
    state,
    updateState,
  };
};
