import React, { useState, useEffect, useCallback } from "react";
import { MapPin } from "lucide-react";
import { getFirestore, getDoc, doc } from "firebase/firestore";
import app from "../../firebase/firebase.config";

const MasonryLayout = ({ currentProject, categories }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageTags, setImageTags] = useState([]);
  const [imageCategory, setImageCategory] = useState(null);

  const getImageIdFromUrl = (url) => {
    const matches = url.match(/\/v\d+\/([^/]+)\.[^.]+$/);
    return matches ? matches[1] : null;
  };

  const db = getFirestore(app);

  const fetchImageTags = useCallback(
    async (imageUrl) => {
      const imageId = getImageIdFromUrl(imageUrl);
      if (!imageId) return;

      try {
        const tagDoc = await getDoc(doc(db, "tags", imageId));
        if (tagDoc.exists()) {
          const tags = tagDoc.data().tag.split(", ");
          setImageTags(tags);
        } else {
          setImageTags([]);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
        setImageTags([]);
      }
    },
    [db]
  );

  const getImageCategoryName = useCallback(
    async (imageUrl) => {
      const imageId = imageUrl.split("/").pop().split(".")[0];
      try {
        const categoryDoc = await getDoc(doc(db, "imagecategories", imageId));
        if (categoryDoc.exists()) {
          let categoryId = categoryDoc.data().categoryId;
          let categoryName = categories.find(
            (category) => category.id === categoryId
          )?.label;
          console.log("categoryName ==========> ", categoryName);
          return categoryName;
        }
      } catch (error) {
        console.error("Error fetching image category:", error);
      }
      return null;
    },
    [db, categories]
  );

  useEffect(() => {
    if (selectedImage) {
      fetchImageTags(selectedImage);
      getImageCategoryName(selectedImage).then((category) => {
        setImageCategory(category);
      });
    } else {
      setImageTags([]);
      setImageCategory(null);
    }
  }, [fetchImageTags, getImageCategoryName, selectedImage]);

  return (
    <>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column - Sticky Project Info */}
        <div className="w-full md:w-1/3 space-y-6 md:sticky top-20 md:h-screen overflow-y-auto">
          <h1 className="text-2xl font-bold text-left text-black">
            {currentProject.projectName}
          </h1>

          <div className="flex items-center text-black">
            <MapPin className="w-4 h-4 mr-1" />
            {currentProject.location}
          </div>

          <div className="text-lg text-left text-gray-900">
            {categories.map((category) => category.label).join(". ")}
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl text-left font-semibold text-black">
              About
            </h3>
            <div className="text-xl text-left text-gray-900">
              {currentProject.description}
            </div>
          </div>
        </div>

        {/* Right Column - Masonry Layout */}
        <div className="w-full md:w-2/3">
          <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
            {currentProject.images?.map((image, index) => (
              <div
                key={index}
                className="break-inside-avoid relative group hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image}
                  alt="project"
                  className="w-full h-auto object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full-screen Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <div className="flex flex-col items-center">
            <img
              src={selectedImage}
              alt="project fullscreen"
              className="max-h-[80vh] max-w-screen-xl object-contain px-4 py-2"
            />
            <div className="text-lg text-left text-white mb-2">
              {imageCategory}
            </div>
            {imageTags.length > 0 && (
              <div className="flex flex-wrap gap-2 w-screen justify-center px-4">
                {imageTags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-black px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MasonryLayout;
