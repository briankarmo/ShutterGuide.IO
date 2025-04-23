import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/UserContext";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import userImage from "../../assets/img/placeholder.webp";
import logoImage from "../../assets/img/SGAirStackedBlack.png";
import searchIcon from "../../assets/img/search_icon.png";
import filter_bl from "../../assets/img/filter_bl.png";
import menu_bl from "../../assets/img/menu_bl.png";

const Header = ({
  avatarUrl,
  setAvatarUrl,
  locationFilter,
  setLocationFilter,
  handleOpenEditProfile,
  handleOpenProjectsModal,
  handleOpenPricingModal,
  viewMode,
  setViewMode,
  handleOpenAboutUs,
  handleFilterClick,
  handleHomeClick,
}) => {
  const { user, logOut, subscription } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };

  const handleSignOut = () => {
    logOut()
      .then(() => {
        setAvatarUrl(null);
      })
      .catch((error) => console.error(error));
  };

  return (
    <div>
      <div className="hidden md:flex w-full items-center">
        {/* Left section - Logo and Search (50% width) */}
        <div className="flex w-3/4 gap-4 items-center">
          <div className="justify-center items-center mr-5 md:flex hidden">
            <img
              src={logoImage}
              onClick={handleHomeClick}
              className="w-[180px] h-auto cursor-pointer"
              alt="logo"
            />
          </div>
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search"
              className="w-full p-2 pl-10 border text-[10px] md:text-sm font-bold bg-[#EDEDED] border-gray-300 rounded-md focus:outline-none focus:ring-2 text-gray-700 focus:ring-gray-400"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
            <img
              src={searchIcon}
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              alt="search"
            />
          </div>
        </div>

        {/* Right section - View Toggle, About Us, Pricing, and Profile */}
        <div className="flex items-center gap-5 justify-between w-1/2">
          {/* Single Toggle Button */}
          <button
            onClick={() => {
              handleFilterClick();
              setShowMenu(false);
            }}
            className="cursor-pointer ml-5 xl:ml-10 2xl:ml-20 font-bold border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-100 rounded-md p-2 w-[60px]"
          >
            <img
              src={filter_bl}
              alt="Filter"
              className="h-[20px] w-[25px] mx-auto my-auto"
            />
          </button>
          <div className="relative">
            {showMenu && (
              <div className="absolute top-12 z-30 right-0 bg-white rounded-lg shadow-lg overflow-hidden w-36">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleOpenAboutUs();
                  }}
                  className="w-full px-4 py-2 text-left text-black hover:bg-gray-100 text-sm"
                >
                  About Us
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleOpenPricingModal();
                  }}
                  className="w-full px-4 py-2 text-left text-black hover:bg-gray-100 text-sm"
                >
                  Pricing
                </button>
              </div>
            )}
            <button
              onClick={handleMenuClick}
              className="cursor-pointer font-bold border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-100 rounded-md p-2 w-[60px]"
            >
              <img
                src={menu_bl}
                alt="Menu"
                className="h-[20px] w-[25px] mx-auto my-auto"
              />
            </button>
          </div>
          <button
            className="md:w-auto w-full px-4 py-2 rounded-md text-[10px] md:text-sm font-medium transition-colors border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
            onClick={() =>
              setViewMode(viewMode === "Explorer" ? "Profile" : "Explorer")
            }
          >
            {viewMode === "Explorer" ? "PROFILE VIEW" : "EXPLORER VIEW"}
          </button>

          {/* Profile Menu - existing code */}
          <div className="items-center p-2 gap-3 cursor-pointer">
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <MenuButton className="justify-center items-center rounded-full inline-flex w-full gap-x-1.5 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-900 hover:bg-gray-50">
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 17 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 1h15M1 7h15M1 13h15"
                    />
                  </svg>
                  <img
                    className="rounded-full hidden md:block w-8 h-8 object-cover"
                    src={avatarUrl || user?.photoURL || userImage}
                    alt="user"
                    onError={(e) => {
                      e.target.onerror = null; // Prevent infinite loop
                      e.target.src = userImage; // Fallback to default image
                    }}
                  />
                </MenuButton>
              </div>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
              >
                <div className="py-1">
                  {user && (
                    <MenuItem onClick={() => handleOpenEditProfile()}>
                      <div
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-900 data-[focus]:bg-gray-100 data-[focus]:text-gray-500 data-[focus]:outline-none"
                      >
                        Edit Profile
                      </div>
                    </MenuItem>
                  )}
                  {!user && (
                    <MenuItem>
                      <a
                        href="/login"
                        className="block px-4 py-2 text-sm text-gray-900 data-[focus]:bg-gray-100 data-[focus]:text-gray-500 data-[focus]:outline-none"
                      >
                        Login
                      </a>
                    </MenuItem>
                  )}
                  {!user && (
                    <MenuItem>
                      <a
                        href="/register"
                        className="block px-4 py-2 text-sm text-gray-900 data-[focus]:bg-gray-100 data-[focus]:text-gray-500 data-[focus]:outline-none"
                      >
                        Register
                      </a>
                    </MenuItem>
                  )}
                  {user && subscription?.isActive && (
                    <form action="#" method="POST">
                      <MenuItem onClick={() => handleOpenProjectsModal()}>
                        <div
                          href="#"
                          className="block w-full px-4 py-2 text-left text-sm text-gray-900 data-[focus]:bg-gray-100 data-[focus]:text-gray-500 data-[focus]:outline-none"
                        >
                          Projects
                        </div>
                      </MenuItem>
                    </form>
                  )}
                  <form action="#" method="POST" className="block md:hidden">
                    <MenuItem onClick={() => handleOpenPricingModal()}>
                      <div
                        href="#"
                        className="block w-full px-4 py-2 text-left text-sm text-gray-900 data-[focus]:bg-gray-100 data-[focus]:text-gray-500 data-[focus]:outline-none"
                      >
                        Pricing
                      </div>
                    </MenuItem>
                  </form>

                  {user && (
                    <form action="#" method="POST">
                      <MenuItem onClick={handleSignOut}>
                        <div
                          href="#"
                          className="block w-full px-4 py-2 text-left text-sm text-gray-900 data-[focus]:bg-gray-100 data-[focus]:text-gray-500 data-[focus]:outline-none"
                        >
                          Sign out
                        </div>
                      </MenuItem>
                    </form>
                  )}
                </div>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
