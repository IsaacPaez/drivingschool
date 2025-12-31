import React, { useEffect, useRef } from "react";

interface LocationInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onLoad?: (autocomplete: any) => void; // Keeping compatible signature
  onPlaceChanged?: () => void; // Keeping compatible signature
  placeholder: string;
  isLoaded: boolean;
}

const LocationInput: React.FC<LocationInputProps> = ({
  label,
  value,
  onChange,
  onLoad,
  onPlaceChanged,
  placeholder,
  isLoaded,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Initialize Autocomplete manually to ensure we can try to use standard API
  // However, since the ERROR says "Autocomplete is not available", strictly speaking we should use the new PlaceAutocompleteElement
  // But PlaceAutocompleteElement generates its OWN UI (Web Component).
  // If we want to use the existing Input UI, we can't easily.
  // The error suggests: "Please use google.maps.places.PlaceAutocompleteElement instead".
  // This means we have to render a container for it.

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaded && containerRef.current) {
      if (!window.google || !window.google.maps || !window.google.maps.places) return;

      // Check if PlaceAutocompleteElement exists (New API)
      if (google.maps.places.PlaceAutocompleteElement) {
        // Clear previous content
        containerRef.current.innerHTML = '';

        // Create the element
        // @ts-ignore - TS might not know about this new element yet
        const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement();

        // Cast to any to avoid TS errors with missing properties in current type definitions
        (placeAutocomplete as any).placeholder = placeholder;

        // Add event listener for place change
        (placeAutocomplete as any).addEventListener('gmp-placeselect', async ({ place }: any) => {
          await place.fetchFields({ fields: ['formattedAddress', 'location', 'displayName'] });
          const address = place.formattedAddress || place.displayName;
          onChange(address);

          // Compatibility with parent's onPlaceChanged concept
          // We can't really pass the 'autocomplete' object back in the same way, 
          // but we can mimic the behavior if the parent relies on refs.
          // However, RequestModal uses a ref to getPlace(). 
          // We need to update RequestModal logic too, but first let's get the Input working.
        });

        containerRef.current.appendChild(placeAutocomplete);
      } else {
        // Fallback or error handling if the API script loaded but lacks the new class
        console.error("PlaceAutocompleteElement not found. Ensure the correct libraries are loaded.");
      }
    }
  }, [isLoaded, placeholder]);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">{label}</label>
      {isLoaded ? (
        <div ref={containerRef} className="place-autocomplete-container">
          {/* Web Component will be injected here */}
        </div>
      ) : (
        <input
          type="text"
          value={value}
          placeholder="Loading Google Maps..."
          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
          disabled
        />
      )}
    </div>
  );
};

export default LocationInput;
