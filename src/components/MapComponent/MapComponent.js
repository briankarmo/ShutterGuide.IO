import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { X, ChevronDown } from 'lucide-react';
import { GOOGLE_MAPS_CONFIG } from '../../googlemap/googleMapsConfig';
import LocationAutocomplete from '../EditProfileModal/LocationAutocomplete';
import { toast } from 'react-toastify';

const libraries = ['places', 'geometry']; // Define libraries outside the component

const MapComponent = ({ setLocationFilter, onClose }) => {
    // const [countries, setCountries] = useState([]);
    // const [cities, setCities] = useState([]);
    // const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedDistance, setSelectedDistance] = useState('');
    const [locationInfo, setLocationInfo] = useState({})
    // const [isOpen, setIsOpen] = useState(false);
    // const [isCityOpen, setIsCityOpen] = useState(false);
    const [map, setMap] = useState(null);
    const dropdownRef = useRef(null); // Add this ref
    // ... other states ...
    const mapRef = useRef(null);
    const circleRef = useRef(null);

    const { isLoaded, loadError } = useJsApiLoader(GOOGLE_MAPS_CONFIG);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    useEffect(() => {
        
        if ( locationInfo.city ) {
            setSelectedCity({
                name: locationInfo.city,
                latitude: parseFloat(locationInfo.latitude),
                longitude: parseFloat(locationInfo.longitude),
                state: locationInfo.state
            })
        }
    }, [locationInfo])

    // Function to create or update circle
    const updateCircle = (city, distance) => {
        // Remove existing circle if it exists
        if (circleRef.current) {
            circleRef.current.setMap(null);
            circleRef.current = null;
        }

        if (city && distance && mapRef.current) {
            // Create new circle
            circleRef.current = new window.google.maps.Circle({
                map: mapRef.current,
                center: {
                    lat: parseFloat(city.latitude),
                    lng: parseFloat(city.longitude)
                },
                radius: distance * 1609.34,
                fillColor: 'rgba(66, 133, 244, 0.5)',
                strokeColor: '#4285F4',
                strokeWeight: 2
            });
        }
    };

    // Update handleDistanceChange
    const handleDistanceChange = (event) => {
        const distance = parseInt(event.target.value);
        setSelectedDistance(distance);

        // Update circle with new distance
        if (selectedCity) {
            updateCircle(selectedCity, distance);
        }
    };

    const handleSetFilter = () => {
        if ( !selectedCity || !selectedDistance ) {
            toast.error('Select City and Distance.');
            return;
        }
        setLocationFilter({
            name : selectedCity.name,
            latitude: selectedCity.latitude,
            longitude: selectedCity.longitude,
            distance: selectedDistance
        })
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 overflow-y-auto"
            onClick={(e) => {
                // Only close if clicking the overlay background
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="bg-white rounded-lg w-full max-w-[75%] my-8 h-[90%] overflow-y-scroll no-scrollbar">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold text-black">Filter</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-black">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-6">

                    <LocationAutocomplete initialLocation='' setLocationInfo={setLocationInfo} />

                    {/* Update the distance selection UI to match the same style as country and city */}
                    {selectedCity && (
                        <div className="relative mb-4" ref={dropdownRef}>
                            <div className="w-full p-3 border rounded-lg flex items-center justify-between bg-white">
                                <div className='flex w-full items-center justify-between px-3'>
                                    <div className="flex items-center">
                                        <span className="font-bold text-gray-800">
                                            Within {selectedDistance} miles
                                        </span>
                                    </div>
                                    <ChevronDown className="w-4 h-4 ml-2" />
                                </div>
                            </div>
                            <select
                                className="absolute inset-0 w-full opacity-0 cursor-pointer"
                                value={selectedDistance}
                                onChange={handleDistanceChange}
                            >
                                <option className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-left" value="5">Within 5 miles</option>
                                <option className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-left" value="10">Within 10 miles</option>
                                <option className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-left" value="15">Within 15 miles</option>
                                <option className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-left" value="20">Within 20 miles</option>
                                <option className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-left" value="25">Within 25 miles</option>
                                <option className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-left" value="50">Within 50 miles</option>
                                <option className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-left" value="100">Within 100 miles</option>
                            </select>
                        </div>
                    )}



                    {/* Update the GoogleMap component */}
                    {isLoaded && (
                        <GoogleMap
                            mapContainerStyle={{ height: '300px', width: '100%', marginBottom: '30px' }}
                            center={{
                                lat: selectedCity ? parseFloat(selectedCity.latitude) : 40.730610,
                                lng: selectedCity ? parseFloat(selectedCity.longitude) : -73.935242,
                            }}
                            zoom={selectedDistance ? 10 : 12}
                            onLoad={(map) => {
                                setMap(map);
                                mapRef.current = map;
                            }}
                        >
                            {/* Remove Circle component completely */}
                        </GoogleMap>
                    )}

                    <div onClick={() => handleSetFilter()} className=' w-full flex justify-center items-center bg-gray-800 text-white py-3 text-xl rounded-md hover:bg-gray-900 cursor-pointer'>
                        Filter
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapComponent;