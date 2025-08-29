"use client";

import React, { useState, useEffect, Suspense } from "react";
import "@/globals.css";
import { useAuth } from "@/components/AuthContext";
import { useCart } from "@/app/context/CartContext";
import LoginModal from "@/components/LoginModal";

// Import our new components
import PackageSelector from "./components/PackageSelector";
import ScheduleTableImproved from "./components/ScheduleTableImproved";
import BookingModal from "./components/BookingModal";
import RequestModal from "./components/RequestModal";
import ConfirmationModal from "./components/ConfirmationModal";
import AuthWarningModal from "./components/AuthWarningModal";

interface Instructor {
  _id: string;
  name: string;
  photo?: string;
  email?: string;
  schedule_driving_lesson?: ScheduleEntry[];
}

interface ScheduleEntry {
  date: string;
  start: string;
  end: string;
  status: string;
  classType?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  selectedProduct?: string;
  studentId?: string;
  studentName?: string;
  paid?: boolean;
}

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  buttonLabel: string;
  category: string;
  duration?: number;
  media?: string[];
}

interface SelectedTimeSlot {
  date: string;
  start: string;
  end: string;
  instructors: Instructor[];
}

// Component principal
function DrivingLessonsContent() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ScheduleEntry | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<SelectedTimeSlot | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [forceUpdate, setForceUpdate] = useState(0);

  const { user } = useAuth();
  const { addToCart } = useCart();
  const userId = user?._id || "";

  // Function to immediately update selected slots to pending status locally
  const updateSlotsTopending = () => {
    console.log("🔄 Updating selected slots to pending locally...");
    setInstructors(prevInstructors => {
      return prevInstructors.map(instructor => {
        if (!instructor.schedule_driving_lesson) return instructor;
        
        const updatedSchedule = instructor.schedule_driving_lesson.map(entry => {
          const slotKey = `${entry.date}-${entry.start}-${entry.end}`;
          if (selectedSlots.has(slotKey)) {
            console.log(`🟡 Updating slot ${slotKey} to pending`);
            return {
              ...entry,
              status: 'pending',
              studentId: userId,
              studentName: user?.name || 'Unknown Student'
            };
          }
          return entry;
        });
        
        return {
          ...instructor,
          schedule_driving_lesson: updatedSchedule,
          lastUpdated: Date.now()
        };
      });
    });
  };

  // Helper functions - removed unused pad function

  const handleDateChange = (value: Date | null | (Date | null)[]) => {
    if (!value || Array.isArray(value)) return;
    setSelectedDate(value);
  };

  // Fetch productos (paquetes) al cargar
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?category=Road Skills for Life');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
          console.log('📦 Productos obtenidos:', data);
          
          // Verificar si hay un paquete preseleccionado desde localStorage
          const selectedPackageData = localStorage.getItem('selectedPackage');
          if (selectedPackageData) {
            try {
              const packageInfo = JSON.parse(selectedPackageData);
              const foundProduct = data.find((p: Product) => p._id === packageInfo.id);
              if (foundProduct) {
                setSelectedProduct(foundProduct);
                console.log('📦 Paquete preseleccionado:', foundProduct.title);
              }
              // Limpiar localStorage después de usar
              localStorage.removeItem('selectedPackage');
            } catch (error) {
              console.error('Error parsing selected package from localStorage:', error);
              localStorage.removeItem('selectedPackage');
            }
          }
        } else {
          console.error('Error al obtener productos:', res.status);
        }
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    };

    fetchProducts();
  }, []);

  // Fetch instructores de driving lessons al cargar
  const fetchInstructors = async () => {
    console.log("🔄 Fetching instructors...");
    try {
      const res = await fetch('/api/instructors?type=driving-lessons&includeSchedule=true', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      console.log("📡 Respuesta del fetch:", res.status, res.ok);
      
      if (res.ok) {
        const data = await res.json();
        console.log('👨‍🏫 Instructores con horarios obtenidos:', data.length, 'instructors');
        
        // Add timestamp to force re-render
        const updatedData = data.map((instructor: Instructor) => ({
          ...instructor,
          lastUpdated: Date.now()
        }));
        
        setInstructors(updatedData);
        console.log('✅ Instructores actualizados exitosamente con timestamp');
      } else {
        console.error('❌ Error al obtener instructores:', res.status);
      }
    } catch (error) {
      console.error('❌ Error al obtener instructores:', error);
    }
  };

  useEffect(() => {
    console.log("🔄 useEffect ejecutándose - fetching instructors");
    fetchInstructors();
  }, []);

  // useEffect para monitorear cambios en el estado de instructors
  useEffect(() => {
    console.log("🔍 Estado de instructors cambió:", instructors);
    console.log("🔍 Cantidad de instructors en estado:", instructors.length);
  }, [instructors]);

  const generateCalendlyURL = (product: Product, instructor: Instructor, slot?: ScheduleEntry) => {
    const baseUrl = "https://calendly.com/your-driving-school"; // Cambiar por tu URL real de Calendly
    
    const params = new URLSearchParams({
      package_name: product.title,
      package_price: product.price.toString(),
      package_description: product.description,
      package_hours: product.duration?.toString() || '',
      preferred_instructor: instructor.name,
      instructor_id: instructor._id,
      user_id: userId,
      user_name: user?.name || '',
      user_email: user?.email || '',
      lesson_type: 'driving_lesson_package'
    });

    // Agregar información del horario si está disponible
    if (slot) {
      params.append('selected_date', slot.date);
      params.append('selected_start_time', slot.start);
      params.append('selected_end_time', slot.end);
    }

    return `${baseUrl}?${params.toString()}`;
  };

  const handleBookPackage = async () => {
    if (!selectedProduct || !selectedInstructor || !selectedSlot || !userId) {
      if (!userId) {
        setShowAuthWarning(true);
        return;
      }
      return;
    }

    try {
      const calendlyUrl = generateCalendlyURL(selectedProduct, selectedInstructor, selectedSlot);
      
      setIsBookingModalOpen(false);
      setConfirmationMessage(`Redirecting to schedule your ${selectedProduct.title} with ${selectedInstructor.name} on ${selectedSlot.date} at ${selectedSlot.start}...`);
      setShowConfirmation(true);
      
      setTimeout(() => {
        window.location.href = calendlyUrl;
      }, 2000);

    } catch (error) {
      console.error('Error procesando reserva:', error);
      setConfirmationMessage('Error processing your request. Please try again.');
      setShowConfirmation(true);
    }
  };

  const handleRequestSchedule = () => {
    if (!selectedProduct || !userId) {
      if (!userId) {
        setShowAuthWarning(true);
        return;
      }
      alert('Please select a package first.');
      return;
    }
    setIsRequestModalOpen(true);
  };

  const handleRequestScheduleWithLocations = async (pickupLocation: string, dropoffLocation: string, paymentMethod: 'online' | 'physical') => {
    if (!selectedProduct || selectedSlots.size === 0 || !userId) {
      alert('Please make sure you have selected a package and time slots, and are logged in.');
      return;
    }

    try {
      // Call API to create schedule request and mark slots as pending
      const response = await fetch('/api/schedule-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          productId: selectedProduct._id,
          selectedSlots: Array.from(selectedSlots),
          selectedHours: selectedHours,
          pickupLocation: pickupLocation,
          dropoffLocation: dropoffLocation,
          paymentMethod: paymentMethod,
          studentName: user ? user.name : 'Unknown Student'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create schedule request');
      }

      console.log("✅ Schedule request successful, updating UI...");
      
      // Immediately update selected slots to pending in the UI
      updateSlotsTopending();

      // If online payment, add to cart and mark slots as pending (NO create order yet)
      if (paymentMethod === 'online') {
        try {
          console.log('🛒 Adding driving lesson package to cart...');
          
          // Step 1: Add to cart with package and slot details using specific endpoint
          const cartData = {
            userId: userId,
            packageDetails: {
              productId: selectedProduct._id,
              packageTitle: selectedProduct.title,
              packagePrice: selectedProduct.price,
              totalHours: selectedProduct.duration || 0,
              selectedHours: selectedHours,
              pickupLocation: pickupLocation,
              dropoffLocation: dropoffLocation,
            },
            selectedSlots: Array.from(selectedSlots),
            instructorData: instructors
          };

          const cartResponse = await fetch('/api/cart/add-driving-lesson-package', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cartData),
          });

          if (!cartResponse.ok) {
            const errorData = await cartResponse.json();
            throw new Error(errorData.error || 'Failed to add to cart');
          }

          const cartResult = await cartResponse.json();
          console.log('✅ Added to cart and slots marked as pending successfully');

          // Add to local cart context
          console.log('🛒 [driving-lessons] Adding to cart context:', {
            id: selectedProduct._id,
            title: selectedProduct.title,
            price: selectedProduct.price,
            packageDetails: cartData.packageDetails,
            selectedSlots: cartData.selectedSlots
          });

          await addToCart({
            id: selectedProduct._id,
            title: selectedProduct.title,
            price: selectedProduct.price,
            quantity: 1,
            packageDetails: cartData.packageDetails,
            selectedSlots: cartData.selectedSlots,
            instructorData: cartData.instructorData
          });

          console.log('🛒 [driving-lessons] Successfully added to cart context');

          alert(
            `Package added to cart successfully!\n\n` +
            `Package: ${selectedProduct.title}\n` +
            `Selected Hours: ${selectedHours} hours\n` +
            `Pickup: ${pickupLocation}\n` +
            `Dropoff: ${dropoffLocation}\n` +
            `Amount: $${selectedProduct.price}\n\n` +
            `✅ Added to cart!\n` +
            `Your selected time slots are now PENDING.\n\n` +
            `Please check your cart (🛒) to complete payment.\n` +
            `Order will be created when you checkout.`
          );

          // Refresh the schedule to show updated slot statuses
          setTimeout(async () => {
            console.log("🔄 Refreshing schedule to show pending slots...");
            await fetchInstructors();
            setForceUpdate(prev => prev + 1);
          }, 1000);

        } catch (error) {
          console.error('❌ Error adding to cart:', error);
          alert(`Error adding to cart: ${error.message || 'Please try again.'}`);
          return; // Don't continue with the rest of the function
        }
      } else {
        alert(
          `Schedule request submitted successfully!\n\n` +
          `Package: ${selectedProduct.title}\n` +
          `Selected Hours: ${selectedHours} hours\n` +
          `Pickup: ${pickupLocation}\n` +
          `Dropoff: ${dropoffLocation}\n` +
          `Payment: Physical Location\n\n` +
          `Your selected time slots are now PENDING.\n` +
          `Our team will contact you at (561) 330-7007 to coordinate the schedule and arrange payment.`
        );
      }

      // Close the modal
      setIsRequestModalOpen(false);

      // Clear selections after successful request
      setSelectedSlots(new Set());
      setSelectedHours(0);

      // Refresh instructors multiple times to ensure update
      const refreshSchedule = async () => {
        console.log("🔄 Refreshing schedule after request...");
        await fetchInstructors();
        setForceUpdate(prev => prev + 1);
        
        // Force a second refresh after 2 more seconds to ensure DB update
        setTimeout(async () => {
          console.log("🔄 Second refresh to ensure DB sync...");
          await fetchInstructors();
          setForceUpdate(prev => prev + 1);
        }, 2000);
      };

      // Initial refresh after 500ms
      setTimeout(refreshSchedule, 500);
      
    } catch (error) {
      console.error('Error creating schedule request:', error);
      alert('Error submitting schedule request. Please try again.');
    }
  };

  const getWeekDates = (date: Date) => {
    const base = new Date(date);
    base.setDate(base.getDate() + weekOffset * 7);
    const startOfWeek = new Date(base);
    startOfWeek.setDate(base.getDate() - startOfWeek.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  };

  const weekDates = selectedDate ? getWeekDates(selectedDate) : [];

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleTimeSlotSelect = (timeSlot: SelectedTimeSlot, lesson: ScheduleEntry) => {
    if (!selectedProduct) {
      alert('Please select a package first.');
      return;
    }
    
    setSelectedTimeSlot(timeSlot);
    setSelectedSlot(lesson);
    
    // If only one instructor, select them automatically
    if (timeSlot.instructors.length === 1) {
      setSelectedInstructor(timeSlot.instructors[0]);
    } else {
      setSelectedInstructor(null);
    }
    
    setIsBookingModalOpen(true);
  };

  return (
    <section className="bg-white pt-32 pb-8 px-2 sm:px-6 flex flex-col items-center w-full">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Side - Package Selector */}
        <PackageSelector
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          products={products}
          selectedProduct={selectedProduct}
          onProductSelect={handleProductSelect}
          onRequestSchedule={handleRequestSchedule}
          selectedHours={selectedHours}
        />

        {/* Right Side - Schedule Table Improved */}
        <ScheduleTableImproved
          selectedProduct={selectedProduct}
          weekOffset={weekOffset}
          onWeekOffsetChange={setWeekOffset}
          weekDates={weekDates}
          instructors={instructors}
          userId={userId}
          onTimeSlotSelect={handleTimeSlotSelect}
          onSelectedHoursChange={setSelectedHours}
          selectedSlots={selectedSlots}
          onSelectedSlotsChange={setSelectedSlots}
          key={`schedule-${forceUpdate}`}
        />
      </div>

      {/* Booking Modal - For available slots */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        selectedProduct={selectedProduct}
        selectedSlot={selectedSlot}
        selectedTimeSlot={selectedTimeSlot}
        selectedInstructor={selectedInstructor}
        onInstructorSelect={setSelectedInstructor}
        onBookPackage={handleBookPackage}
      />

      {/* Request Schedule Modal */}
      <RequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        selectedProduct={selectedProduct}
        selectedSlots={selectedSlots}
        selectedHours={selectedHours}
        onRequestSchedule={handleRequestScheduleWithLocations}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        message={confirmationMessage}
      />

      {/* Auth Warning Modal */}
      <AuthWarningModal
        isOpen={showAuthWarning}
        onClose={() => setShowAuthWarning(false)}
        onLogin={() => setShowLogin(true)}
      />

      {/* Login Modal */}
      <LoginModal 
        open={showLogin} 
        onClose={() => setShowLogin(false)}
        onLoginSuccess={() => {
          setShowLogin(false);
          setShowAuthWarning(false);
        }}
      />
    </section>
  );
}

// Main component with Suspense
export default function DrivingLessonsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <DrivingLessonsContent />
    </Suspense>
  );
}