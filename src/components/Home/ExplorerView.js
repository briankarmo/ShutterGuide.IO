import React from "react";

const ExplorerView = ({ images, onProjectClick }) => {
  return (
    <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 md:gap-6 min-h-[55vh]">
      {images.map((item, index) => (
        <div
          key={`${item.projectId}-${index}`}
          className="break-inside-avoid mb-4 md:mb-6 relative group"
        >
          <img
            src={item.image}
            alt={`Project ${index + 1}`}
            className="w-full rounded-lg"
          />
          {/* Profile button overlay */}
          <button
            onClick={() => onProjectClick(item.projectId)}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 hover:bg-white 
                       px-6 py-1.5 rounded-full text-sm font-medium shadow-lg text-black
                       opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            Profile
          </button>
        </div>
      ))}
    </div>
  );
};

export default ExplorerView;
