import React, { useEffect, useRef, useState } from "react";

interface LocationInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  isLoaded: boolean;
}

const LocationInput: React.FC<LocationInputProps> = ({
  label,
  onChange,
  placeholder,
  isLoaded,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autocompleteElementRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const [isInitialized, setIsInitialized] = useState(false);

  // Keep the onChange ref updated
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Initialize Place Autocomplete Element
  useEffect(() => {
    const container = containerRef.current;

    const initAutocomplete = async () => {
      if (isLoaded && container && !autocompleteElementRef.current) {
        try {
          console.log('🗺️ [LOCATION INPUT] Initializing gmp-place-autocomplete for:', label);

          // Wait a bit for Google Maps to be fully loaded
          await new Promise(resolve => setTimeout(resolve, 100));

          // Check if google.maps.importLibrary is available
          if (!google?.maps?.importLibrary) {
            console.error('❌ [LOCATION INPUT] google.maps.importLibrary not available');
            return;
          }

          // Load the places library
          await google.maps.importLibrary("places");

          // Create the gmp-place-autocomplete custom element directly
          const autocompleteElement = document.createElement('gmp-place-autocomplete');

          // Set attributes
          autocompleteElement.setAttribute('placeholder', placeholder);

          // Force light mode styling
          autocompleteElement.style.width = '100%';
          autocompleteElement.style.colorScheme = 'light';

          // Store reference
          autocompleteElementRef.current = autocompleteElement;

          // Add event listener for place selection
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          autocompleteElement.addEventListener('gmp-placeselect', async (event: any) => {
            const place = event.place;

            console.log('🗺️ [LOCATION INPUT] Place selected:', {
              label,
              place: place?.displayName || place?.formattedAddress || 'Unknown'
            });

            if (place) {
              // Fetch place details to get the formatted address
              await place.fetchFields({
                fields: ['displayName', 'formattedAddress', 'location'],
              });

              const selectedValue = place.formattedAddress || place.displayName || '';

              if (selectedValue) {
                console.log('✅ [LOCATION INPUT] Updating state with:', selectedValue);
                onChangeRef.current(selectedValue);
              }
            }
          });

          // Append to container
          if (container) {
            container.appendChild(autocompleteElement);
            setIsInitialized(true);
            console.log('✅ [LOCATION INPUT] gmp-place-autocomplete initialized successfully for:', label);
          }
        } catch (error) {
          console.error('❌ [LOCATION INPUT] Error initializing gmp-place-autocomplete:', error);
        }
      }
    };

    initAutocomplete();

    // Cleanup on unmount
    return () => {
      if (autocompleteElementRef.current && container) {
        try {
          if (container.contains(autocompleteElementRef.current)) {
            container.removeChild(autocompleteElementRef.current);
          }
        } catch (e) {
          console.error('Error cleaning up autocomplete element:', e);
        }
        autocompleteElementRef.current = null;
        setIsInitialized(false);
      }
    };
  }, [isLoaded, label, placeholder]);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2 text-gray-800">
        {label}
        {isInitialized && (
          <span className="ml-2 text-xs text-green-600">
            <svg className="inline w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Google Autocomplete Ready
          </span>
        )}
      </label>
      <div
        ref={containerRef}
        className="w-full location-input-container"
      />
      {!isLoaded && (
        <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 animate-pulse">
          <div className="flex items-center">
            <svg className="animate-spin h-4 w-4 mr-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading Google Maps...
          </div>
        </div>
      )}
      <style jsx global>{`
        /* CRITICAL: Force light mode for Google Places Autocomplete Element */
        gmp-place-autocomplete {
          width: 100% !important;
          display: block !important;
          color-scheme: light !important;
        }
        
        /* Force white background and black text with GRAY border always */
        gmp-place-autocomplete input,
        gmp-place-autocomplete input[type="text"] {
          background-color: #ffffff !important;
          background: #ffffff !important;
          color: #000000 !important;
          border: 2px solid #9ca3af !important;
          border-radius: 0.5rem !important;
          padding: 0.75rem !important;
          font-size: 0.875rem !important;
          width: 100% !important;
          box-sizing: border-box !important;
          -webkit-text-fill-color: #000000 !important;
          transition: border-color 0.2s ease !important;
        }
        
        /* Override any dark mode styles */
        gmp-place-autocomplete * {
          color-scheme: light !important;
        }
        
        /* Keep border GRAY even on focus */
        gmp-place-autocomplete input:focus {
          outline: none !important;
          border-color: #6b7280 !important;
          border-width: 2px !important;
          box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1) !important;
          background-color: #ffffff !important;
        }
        
        gmp-place-autocomplete input::placeholder {
          color: #9ca3af !important;
          opacity: 1 !important;
        }

        /* Override Google's internal shadow DOM styles using ::part */
        gmp-place-autocomplete::part(input) {
          background-color: #ffffff !important;
          color: #000000 !important;
        }
        
        /* Style prediction dropdown items using ::part */
        gmp-place-autocomplete::part(prediction-list) {
          background-color: #ffffff !important;
          border: 1px solid #d1d5db !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
          margin-top: 4px !important;
        }
        
        gmp-place-autocomplete::part(prediction-item) {
          background-color: #ffffff !important;
          color: #000000 !important;
          padding: 10px 12px !important;
          border-top: 1px solid #f3f4f6 !important;
        }
        
        gmp-place-autocomplete::part(prediction-item-selected) {
          background-color: #f3f4f6 !important;
        }
        
        gmp-place-autocomplete::part(prediction-item-main-text) {
          color: #000000 !important;
        }
        
        gmp-place-autocomplete::part(prediction-item-match) {
          color: #374151 !important;
          font-weight: 600 !important;
        }
        
        gmp-place-autocomplete::part(prediction-item-icon) {
          color: #6b7280 !important;
        }

        /* FALLBACK: Style the dropdown suggestions using legacy class - Must be above modals */
        .pac-container {
          background-color: white !important;
          border: 1px solid #d1d5db !important;
          border-radius: 0.5rem !important;
          margin-top: 4px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2) !important;
          z-index: 99999 !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
        }

        /* Ensure dropdown appears above everything */
        .pac-container:after {
          background-image: none !important;
          height: 0 !important;
        }

        .pac-item {
          background-color: white !important;
          color: #000000 !important;
          padding: 10px 12px !important;
          border-top: 1px solid #f3f4f6 !important;
          cursor: pointer !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
        }

        .pac-item:first-child {
          border-top: none !important;
        }

        .pac-item span {
          color: #000000 !important;
        }

        .pac-item:hover {
          background-color: #f3f4f6 !important;
        }

        .pac-item-selected,
        .pac-item-selected:hover {
          background-color: #f3f4f6 !important;
        }

        .pac-matched {
          color: #374151 !important;
          font-weight: 600 !important;
        }

        .pac-icon {
          display: inline-block !important;
          vertical-align: middle !important;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/%3E%3Ccircle cx='12' cy='10' r='3'/%3E%3C/svg%3E") !important;
          background-size: contain !important;
          background-repeat: no-repeat !important;
          width: 16px !important;
          height: 16px !important;
          margin-right: 10px !important;
          margin-top: 2px !important;
        }

        .pac-icon-marker {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/%3E%3Ccircle cx='12' cy='10' r='3'/%3E%3C/svg%3E") !important;
        }

        .pac-item-query {
          color: #000000 !important;
          font-size: 14px !important;
          padding-right: 3px !important;
        }

        .pac-logo:after {
          background-image: none !important;
          padding: 8px !important;
          height: auto !important;
        }

        /* Style the "powered by Google" logo area */
        .hdpi.pac-logo:after {
          background-image: none !important;
        }
      `}</style>
    </div>
  );
};

export default LocationInput;
