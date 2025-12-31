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

        // Cast to any to avoid TS errors
        (placeAutocomplete as any).placeholder = placeholder;

        // Apply classes to match the original input design
        placeAutocomplete.classList.add(
          "w-full",
          "border",
          "border-gray-300",
          "rounded-lg",
          "shadow-sm",
          "bg-white" // Force tailwind white background
        );

        // Add event listener for place change
        (placeAutocomplete as any).addEventListener('gmp-placeselect', async ({ place }: any) => {
          await place.fetchFields({ fields: ['formattedAddress', 'location', 'displayName'] });
          const address = place.formattedAddress || place.displayName;
          onChange(address);
        });

        containerRef.current.appendChild(placeAutocomplete);
      } else {
        // Fallback or error handling if the API script loaded but lacks the new class
        console.error("PlaceAutocompleteElement not found. Ensure the correct libraries are loaded.");
      }
    }
  }, [isLoaded, placeholder]);

  return (
    <div className="mb-4 location-input-wrapper">
      <style jsx global>{`
        /* Override Google Map Element Variables for "Light Mode" look */
        gmp-place-autocomplete {
          --gmp-px-color-surface: #ffffff;
          --gmp-px-color-on-surface: #1f2937; /* gray-800 */
          --gmp-px-color-on-surface-variant: #6b7280; /* gray-500 */
        }
      `}</style>
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
