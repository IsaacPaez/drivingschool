"use client";

import React, { useRef, useState } from "react";
import Modal from "@/components/Modal";
import LocationInput from "@/components/LocationInput";
import { useJsApiLoader } from "@react-google-maps/api";

// Google Maps configuration
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const LIBRARIES: "places"[] = ["places"];

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

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct: Product | null;
  selectedSlots: Set<string>;
  selectedHours: number;
  onRequestSchedule: (pickupLocation: string, dropoffLocation: string, paymentMethod: 'online' | 'physical') => void;
}

export default function RequestModal({
  isOpen,
  onClose,
  selectedProduct,
  selectedSlots,
  selectedHours,
  onRequestSchedule
}: RequestModalProps) {
  // Google Maps states
  const [pickupLocation, setPickupLocation] = useState<string>("");
  const [dropoffLocation, setDropoffLocation] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'physical'>('online');
  const pickupAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const dropoffAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  // Google Maps Autocomplete handlers
  const onPickupLoad = (autocomplete: google.maps.places.Autocomplete) => {
    pickupAutocompleteRef.current = autocomplete;
  };

  const onPickupPlaceChanged = () => {
    if (pickupAutocompleteRef.current) {
      const place = pickupAutocompleteRef.current.getPlace();
      if (place?.formatted_address) {
        setPickupLocation(place.formatted_address);
      }
    }
  };

  const onDropoffLoad = (autocomplete: google.maps.places.Autocomplete) => {
    dropoffAutocompleteRef.current = autocomplete;
  };

  const onDropoffPlaceChanged = () => {
    if (dropoffAutocompleteRef.current) {
      const place = dropoffAutocompleteRef.current.getPlace();
      if (place?.formatted_address) {
        setDropoffLocation(place.formatted_address);
      }
    }
  };

  const handleRequestSchedule = () => {
    if (!pickupLocation.trim() || !dropoffLocation.trim()) {
      alert("Please fill in both pickup and dropoff locations.");
      return;
    }
    onRequestSchedule(pickupLocation, dropoffLocation, paymentMethod);
    onClose();
    // Reset form
    setPickupLocation("");
    setDropoffLocation("");
    setPaymentMethod('online');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 md:p-8 text-black w-full max-w-4xl mx-auto" style={{minWidth: '400px', maxWidth: '900px', width: '90vw', paddingTop: '3rem'}}>
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800 text-center">Schedule Request</h2>
        
        {selectedProduct && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="mb-2 text-sm"><strong>Package:</strong> {selectedProduct.title}</p>
                <p className="mb-2 text-sm"><strong>Price:</strong> ${selectedProduct.price}</p>
                {selectedProduct.duration && (
                  <p className="mb-2 text-sm"><strong>Total Hours:</strong> {selectedProduct.duration} hours</p>
                )}
              </div>
              <div>
                <p className="mb-2 text-sm"><strong>Selected Hours:</strong> {selectedHours} hours</p>
                <p className="mb-2 text-sm"><strong>Selected Slots:</strong> {selectedSlots.size} time slots</p>
                <p className="text-xs text-blue-600">
                  <strong>Status:</strong> {selectedHours === (selectedProduct.duration || 0) ? "✓ Complete selection" : "Partial selection"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-gray-800 text-base">Payment Method:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer">
              <input
                type="radio"
                value="online"
                checked={paymentMethod === 'online'}
                onChange={(e) => setPaymentMethod(e.target.value as 'online' | 'physical')}
                className="mr-2 text-green-600 focus:ring-green-500"
              />
              <div>
                <div className="font-semibold text-green-600 text-sm">💳 Pay Online Now</div>
                <div className="text-xs text-gray-600">Add to cart and pay securely online</div>
              </div>
            </label>
            
            <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
              <input
                type="radio"
                value="physical"
                checked={paymentMethod === 'physical'}
                onChange={(e) => setPaymentMethod(e.target.value as 'online' | 'physical')}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="font-semibold text-blue-600 text-sm">🏢 Pay at Physical Location</div>
                <div className="text-xs text-gray-600">Complete payment when you arrive for your lessons</div>
              </div>
            </label>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-gray-800 text-base">Location Details:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <LocationInput
              label="Pickup Location *"
              value={pickupLocation}
              onChange={setPickupLocation}
              onLoad={onPickupLoad}
              onPlaceChanged={onPickupPlaceChanged}
              placeholder="Enter pickup location"
              isLoaded={isLoaded}
            />
            
            <LocationInput
              label="Drop-off Location *"
              value={dropoffLocation}
              onChange={setDropoffLocation}
              onLoad={onDropoffLoad}
              onPlaceChanged={onDropoffPlaceChanged}
              placeholder="Enter drop-off location"
              isLoaded={isLoaded}
            />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
          <h3 className="font-bold text-blue-800 mb-2 text-base">📞 Our Team Will Communicate With You</h3>
          <p className="text-blue-800 mb-2 text-sm">
            <strong>Please contact our team to finalize the process and coordinate your schedule.</strong>
          </p>
          <div className="bg-white p-3 rounded-lg border border-blue-300">
            <p className="text-blue-900 font-semibold text-center text-sm">
              📞 Call us at: <span className="text-lg font-bold text-blue-600">(561) 330-7007</span>
            </p>
            <p className="text-blue-700 text-xs text-center mt-1">
              Our team is ready to help you complete your booking and arrange the perfect schedule for your driving lessons.
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors font-semibold text-sm min-w-[120px]"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`px-6 py-2 rounded-lg font-semibold transition-colors text-sm min-w-[180px] ${
              pickupLocation.trim() && dropoffLocation.trim()
                ? paymentMethod === 'online' 
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={handleRequestSchedule}
            disabled={!pickupLocation.trim() || !dropoffLocation.trim()}
          >
            {paymentMethod === 'online' ? 'Request Schedule & Add to Cart' : 'Request Schedule'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
