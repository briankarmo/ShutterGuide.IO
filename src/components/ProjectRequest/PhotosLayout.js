const PhotosLayout = ({ images, onShowAllPhotos }) => {
    return (
        <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 h-[400px] gap-2">
                {/* Left column - first image */}
                {images.length > 0 && (
                    <div className="relative h-full w-full cursor-pointer hover:opacity-80">
                        <img 
                            src={images[0]} 
                            alt="thumbnail"
                            className="absolute inset-0 w-full h-full object-cover rounded-lg"
                        />
                    </div>
                )}

                {/* Right column - 2x2 grid for next 4 images */}
                <div className="hidden sm:grid sm:grid-cols-2 gap-2">
                    {images.slice(1, 5).map((image, index) => (
                        <div key={index + 1} className="relative h-full w-full cursor-pointer hover:opacity-80">
                            <img 
                                src={image} 
                                alt="thumbnail"
                                className="absolute inset-0 w-full h-full object-cover rounded-lg"
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div className="absolute bottom-2 right-2">
                <button 
                    onClick={onShowAllPhotos}
                    className="bg-white hover:bg-gray-100 px-4 py-1 rounded-lg border-2 border-black flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true" role="presentation" focusable="false" style={{display: 'block', height: '16px', width: '16px', fill: 'currentcolor'}}><path fill-rule="evenodd" d="M3 11.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-10-5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-10-5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"></path></svg>
                    <span>Show all photos</span>
                </button>
            </div>
        </div>
    )
}

export default PhotosLayout;