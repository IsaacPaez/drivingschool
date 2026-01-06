import React, { useEffect, useRef } from "react";

interface LocationInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  isLoaded: boolean;
}

const LocationInput: React.FC<LocationInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  isLoaded,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const onChangeRef = useRef(onChange);
  const initializedRef = useRef(false);

  // Keep the onChange ref updated
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Initialize Google Places Autocomplete on the native input once maps are loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    try {
      if (!(window as never as { google?: typeof google }).google?.maps?.places) {
        return;
      }

      const input = inputRef.current;
      const autocomplete = new google.maps.places.Autocomplete(input, {
        fields: ["formatted_address", "name", "geometry"],
        types: ["geocode"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        const selectedValue =
          place.formatted_address || place.name || input.value || "";

        if (selectedValue) {
          onChangeRef.current(selectedValue);
        }
      });

      autocompleteRef.current = autocomplete;
      initializedRef.current = true;
    } catch (err) {
      console.error("❌ [LOCATION INPUT] Error creating autocomplete", err);
      initializedRef.current = false;
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [isLoaded]);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2 text-gray-800">{label}</label>
      <div className="relative">
        <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1118 0z"
            />
          </svg>
        </span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChangeRef.current(e.target.value)}
          placeholder={placeholder}
          className="block w-full rounded-lg border border-gray-400 bg-white px-3 py-3 pl-10 text-sm text-gray-900 placeholder-gray-500 shadow-sm focus:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200"
        />
      </div>
      <style jsx global>{`
        /* Style prediction dropdown items (legacy classes from Places API) */
        .pac-container {
          background-color: white !important;
          border: 1px solid #d1d5db !important;
          border-radius: 0.5rem !important;
          margin-top: 4px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2) !important;
          z-index: 99999 !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Helvetica Neue", Arial, sans-serif !important;
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
        .pac-item:hover,
        .pac-item-selected,
        .pac-item-selected:hover {
          background-color: #f3f4f6 !important;
        }
        .pac-item-query {
          color: #000000 !important;
          font-weight: 600 !important;
        }
        .pac-matched {
          color: #374151 !important;
          font-weight: 600 !important;
        }
      `}</style>
    </div>
  );
};

export default LocationInput;
