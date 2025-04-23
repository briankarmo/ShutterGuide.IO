import React from "react";
import logo from "../../assets/img/SGAirStackedBlack.png";
const AboutModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-white text-black rounded-2xl py-8 px-8 md:px-14 max-w-[1000px] md:w-3/4 w-full mx-4 border-2 border-black">
        <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-12">
          OUR MISSION
        </h2>

        <div className="text-sm md:text-lg font-bold justify-start items-center text-start">
          {/* Add your about content here */}
          <p className="text-sm md:text-xl">FOR PHOTOGRAPHERS</p>
          <p className="mt-5">
            Get new leads without running ads, SEO for your website, or get a
            huge following on social media
          </p>
          <p className="text-sm md:text-xl mt-10">FOR CLIENTS</p>
          <p className="mt-5">
            Find professional photographers who match your style, location, and
            specific needs quick and easy
          </p>
        </div>
        <div className="justify-center items-center mt-8 md:mt-16 font-bold">
          <p className="text-sm md:text-lg">
            WE ARE CURRENTLY WORKING ON NEW DESIGNS AND FEATURES
          </p>
          <p className="text-sm md:text-lg">
            WE WOULD LOVE TO HEAR YOUR FEEDBACK AS WE GROW!
          </p>
        </div>
        <div className="flex justify-center items-center mt-8 md:mt-16 md:mb-6">
          <img src={logo} alt="logo" className="w-[160px]" />
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
