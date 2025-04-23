const Banner = () => {
  return (
    <div className="w-full">
      <div className=" md:bg-[#565759] bg-white py-6 items-center">
        <div className="items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="md:text-white text-black text-md px-5 md:text-2xl font-bold">
              BUILDING THE BEST PHOTOGRAPHER DIRECTORY
            </h1>
            <p className="md:text-white text-black text-xs md:text-md font-bold">
              USE PROMO CODE 'FIRSTON' FOR $49/FIRST YEAR
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
