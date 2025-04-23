import React from "react";
import { Carousel } from "@material-tailwind/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { MapPin } from "lucide-react";

const CarouselNavigation = ({ activeIndex, length, setActiveIndex }) => (
  <div className="absolute flex flex-col gap-1 items-center bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
    <div className="flex gap-1">
      {new Array(Math.min(15, length)).fill("").map((_, i) => (
        <span
          key={i}
          className={`h-[10px] w-[10px] rounded-full transition-all duration-300 ${
            activeIndex === i ? "bg-gray-100 w-[10px]" : "bg-gray-400"
          }`}
          onClick={() => setActiveIndex(i)}
        />
      ))}
    </div>
    {length > 15 && (
      <div className="flex gap-1">
        {new Array(Math.min(15, length - 15)).fill("").map((_, i) => (
          <span
            key={i + 15}
            className={`h-[10px] w-[10px] rounded-full transition-all duration-300 ${
              activeIndex === i + 15 ? "bg-gray-100 w-[10px]" : "bg-gray-400"
            }`}
            onClick={() => setActiveIndex(i + 15)}
          />
        ))}
      </div>
    )}
  </div>
);

const CarouselArrow = ({ direction, onClick }) => (
  <button
    onClick={onClick}
    className={`absolute top-1/2 ${
      direction === "prev" ? "left-4" : "right-4"
    } -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-600`}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={
          direction === "prev"
            ? "M15.75 19.5L8.25 12l7.5-7.5"
            : "M8.25 4.5l7.5 7.5-7.5 7.5"
        }
      />
    </svg>
  </button>
);

const PhotographerCard = ({ project, onClick, isMobile }) => {
  return (
    <div className="rounded-lg overflow-hidden">
      <div className="relative aspect-square overflow-hidden cursor-pointer">
        {!isMobile ? (
          <Carousel
            className="rounded-xl"
            autoplay={false}
            loop={true}
            navigation={({ setActiveIndex, activeIndex, length }) => (
              <CarouselNavigation
                activeIndex={activeIndex}
                length={length}
                setActiveIndex={setActiveIndex}
              />
            )}
            prevArrow={({ handlePrev }) => (
              <CarouselArrow direction="prev" onClick={handlePrev} />
            )}
            nextArrow={({ handleNext }) => (
              <CarouselArrow direction="next" onClick={handleNext} />
            )}
          >
            {project.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Project ${index + 1}`}
                className="h-full w-full object-cover"
                onClick={onClick}
              />
            ))}
          </Carousel>
        ) : (
          <Swiper className="mySwiper swiper-custom h-full w-full">
            {project.images.map((image, index) => (
              <SwiperSlide
                key={index}
                className="h-full w-full flex items-center justify-center "
              >
                <img
                  src={image}
                  alt={`Project ${index + 1}`}
                  className="h-full w-full object-cover rounded-xl"
                  onClick={onClick}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
      <div className="mt-3">
        <h3 className="text-lg font-semibold text-left text-black">
          {project.projectName}
        </h3>
        <div className="text-black text-sm text-left">
          {project.categories.map((category) => category.label).join(", ")}
        </div>
        <div className="flex items-center mt-1 text-black text-sm">
          <MapPin className="w-4 h-4 mr-1" />
          {project.location}
        </div>
      </div>
    </div>
  );
};

export default PhotographerCard;
