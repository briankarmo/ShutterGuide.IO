import React, { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../../context/UserContext";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  getDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import app from "../../firebase/firebase.config";
import logoImage from "../../assets/img/SGAirStackedBlack.png";
import Header from "../Header/Header";
import EditProfileModal from "../EditProfileModal/EditProfileModal";
import ProjectsModal from "../ProjectsModal/ProjectsModal";
import PricingModal from "../PricingModal/PricingModal";
import Banner from "../Banner/Banner";
import "./Home.css";
import loading_gif from "../../assets/img/loading.gif";
import ExplorerView from "./ExplorerView";
import ProfileView from "./ProfileView";
import AboutModal from "./About";
import homeIcon from "../../assets/img/home.png";
import filterIcon from "../../assets/img/filter.png";
import menuIcon from "../../assets/img/menu.png";
import profileIcon from "../../assets/img/profile.png";
import searchIcon from "../../assets/img/search.png";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

const Home = () => {
  const navigate = useNavigate();
  const db = getFirestore(app);
  const { user, logOut } = useContext(AuthContext);
  const SESSION_DURATION = 3600000; // 1 hour in milliseconds
  const [priceModal, setPriceModal] = useState(
    window.localStorage.getItem("registered")
  );
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [data, setData] = useState(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("viewMode") || "Profile";
  });
  const [locationFilter, setLocationFilter] = useState("");
  const [selectedLogoIds, setSelectedLogoIds] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [explorerImages, setExplorerImages] = useState([]);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [showTopButton, setShowTopButton] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedInfos, setSelectedInfos] = useState([]);
  const [showProfileSubmenu, setShowProfileSubmenu] = useState(false);
  const [showMenuSubmenu, setShowMenuSubmenu] = useState(false);
  const [infos, setInfos] = useState([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("session");
    logOut();
    navigate("/login");
  }, [logOut, navigate]);

  const checkSession = useCallback(() => {
    const sessionData = JSON.parse(localStorage.getItem("session"));
    if (sessionData && sessionData.expirationTime < Date.now()) {
      handleLogout();
    }
  }, [handleLogout]);

  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    setSession();
    checkSession();

    const interval = setInterval(() => {
      checkSession();
    }, 60000);

    return () => clearInterval(interval);
  }, [checkSession]);

  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (user) {
        const db = getFirestore(app);
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.photoURL) {
            setAvatarUrl(userData.photoURL);
          }
        }
      }
    };

    fetchUserAvatar();
  }, [user]);

  const setSession = () => {
    const expirationTime = Date.now() + SESSION_DURATION;
    localStorage.setItem("session", JSON.stringify({ expirationTime }));
  };

  const fetchData = useCallback(async () => {
    try {
      const q = query(collection(db, "categories"), orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }, [db]);

  // Updated fetchCategories function
  const fetchCategories = useCallback(
    async (categoryIds) => {
      if (!categoryIds || !Array.isArray(categoryIds)) {
        return [];
      }

      try {
        const categories = await Promise.all(
          categoryIds.map(async (category) => {
            // Check if category is an object with id property
            const categoryId =
              typeof category === "object" ? category.id : category;

            const categoryRef = doc(db, "categories", categoryId);
            const categorySnap = await getDoc(categoryRef);

            if (categorySnap.exists()) {
              return {
                id: categorySnap.id,
                ...categorySnap.data(),
              };
            }
            return null;
          })
        );
        return categories.filter((category) => category !== null);
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
    },
    [db]
  );

  // Initial data fetch - modify to load all projects at once
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const fetchedData = await fetchData();
        setData(fetchedData);

        // Fetch ALL projects at once (remove limit)
        const db = getFirestore(app);
        const projectsRef = collection(db, "projects");
        const projectsQuery = query(projectsRef, orderBy("createdAt", "desc"));
        const projectDocs = await getDocs(projectsQuery);

        const fetchedProjects = await Promise.all(
          projectDocs.docs.map(async (doc) => {
            const projectData = { id: doc.id, ...doc.data() };
            const categories = await fetchCategories(
              projectData.categories || []
            );
            return { ...projectData, categories };
          })
        );

        setAllProjects(fetchedProjects);
        setFilteredProjects(fetchedProjects);
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [fetchData, fetchCategories]);

  const fetchInfos = useCallback(async () => {
    try {
      const q = query(collection(db, "infos"), orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }, [db]);

  useEffect(() => {
    const getData = async () => {
      const fetchedData = await fetchInfos();
      setInfos(fetchedData);
    };
    getData();
  }, [fetchInfos]);

  // Add function to shuffle array
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Add this new function near the top with other utility functions
  const getImageTags = useCallback(
    async (imageUrl) => {
      const imageId = imageUrl.split("/").pop().split(".")[0]; // Extract image ID from URL
      try {
        const tagDoc = await getDoc(doc(db, "tags", imageId));
        if (tagDoc.exists()) {
          return tagDoc.data().tag.split(", ");
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
      return [];
    },
    [db]
  );

  // Inside the filterProjects function, update the image filtering logic
  const getImageCategory = useCallback(
    async (imageUrl) => {
      const imageId = imageUrl.split("/").pop().split(".")[0];
      try {
        const categoryDoc = await getDoc(doc(db, "imagecategories", imageId));
        if (categoryDoc.exists()) {
          return categoryDoc.data().categoryId;
        }
      } catch (error) {
        console.error("Error fetching image category:", error);
      }
      return null;
    },
    [db]
  );

  // Update the filtering logic in the useEffect
  useEffect(() => {
    if (!allProjects.length) return;

    let isActive = true;

    const filterProjects = async () => {
      setIsFiltering(true);
      let filtered = [...allProjects];
      let explorerFilteredImages = [];

      try {
        // Apply category filter
        if (selectedLogoIds && selectedLogoIds.length > 0) {
          filtered = filtered.filter((project) =>
            project.categories.some((category) =>
              selectedLogoIds.includes(category.id)
            )
          );
        }

        // Apply info tags filter
        if (selectedInfos.length > 0) {
          filtered = filtered.filter((project) =>
            selectedInfos.some((info) =>
              project.infos?.some(
                (projectInfo) =>
                  projectInfo.id === info.id || projectInfo === info.id
              )
            )
          );
        }

        const lowercaseFilter = locationFilter.toLowerCase();
        const filterCategoryId = data.find(
          (category) => category.label.toLowerCase() === lowercaseFilter
        )?.id;

        // For Profile View - keep original filtering logic
        filtered = (
          await Promise.all(
            filtered.map(async (project) => {
              if (
                project.location?.toLowerCase().includes(lowercaseFilter) ||
                project.categories?.some((category) =>
                  category.label?.toLowerCase().includes(lowercaseFilter)
                ) ||
                project.infos?.some((info) =>
                  info.label?.toLowerCase().includes(lowercaseFilter)
                ) ||
                project.projectName?.toLowerCase() === lowercaseFilter
              ) {
                return project;
              }

              for (const imageUrl of project.images) {
                const imageTags = await getImageTags(imageUrl);
                if (
                  imageTags.some((tag) => tag.toLowerCase() === lowercaseFilter)
                ) {
                  return project;
                }
              }
              return null;
            })
          )
        ).filter(Boolean);

        // For Explorer View - collect matching images
        explorerFilteredImages = (
          await Promise.all(
            filtered.flatMap(async (project) => {
              const matchingImages = await Promise.all(
                project.images.map(async (imageUrl) => {
                  const imageTags = await getImageTags(imageUrl);
                  const imageCategory = await getImageCategory(imageUrl);

                  // Check if the image matches any filtering criteria
                  const matchesSearch =
                    !locationFilter || // Show all images if no search term
                    project.location?.toLowerCase().includes(lowercaseFilter) ||
                    project.projectName?.toLowerCase() === lowercaseFilter ||
                    imageTags.some(
                      (tag) => tag.toLowerCase() === lowercaseFilter
                    ) ||
                    (filterCategoryId && imageCategory === filterCategoryId);

                  const matchesCategories =
                    selectedLogoIds.length === 0 || // Show all images if no categories selected
                    selectedLogoIds.includes(imageCategory);

                  // Return the image if it matches both search and category filters
                  if (matchesSearch && matchesCategories) {
                    return {
                      image: imageUrl,
                      projectId: project.id,
                      location: project.location,
                      categories: project.categories,
                      infos: project.infos,
                    };
                  }
                  return null;
                })
              );
              return matchingImages.filter(Boolean);
            })
          )
        ).flat();

        if (isActive) {
          setFilteredProjects(filtered);
          setExplorerImages(shuffleArray(explorerFilteredImages));
        }
      } catch (error) {
        console.error("Error during filtering:", error);
      } finally {
        if (isActive) {
          setIsFiltering(false);
        }
      }
    };

    filterProjects();

    return () => {
      isActive = false;
    };
  }, [
    data,
    selectedLogoIds,
    locationFilter,
    selectedInfos,
    allProjects,
    getImageTags,
    getImageCategory,
  ]);

  // Modify handleScroll to only handle the "back to top" button
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    setShowTopButton(scrollTop > 500);
  }, []);

  const handleOpenEditProfile = () => {
    setIsEditProfileOpen(true);
  };

  const handleOpenProjectsModal = () => {
    setIsProjectsModalOpen(true);
  };

  const handleCloseEditProfile = () => {
    setIsEditProfileOpen(false);
    // fetchProject()
  };

  const handleCloseProjectsModal = () => {
    setIsProjectsModalOpen(false);
  };

  const handleProjectRequest = (projectID) => {
    navigate(`/projectrequest/${projectID}`);
  };

  // Add scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Add scroll listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleOpenPricingModal = () => {
    setIsPricingModalOpen(true);
  };

  const handleClosePricingModal = () => {
    window.localStorage.removeItem("registered");
    setPriceModal(0);
    setIsPricingModalOpen(false);
  };

  // Add a reset filters function
  const resetFilters = () => {
    setSelectedLogoIds([]);
    setSelectedInfos([]);
    setLocationFilter("");
    setFilteredProjects(allProjects);
  };

  const handleSearchClick = () => {
    setIsSearchModalOpen(true);
  };

  const handleCloseSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  // Update viewMode in localStorage when it changes
  useEffect(() => {
    localStorage.setItem("viewMode", viewMode);
  }, [viewMode]);

  const handleOpenAboutUs = () => {
    setIsAboutModalOpen(true);
  };

  const handleCloseAboutModal = () => {
    setIsAboutModalOpen(false);
  };

  // Update navigation handler functions
  const handleFilterClick = () => {
    setShowMenuSubmenu(false);
    setShowProfileSubmenu(false);
    setIsFilterModalOpen(true);
  };

  const handleMenuClick = () => {
    setShowMenuSubmenu(!showMenuSubmenu);
    setShowProfileSubmenu(false);
  };

  const handleCloseFilter = () => {
    setIsFilterModalOpen(false);
  };

  // Update the FilterModal component
  const FilterModal = ({ onClose }) => {
    const [localLocationFilter, setLocalLocationFilter] =
      useState(locationFilter);
    const [localSelectedInfos, setLocalSelectedInfos] = useState(selectedInfos);
    const [localSelectedLogoIds, setLocalSelectedLogoIds] =
      useState(selectedLogoIds);

    // Update location filter locally only
    const handleLocationChange = (e) => {
      const newValue = e.target.value;
      setLocalLocationFilter(newValue);
    };

    // Handle info selection locally only
    const handleLocalInfoClick = (info) => {
      const isSelected = localSelectedInfos.some((i) => i.id === info.id);
      if (isSelected) {
        setLocalSelectedInfos((prev) => prev.filter((i) => i.id !== info.id));
      } else {
        setLocalSelectedInfos((prev) => [...prev, info]);
      }
    };

    const handleLocalLogoClick = (id) => {
      setLocalSelectedLogoIds((prevSelected) => {
        if (prevSelected.includes(id)) {
          return prevSelected.filter((logoId) => logoId !== id);
        } else {
          return [...prevSelected, id];
        }
      });
    };

    const handleApplyFilters = () => {
      setLocationFilter(localLocationFilter);
      setSelectedInfos(localSelectedInfos);
      setSelectedLogoIds(localSelectedLogoIds);
      onClose();
    };

    return (
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-3xl w-[80%] md:max-w-[50%] mx-auto p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Location Search */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="LOCATION"
                // autoFocus
                value={localLocationFilter}
                onChange={handleLocationChange}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 text-gray-900 border-0 focus:ring-0 focus:outline-none text-sm"
              />
            </div>
          </div>
          <h1 className="text-sm text-black mb-4 text-start">Categories</h1>
          <div
            id="categories-container"
            className="flex flex-wrap items-center w-full gap-2 mb-4"
          >
            {data &&
              data.map((category, index) => (
                <button
                  key={index}
                  onClick={() => handleLocalLogoClick(category.id)}
                  className={`px-2 py-1 rounded-full border text-xs transition-colors ${
                    localSelectedLogoIds.includes(category.id)
                      ? "border-black bg-black text-white"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {category.label}
                </button>
              ))}
          </div>
          <h1 className="text-sm text-black mb-4 text-start">More Info</h1>
          {/* Tags/Categories */}
          <div className="flex flex-wrap gap-2 mb-4">
            {infos.map((info) => (
              <button
                key={info.id}
                onClick={() => handleLocalInfoClick(info)}
                className={`px-2 py-1 rounded-full border text-xs transition-colors
                  ${
                    localSelectedInfos.some((i) => i.id === info.id)
                      ? "border-black bg-black text-white"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
              >
                {info.label}
              </button>
            ))}
          </div>

          {/* Apply button */}
          <button
            onClick={handleApplyFilters}
            className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Apply Filters
          </button>
        </div>
      </div>
    );
  };

  // Add these handler functions before the return statement
  const handleHomeClick = () => {
    setSelectedInfos([]);
    setIsFilterModalOpen(false);
    resetFilters();
    setShowMenuSubmenu(false);
    setShowProfileSubmenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProfileClick = () => {
    setShowProfileSubmenu(!showProfileSubmenu);
    setShowMenuSubmenu(false);
  };

  return (
    <>
      <Banner />
      <div className="w-full md:px-6 py-5">
        <div className="container mx-auto">
          <Header
            avatarUrl={avatarUrl}
            setAvatarUrl={setAvatarUrl}
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
            handleOpenPricingModal={handleOpenPricingModal}
            handleOpenEditProfile={handleOpenEditProfile}
            handleOpenProjectsModal={handleOpenProjectsModal}
            viewMode={viewMode}
            setViewMode={setViewMode}
            handleOpenAboutUs={handleOpenAboutUs}
            handleFilterClick={handleFilterClick}
            handleHomeClick={handleHomeClick}
          />
        </div>
        <div className="overflow-y-scroll no-scrollbar">
          <div className="container mx-auto px-4 pb-4 md:py-8">
            {!loading || (loading && filteredProjects.length > 0) ? (
              isFiltering ? (
                <div className="text-gray-800 flex justify-center items-center min-h-[55vh]">
                  <img
                    src={loading_gif}
                    className="w-[300px] h-auto"
                    alt="loading"
                  />
                </div>
              ) : filteredProjects.length > 0 ? (
                viewMode === "Profile" ? (
                  <ProfileView
                    projects={filteredProjects}
                    isMobile={isMobile}
                    onProjectClick={handleProjectRequest}
                  />
                ) : (
                  <ExplorerView
                    images={explorerImages}
                    onProjectClick={handleProjectRequest}
                  />
                )
              ) : (
                <div className="flex justify-center items-center min-h-[55vh]">
                  <div className="text-2xl">No Projects</div>
                </div>
              )
            ) : (
              <div className="text-gray-800 flex justify-center items-center">
                <img
                  src={loading_gif}
                  className="w-[300px] h-auto"
                  alt="loading"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex w-full flex-col pt-5 border-t-2 container mx-auto">
          <div className="flex w-full justify-between mb-10">
            <div className="flex items-center">
              <img
                src={logoImage}
                className="w-[180px] h-auto cursor-pointer"
                onClick={handleHomeClick}
                alt="logo"
              />
            </div>
            <div className="flex md:mr-10 md:flex-row flex-col gap-5 md:gap-8">
              <div className="flex flex-col md:items-start items-end">
                <div className="mb-5 text-gray-900 hover:text-gray-500 cursor-pointer">
                  FAQ
                </div>
                <div className="text-gray-900 hover:text-gray-500 cursor-pointer">
                  Contact
                </div>
              </div>
              <div className="flex flex-col md:items-start items-end">
                <div className="mb-5 text-gray-900 hover:text-gray-500 cursor-pointer">
                  Privacy Policy
                </div>
                <div className="text-gray-900 hover:text-gray-500 cursor-pointer">
                  Terms & Conditions
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between md:flex-row flex-col text-black">
            <div className="">© 2025 ShutterGuide. All Rights Reserved.</div>
            <div className="flex gap-5 md:mx-0 mx-auto mt-4 md:mb-4 mb-16">
              <div className="text-gray-900 hover:text-gray-500 text-center">
                <svg
                  className="w-4 h-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 8 19"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <div className="text-gray-900 hover:text-gray-500 text-center">
                <svg
                  className="w-4 h-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 21 16"
                >
                  <path d="M16.942 1.556a16.3 16.3 0 0 0-4.126-1.3 12.04 12.04 0 0 0-.529 1.1 15.175 15.175 0 0 0-4.573 0 11.585 11.585 0 0 0-.535-1.1 16.274 16.274 0 0 0-4.129 1.3A17.392 17.392 0 0 0 .182 13.218a15.785 15.785 0 0 0 4.963 2.521c.41-.564.773-1.16 1.084-1.785a10.63 10.63 0 0 1-1.706-.83c.143-.106.283-.217.418-.33a11.664 11.664 0 0 0 10.118 0c.137.113.277.224.418.33-.544.328-1.116.606-1.71.832a12.52 12.52 0 0 0 1.084 1.785 16.46 16.46 0 0 0 5.064-2.595 17.286 17.286 0 0 0-2.973-11.59ZM6.678 10.813a1.941 1.941 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.919 1.919 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Zm6.644 0a1.94 1.94 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.918 1.918 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Z"></path>
                </svg>
              </div>
              <div className="text-gray-900 hover:text-gray-500 text-center">
                <svg
                  className="w-4 h-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 17"
                >
                  <path
                    fillRule="evenodd"
                    d="M20 1.892a8.178 8.178 0 0 1-2.355.635 4.074 4.074 0 0 0 1.8-2.235 8.344 8.344 0 0 1-2.605.98A4.13 4.13 0 0 0 13.85 0a4.068 4.068 0 0 0-4.1 4.038 4 4 0 0 0 .105.919A11.705 11.705 0 0 1 1.4.734a4.006 4.006 0 0 0 1.268 5.392 4.165 4.165 0 0 1-1.859-.5v.05A4.057 4.057 0 0 0 4.1 9.635a4.19 4.19 0 0 1-1.856.07 4.108 4.108 0 0 0 3.831 2.807A8.36 8.36 0 0 1 0 14.184 11.732 11.732 0 0 0 6.291 16 11.502 11.502 0 0 0 17.964 4.5c0-.177 0-.35-.012-.523A8.143 8.143 0 0 0 20 1.892Z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <div className="text-gray-900 hover:text-gray-500 text-center">
                <svg
                  className="w-4 h-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <div className="text-gray-900 hover:text-gray-500 text-center">
                <svg
                  className="w-4 h-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 0a10 10 0 1 0 10 10A10.009 10.009 0 0 0 10 0Zm6.613 4.614a8.523 8.523 0 0 1 1.93 5.32 20.094 20.094 0 0 0-5.949-.274c-.059-.149-.122-.292-.184-.441a23.879 23.879 0 0 0-.566-1.239 11.41 11.41 0 0 0 4.769-3.366ZM8 1.707a8.821 8.821 0 0 1 2-.238 8.5 8.5 0 0 1 5.664 2.152 9.608 9.608 0 0 1-4.476 3.087A45.758 45.758 0 0 0 8 1.707ZM1.642 8.262a8.57 8.57 0 0 1 4.73-5.981A53.998 53.998 0 0 1 9.54 7.222a32.078 32.078 0 0 1-7.9 1.04h.002Zm2.01 7.46a8.51 8.51 0 0 1-2.2-5.707v-.262a31.64 31.64 0 0 0 8.777-1.219c.243.477.477.964.692 1.449-.114.032-.227.067-.336.1a13.569 13.569 0 0 0-6.942 5.636l.009.003ZM10 18.556a8.508 8.508 0 0 1-5.243-1.8 11.717 11.717 0 0 1 6.7-5.332.509.509 0 0 1 .055-.02 35.65 35.65 0 0 1 1.819 6.476 8.476 8.476 0 0 1-3.331.676Zm4.772-1.462A37.232 37.232 0 0 0 13.113 11a12.513 12.513 0 0 1 5.321.364 8.56 8.56 0 0 1-3.66 5.73h-.002Z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        {/* Add About Modal */}
        {isAboutModalOpen && <AboutModal onClose={handleCloseAboutModal} />}
        {/* Edit Profile Modal */}
        {isEditProfileOpen && (
          <EditProfileModal
            setAvatarUrl={setAvatarUrl}
            onClose={handleCloseEditProfile}
            categories={data}
          />
        )}

        {isProjectsModalOpen && (
          <ProjectsModal onClose={handleCloseProjectsModal} />
        )}

        {(isPricingModalOpen || priceModal) && (
          <PricingModal
            onClose={handleClosePricingModal}
            isLogin={user ? true : false}
          />
        )}
      </div>

      {/* Add Back to Top button */}
      {showTopButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-16 right-5 bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-all duration-300 z-50"
          aria-label="Back to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}

      {/* Bottom Navigation */}
      <div className="md:hidden block fixed bottom-0 left-0 right-0 bg-black text-white h-16 z-20">
        <div className="flex justify-between items-center h-full px-8">
          <button
            onClick={handleHomeClick}
            className="flex flex-col items-center justify-center"
          >
            <img src={homeIcon} alt="Home" className="w-6 h-6" />
          </button>

          <button
            onClick={handleFilterClick}
            className="flex flex-col items-center justify-center"
          >
            <img src={filterIcon} alt="Filter" className="w-6 h-6" />
          </button>

          <button
            onClick={handleSearchClick}
            className="flex flex-col items-center justify-center"
          >
            <img src={searchIcon} alt="Search" className="w-6 h-6" />
          </button>

          <div className="relative">
            {showMenuSubmenu && (
              <div className="absolute bottom-11 right-0 bg-white rounded-lg shadow-lg overflow-hidden w-36">
                <button
                  onClick={() => {
                    setViewMode(
                      viewMode === "Explorer" ? "Profile" : "Explorer"
                    );
                    setShowMenuSubmenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-black hover:bg-gray-100 text-sm"
                >
                  {viewMode === "Explorer" ? "Profile View" : "Explorer View"}
                </button>
                <button
                  onClick={() => {
                    handleOpenAboutUs();
                    setShowMenuSubmenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-black hover:bg-gray-100 text-sm"
                >
                  About Us
                </button>
                <button
                  onClick={() => {
                    handleOpenPricingModal();
                    setShowMenuSubmenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-black hover:bg-gray-100 text-sm"
                >
                  Pricing
                </button>
              </div>
            )}
            <button
              onClick={handleMenuClick}
              className="flex flex-col items-center justify-center"
            >
              <img src={menuIcon} alt="Menu" className="w-6 h-6" />
            </button>
          </div>

          <div className="relative">
            {showProfileSubmenu && (
              <div className="absolute bottom-11 right-0 bg-white rounded-lg shadow-lg overflow-hidden w-36">
                {user ? (
                  <>
                    <button
                      onClick={() => {
                        handleOpenEditProfile();
                        setShowProfileSubmenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-black hover:bg-gray-100 text-sm"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        handleOpenProjectsModal();
                        setShowProfileSubmenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-black hover:bg-gray-100 text-sm"
                    >
                      Projects
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowProfileSubmenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-black hover:bg-gray-100 text-sm"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        navigate("/login");
                        setShowProfileSubmenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-black hover:bg-gray-100 text-sm"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        navigate("/register");
                        setShowProfileSubmenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-black hover:bg-gray-100 text-sm"
                    >
                      Register
                    </button>
                  </>
                )}
              </div>
            )}
            <button
              onClick={handleProfileClick}
              className="flex flex-col items-center justify-center"
            >
              <img src={profileIcon} alt="Profile" className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && <FilterModal onClose={handleCloseFilter} />}
      {isSearchModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center px-4 py-8"
          onClick={handleCloseSearchModal}
        >
          <div
            className="relative w-[90%] mt-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search"
              // autoFocus
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 font-bold bg-gray-100 text-gray-900 border-0 focus:ring-0 focus:outline-none text-sm rounded-full"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
