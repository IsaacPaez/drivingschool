import { Autocomplete } from "@react-google-maps/api";

interface LocationInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onLoad: (autocomplete: google.maps.places.Autocomplete) => void;
  onPlaceChanged: () => void;
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
  isLoaded
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">
        {label}
      </label>
      {isLoaded ? (
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
          options={{
            componentRestrictions: { country: 'us' }, // Restricto a USA
            fields: ['formatted_address', 'geometry', 'name'],
            types: ['address']
          }}
        >
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
          />
        </Autocomplete>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Loading Google Maps..."
          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
          disabled
        />
      )}
    </div>
  );
};

export default LocationInput;
