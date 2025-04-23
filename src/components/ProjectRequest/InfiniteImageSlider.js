import React, { useState, useEffect } from 'react';
import { Pause, Play } from 'lucide-react';

const InfiniteImageSlider = ({ images }) => {
    const [isPlaying, setIsPlaying] = useState(true);

    if (!images || images.length === 0) return null;

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="relative w-full">
            {/* Infinite Scroll Container */}
            <div className={`w-full ${images.length > 1 ? 'inline-flex' : ''} flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)] `}>
                {
                    images.length > 1 ? (
                        <div className='flex'>
                            {/* First set of scrolling images */}
                            <div className={`flex animate-infinite-scroll ${!isPlaying ? 'pause' : ''}`}>
                                <div className="flex items-center justify-center md:justify-start [&_img]:max-w-none">
                                    {images.map((image, index) => (
                                        <div key={`first-${index}`} className="mx-8">
                                            <img
                                                src={image}
                                                alt={`slide ${index}`}
                                                className="h-[400px] w-auto object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Duplicate set of images for seamless looping */}
                            <div className={`flex animate-infinite-scroll ${!isPlaying ? 'pause' : ''}`}>
                                <div className="flex items-center justify-center md:justify-start [&_img]:max-w-none">
                                    {images.map((image, index) => (
                                        <div key={`second-${index}`} className="mx-8">
                                            <img
                                                src={image}
                                                alt={`slide ${index}`}
                                                className="h-[400px] w-auto object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Third set of images for continuous loop */}
                            <div className={`flex animate-infinite-scroll ${!isPlaying ? 'pause' : ''}`}>
                                <div className="flex items-center justify-center md:justify-start [&_img]:max-w-none">
                                    {images.map((image, index) => (
                                        <div key={`third-${index}`} className="mx-8">
                                            <img
                                                src={image}
                                                alt={`slide ${index}`}
                                                className="h-[400px] w-auto object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center [&_img]:max-w-none">
                            {images.map((image, index) => (
                                <div key={`first-${index}`} className="mx-8 flex justify-center">
                                    <img
                                        src={image}
                                        alt={`slide ${index}`}
                                        className="h-[400px] w-auto object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )
                }
            </div>

            {/* Play/Pause Button for multi-image scenarios */}
            {images.length > 1 && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation()
                        togglePlay()
                    }} 
                    className="absolute top-4 right-4 z-10 bg-white/50 rounded-full p-2 hover:bg-white/75 transition-colors"
                >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
            )}
        </div>
    );
};

export default InfiniteImageSlider;