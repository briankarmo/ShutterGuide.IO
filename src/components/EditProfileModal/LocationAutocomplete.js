import React, { useEffect, useRef } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { GOOGLE_MAPS_CONFIG } from '../../googlemap/googleMapsConfig';

const LocationAutocomplete = ({initialLocation, setLocationInfo, placeholder}) => {
  // const [location, setLocation] = useState(initialLocation || '');
  // const [autocomplete, setAutocomplete] = useState(null);
  const inputRef = useRef(null);

  const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_CONFIG);

  // Set initial value
  useEffect(() => {
    if (inputRef.current && initialLocation) {
      inputRef.current.value = initialLocation.formattedAddress;
      // setLocation(initialLocation);
    }
  }, [initialLocation]);

  useEffect(() => {
    if (isLoaded && inputRef.current) {
      // Initialize autocomplete when component mounts and Google is loaded
      const autocompleteInstance = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['(cities)'], // This restricts to cities
          fields: ['address_components', 'geometry', 'formatted_address']
        }
      );

      // Add listener for place selection
      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();
        
        if (place.geometry) {
          // Get coordinates
          const latitude = place.geometry.location.lat();
          const longitude = place.geometry.location.lng();

          // Extract city, state, and country from address components
          let city = '';
          let state = '';
          let country = '';

          place.address_components.forEach(component => {
            if (component.types.includes('locality')) {
              city = component.long_name;
            }
            if (component.types.includes('administrative_area_level_1')) {
              state = component.long_name;
            }
            if (component.types.includes('country')) {
              country = component.long_name;
            }
          });

          // Update state with selected location info
          // setLocation({
          //   formattedAddress: place.formatted_address,
          //   city,
          //   state,
          //   country,
          //   latitude,
          //   longitude
          // });

          setLocationInfo({
            formattedAddress: place.formatted_address,
            city,
            state,
            country,
            latitude,
            longitude
          })
        }
      });

      // setAutocomplete(autocompleteInstance);
    }
  }, [isLoaded, setLocationInfo]);

  useEffect(() => {
    // Custom CSS for autocomplete dropdown
    const style = document.createElement('style');
    style.textContent = `
      .pac-container {
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        margin-top: 4px;
        background-color: white;
        font-family: inherit;
      }

      .pac-item {
        padding: 8px 16px;
        cursor: pointer;
        font-family: inherit;
        border-top: 1px solid #e2e8f0;
      }

      .pac-item:first-child {
        border-top: none;
      }

      .pac-item:hover {
        background-color: #f7fafc;
      }

      .pac-item-query {
        font-size: 14px;
        font-weight: 600;
        color: #1a202c;
      }

      .pac-matched {
        font-weight: 700;
        color: #2563eb;
      }

      .pac-icon {
        display: none;  /* Remove default icon */
      }

      .pac-item-selected {
        background-color: #f7fafc;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="w-full h-full">
      <input
        ref={inputRef}
        id="location-input"
        type="text"
        placeholder={placeholder ? placeholder : "Enter city, state, or country"}
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
      />
      {/* {location && (
        <div className="mt-2">
          <p>Selected: {location.formattedAddress}</p>
          <p>Coordinates: {location.latitude}, {location.longitude}</p>
        </div>
      )} */}
    </div>
  );
};

export default LocationAutocomplete;