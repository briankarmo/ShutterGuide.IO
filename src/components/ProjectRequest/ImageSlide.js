import React, { useEffect,useState } from "react";
import { X, ChevronLeft, ChevronRight } from 'lucide-react'; 
import './ImageSlide.css'

const ImageSlider = ({ images, initialIndex = 0, onClose }) => {

    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const handlePrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-20"
            onClick={(e) => {
                // Only close if clicking the overlay background
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Previous button */}
            <button
                onClick={handlePrevious}
                className="absolute left-4 text-white hover:text-gray-300 top-1/2"
            >
                <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Image container */}
            <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
                <img
                    src={images[currentIndex]}
                    alt={`Slide ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-cover"
                />
            </div>

            {/* Next button */}
            <button
                onClick={handleNext}
                className="absolute right-4 text-white hover:text-gray-300 top-1/2"
            >
                <ChevronRight className="w-8 h-8" />
            </button>

            {/* Optional: Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
                {currentIndex + 1} / {images.length}
            </div>
        </div>
    );
}

export default ImageSlider