import React, { useState, useEffect } from "react";
import app from "../../firebase/firebase.config";
import { ArrowLeft, MapPin } from "lucide-react";
import {
  getFirestore,
  collection,
  setDoc,
  getDoc,
  doc,
} from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/UserContext";
import { toast } from "react-toastify";
import userImage from "../../assets/img/placeholder.webp";
import ImageSlider from "./ImageSlide";
import PhotosLayout from "./PhotosLayout";
import MasonryLayout from "./MasonryLayout";
import { useContext } from "react";

// Main Profile Component
const ProjectRequest = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { projectId } = useParams();
  const [currentProject, setCurrentProject] = useState({});
  const [author, setAuthor] = useState({});
  const [categories, setCategories] = useState([]);
  const [infos, setInfos] = useState([]);
  const [isImageModal, setIsImageModal] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  const [orderName, setOrderName] = useState("");
  const [orderEmail, setOrderEmail] = useState("");
  const [orderBudget, setOrderBudget] = useState("");
  const [orderDesc, setOrderDesc] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { user } = useContext(AuthContext);

  // Add new state for modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBack = () => {
    navigate("/");
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const db = getFirestore(app);
        const projectDoc = await getDoc(doc(db, "projects", projectId)); // Use projectId directly

        if (projectDoc.exists()) {
          const projectData = projectDoc.data();
          setCurrentProject(projectData);

          // Fetch categories
          const categoryIds = projectData.categories || [];
          const infoIds = projectData.infos || [];

          const fetchedCategories = await Promise.all(
            categoryIds.map(async (categoryId) => {
              const categoryDoc = await getDoc(
                doc(db, "categories", categoryId.id)
              ); // Adjust based on your structure
              return categoryDoc.exists()
                ? { id: categoryDoc.id, ...categoryDoc.data() }
                : null;
            })
          );

          const fetchedInfos = await Promise.all(
            infoIds.map(async (infoId) => {
              const infoDoc = await getDoc(doc(db, "infos", infoId.id));
              return infoDoc.exists()
                ? { id: infoDoc.id, ...infoDoc.data() }
                : null;
            })
          );

          // Filter out any null values in case a category doesn't exist
          setCategories(
            fetchedCategories.filter((category) => category !== null)
          );
          setInfos(fetchedInfos.filter((info) => info !== null));

          const authorDoc = await getDoc(doc(db, "users", projectData.userId));
          setAuthor(authorDoc.data());
        } else {
          console.error("No such document!");
          setCurrentProject({});
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
      }
    };

    if (projectId) {
      // Only fetch if projectId is valid
      fetchProjectData();
    }
  }, [projectId]);

  const validateForm = () => {
    if (!user) {
      return "You need to login.";
    }

    if (!orderName || !orderEmail || !orderBudget || !orderDesc) {
      return "All fields are required.";
    }
    if (!startDate || !endDate) {
      return "Input Date Range of Project.";
    }

    return "";
  };

  // Add modal open/close handlers
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Modify handleSubmit to close modal on success
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();

      const validationError = validateForm();
      if (validationError) {
        toast.error(validationError);
        return;
      }

      const db = getFirestore(app);
      const reference = collection(db, "orders");

      const newOrderRef = doc(reference);
      const dataToStore = {
        authorId: currentProject.userId,
        projectId,
        orderName,
        orderEmail,
        orderBudget,
        orderDescription: orderDesc,
        orderStart: startDate ? startDate : null,
        orderEnd: endDate ? endDate : null,
        status: 0,
        updatedAt: new Date(),
      };

      await setDoc(newOrderRef, dataToStore);
      toast.success("Order saved successfully");
      closeModal(); // Close modal after successful submission
    } catch (error) {
      toast.error("Error: " + error.message);
      console.error("Error:", error);
    }
  };

  const handleIsImageModal = () => {
    setIsImageModal(false);
  };

  const handleShowAllPhotos = () => {
    setShowAllPhotos(true);
  };

  const handleCloseAllPhotos = () => {
    setShowAllPhotos(false);
  };

  if (showAllPhotos) {
    return (
      <div className="absolute inset-0 bg-white min-h-screen">
        <div className="p-8">
          <button
            onClick={handleCloseAllPhotos}
            className="fixed left-8 top-8 flex items-center gap-1 py-2 px-4 rounded-lg bg-white shadow-md hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="mt-16">
            {currentProject.images ? (
              <MasonryLayout
                currentProject={currentProject}
                categories={categories}
              />
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-6 max-w-7xl w-full h-full overflow-y-scroll no-scrollbar">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center text-gray-900 mb-6 hover:text-gray-500"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      {/* Profile Header */}
      <h1 className="text-2xl font-bold mb-3 text-left text-black">
        {currentProject.projectName}
      </h1>
      <div className="flex items-center mb-6 text-black">
        <MapPin className="w-4 h-4 mr-1" />
        {currentProject.location}
      </div>

      {/* Featured Image */}
      <div className="w-full">
        <div className="mb-8 flex justify-start">
          {currentProject.images &&
          currentProject.images.length > 0 &&
          author.name ? (
            <div className="w-full mx-auto">
              <PhotosLayout
                images={currentProject.images}
                onShowAllPhotos={handleShowAllPhotos}
              />
            </div>
          ) : (
            <div className="w-full h-[400px] bg-gray-200 flex items-center justify-center rounded-lg">
              <span>No Image Available</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-around">
        <div className="flex flex-col justify-center text-2xl text-gray-900">
          <div className="text-lg text-left text-gray-900 mb-6">
            {categories.map((category) => category.label).join(", ")}
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={author?.photoURL || userImage}
            alt="John Smith"
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h2 className="text-left font-semibold text-black">
              {author.name}
            </h2>
          </div>
        </div>

        {/* More Info */}
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          {infos.map((info) => {
            return (
              <div key={info.id} className="flex items-center gap-2">
                <div dangerouslySetInnerHTML={{ __html: info.svg }} />
              </div>
            );
          })}
        </div>

        {/* About Section */}
        <div className="mb-8">
          <h3 className="text-2xl text-left font-semibold mb-2 text-black">
            About
          </h3>
          <div className="text-base text-left text-gray-900 whitespace-pre-line">
            {currentProject.description &&
            currentProject.description.length > 300 ? (
              <>
                {showFullDescription ? (
                  currentProject.description
                ) : (
                  <>
                    {currentProject.description.slice(0, 300)}...
                    <button
                      onClick={() => setShowFullDescription(true)}
                      className="text-gray-600 hover:text-gray-900 ml-1 font-medium"
                    >
                      See more
                    </button>
                  </>
                )}
              </>
            ) : (
              currentProject.description
            )}
          </div>
        </div>

        {/* Updated Hire button styling and positioning */}
        <div className="mb-20 text-left">
          <button
            onClick={openModal}
          className="bg-red-500 text-white py-2 px-20 rounded-lg font-medium hover:bg-red-600 transition-colors text-base"
        >
          Hire
        </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Project Request
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Project Request Form */}
            <form className="space-y-4 w-full">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-900 mb-1 text-left">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={orderName}
                      onChange={(e) => setOrderName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 border-gray-600 text-black"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-900 mb-1 text-left">
                      Email
                    </label>
                    <input
                      type="email"
                      value={orderEmail}
                      onChange={(e) => setOrderEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 border-gray-600 text-black"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-900 mb-1 text-left">
                      Approximate Budget
                    </label>
                    <input
                      type="text"
                      value={orderBudget}
                      onChange={(e) => setOrderBudget(e.target.value)}
                      placeholder="Enter your budget"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 border-gray-600 text-black"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-900 mb-1 text-left">
                      Project Description
                    </label>
                    <textarea
                      placeholder="Describe your project"
                      value={orderDesc}
                      onChange={(e) => setOrderDesc(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 border-gray-600 text-black"
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-5 ">
                    <label className="block text-sm font-medium text-gray-900 mb-1 text-left">
                      Start Date
                    </label>
                    <input
                      type="text"
                      value={startDate}
                      placeholder="Input Start Date"
                      onChange={(e) => {
                        setStartDate(e.target.value);
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focur:ring-blue-500 border-gray-600 text-black"
                    />
                  </div>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-900 mb-1 text-left">
                      End Date
                    </label>
                    <input
                      type="text"
                      value={endDate}
                      placeholder="Input End Date"
                      onChange={(e) => {
                        setEndDate(e.target.value);
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focur:ring-blue-500 border-gray-600 text-black"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                onClick={(e) => handleSubmit(e)}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Send Project Request
              </button>
            </form>
          </div>
        </div>
      )}

      {isImageModal && (
        <ImageSlider
          onClose={handleIsImageModal}
          images={currentProject.images}
        />
      )}
    </div>
  );
};

export default ProjectRequest;
