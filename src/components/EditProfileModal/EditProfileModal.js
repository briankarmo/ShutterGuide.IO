import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
  Fragment,
} from "react";
import { X, Upload } from "lucide-react";
import {
  getFirestore,
  collection,
  doc,
  // addDoc,
  setDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  updateDoc,
  // where,
} from "firebase/firestore";
import axios from "axios";
// import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AuthContext } from "../../context/UserContext";
import { toast } from "react-toastify";
// import LocationAutocomplete from './LocationAutocomplete';
import app from "../../firebase/firebase.config";
import userImage from "../../assets/img/placeholder.webp";
import { Combobox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";

const EditProfileModal = ({ setAvatarUrl, onClose, categories }) => {
  const [fullname, setFullName] = useState("");
  const [locationInfo, setLocationInfo] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedInfos, setSelectedInfos] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, subscription } = useContext(AuthContext);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [infos, setInfos] = useState([]);
  const avatarInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageTag, setImageTag] = useState("");
  const [imageTags, setImageTags] = useState({}); // Store tags for each image URL/preview
  const [imageCategories, setImageCategories] = useState({}); // Store category for each image URL
  const [temporaryTags, setTemporaryTags] = useState({});
  const [temporaryCategories, setTemporaryCategories] = useState({});

  const db = getFirestore(app);

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

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  const handleCategoryToggle = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleInfoToggle = (info) => {
    if (selectedInfos.includes(info)) {
      setSelectedInfos(selectedInfos.filter((i) => i !== info));
    } else {
      setSelectedInfos([...selectedInfos, info]);
    }
  };

  const validateImage = (file) => {
    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error(
        `Invalid file type: ${file.name}. Only JPG, PNG, GIF, and WebP are allowed.`
      );
      return false;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast.error(`File too large: ${file.name}. Maximum size is 10MB.`);
      return false;
    }

    return true;
  };

  const handleGalleryUpload = (files) => {
    const validFiles = Array.from(files).filter((file) => {
      // Validate file type and size
      if (!validateImage(file)) return false;

      // Check for duplicates by comparing file properties
      const isDuplicate = galleryImages.some((existingImage) => {
        if (typeof existingImage === "string") {
          // For existing URLs (from Cloudinary)
          return false; // Can't check duplicates for URLs
        }
        return (
          existingImage.name === file.name &&
          existingImage.size === file.size &&
          existingImage.type === file.type
        );
      });

      if (isDuplicate) {
        toast.warning(`Duplicate file: ${file.name}`);
        return false;
      }

      return true;
    });

    // Check total number of images
    if (galleryImages.length + validFiles.length > 30) {
      toast.error("Maximum 30 images allowed");
      return;
    }

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setGalleryImages((prev) => [
          ...prev,
          {
            preview: e.target.result,
            file: file,
            name: file.name,
            size: file.size,
            type: file.type,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleGalleryUpload(e.dataTransfer.files);
  };

  const validateForm = () => {
    if (!subscription.isActive) {
      return "You need subscription to save profile.";
    }
    if (selectedInfos.length === 0) {
      return "Choose more infos.";
    }
    if (!fullname || !description || !locationInfo) {
      return "All fields are required.";
    }
    if (selectedCategories.length === 0) {
      return "Choose categories.";
    }
    if (galleryImages.length === 0) {
      return "Please upload images.";
    }
    return "";
  };

  const handleAvatarUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const db = getFirestore(app);

      const validationError = validateForm();
      if (validationError) {
        toast.error(validationError);
        return;
      }

      // Upload avatar if there's a new preview AND it's different from the current photoURL
      let avatarUploadUrl = null;
      if (avatarPreview && avatarPreview !== user?.photoURL && !avatarPreview.startsWith('http')) {
        const avatarFile = await fetch(avatarPreview).then((r) => r.blob());
        const formData = new FormData();
        formData.append("file", avatarFile);
        formData.append("upload_preset", "shutter_image");

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/dehvquvwv/image/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (!response.data || !response.data.secure_url) {
          throw new Error("Invalid response from Cloudinary");
        }

        avatarUploadUrl = response.data.secure_url;
        setAvatarUrl(avatarUploadUrl);

        // Update user document with new avatar
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        await updateDoc(userRef, {
          ...userData,
          photoURL: avatarUploadUrl,
        });
      }

      const profileRef = doc(db, "profiles", user.uid);
      const profileSnap = await getDoc(profileRef);
      const isNewProfile = !profileSnap.exists();

      // Modify gallery images upload to only upload new images
      const imageUrls = await Promise.all(
        galleryImages.map(async (image) => {
          // If image is already a URL (existing Cloudinary image), return it as-is
          if (typeof image === "string") {
            return image;
          }

          // Only upload new images (those with preview and file)
          if (image.preview && image.file) {
            const formData = new FormData();
            formData.append("file", image.file);
            formData.append("upload_preset", "shutter_image");

            try {
              const response = await axios.post(
                `https://api.cloudinary.com/v1_1/dehvquvwv/image/upload`,
                formData,
                {
                  headers: { "Content-Type": "multipart/form-data" },
                }
              );

              if (!response.data || !response.data.secure_url) {
                throw new Error("Invalid response from Cloudinary");
              }

              return response.data.secure_url;
            } catch (error) {
              console.error(`Error uploading ${image.name}:`, error);
              toast.error(`Failed to upload ${image.name}`);
              throw error;
            }
          }
          return null;
        })
      );

      const timestamp = serverTimestamp();

      // Filter out any failed uploads
      const successfulUploads = imageUrls.filter((url) => url);

      // Create references to the selected categories
      const selectedCategoryRefs = selectedCategories.map((item) =>
        doc(db, "categories", item)
      );

      const selectedInfoRefs = selectedInfos.map((item) =>
        doc(db, "infos", item)
      );

      const baseData = {
        userId: user.uid,
        location: locationInfo,
        description,
        categories: selectedCategoryRefs,
        infos: selectedInfoRefs,
        images: successfulUploads,
        updatedAt: timestamp,
      };

      const profileData = {
        ...baseData,
        fullname,
      };

      if (isNewProfile) {
        profileData.createdAt = timestamp;
      }

      await setDoc(profileRef, profileData, { merge: true });

      const projectRef = doc(db, "projects", user.uid);

      await setDoc(projectRef, {
        ...baseData,
        projectName: fullname,
        updatedAt: timestamp,
        ...(isNewProfile && { createdAt: timestamp })
      }, { merge: true });

      // When saving tags and categories for images
      for (let i = 0; i < galleryImages.length; i++) {
        const image = galleryImages[i];
        let imageUrl;
        let imageId;

        if (typeof image === 'string') {
          // Existing image
          imageUrl = image;
          imageId = getImageIdFromUrl(imageUrl);
        } else {
          // New image
          imageUrl = successfulUploads[i];
          imageId = getImageIdFromUrl(imageUrl);
          
          // Only save tags and categories for new images
          if (imageId) {
            const preview = image.preview;
            
            // Save tags
            const tags = temporaryTags[preview];
            if (tags && tags.length > 0) {
              await setDoc(doc(db, "tags", imageId), {
                tag: tags.join(", "),
              });
            }

            // Save category
            const categoryId = temporaryCategories[preview];
            if (categoryId) {
              await setDoc(doc(db, "imagecategories", imageId), {
                categoryId: categoryId,
              });
            }
          }
        }
      }

      toast.success("Profile and project updated successfully");
      onClose();
    } catch (error) {
      toast.error("Error: " + error.message);
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const db = getFirestore(app);
    const getUserProfile = async (user, db) => {
      const profileDocRef = doc(db, "profiles", user.uid);
      const profileDoc = await getDoc(profileDocRef);
      const profile = profileDoc.data();

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      const userInfo = userDoc.data();

      // Set avatar URL from user document
      if (userInfo?.photoURL) {
        setAvatarUrl(userInfo.photoURL);
      }

      if (profileDoc.exists()) {
        setFullName(profile.fullname);
        setLocationInfo(profile.location);
        setDescription(profile.description);
        setGalleryImages(profile.images);
        setAvatarPreview(userInfo?.photoURL || null);

        const categoryIds = profile.categories || [];
        const infoIds = profile.infos || [];
        const fetchedCategories = [];
        const fetchedInfos = [];

        // Fetch each category
        for (const categoryId of categoryIds) {
          fetchedCategories.push(categoryId.id);
        }

        for (const infoId of infoIds) {
          fetchedInfos.push(infoId.id);
        }

        setSelectedCategories(fetchedCategories);
        setSelectedInfos(fetchedInfos);
      } else {
        setFullName(userInfo.name);
        setAvatarPreview(userInfo?.photoURL || null);
        return null;
      }
    };

    if (user) {
      getUserProfile(user, db);
    }
  }, [user, setAvatarUrl]);

  const handleRemoveGalleryImage = (indexToRemove) => {
    setGalleryImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  // Modify handleImageClick to include temporary categories
  const handleImageClick = async (image) => {
    const imageUrl = typeof image === "string" ? image : image.preview;
    setSelectedImage(imageUrl);

    if (typeof image === "string") {
      // Existing image (URL)
      const imageId = getImageIdFromUrl(imageUrl);
      if (imageId) {
        const tags = await fetchImageTags(imageId);
        setImageTags((prev) => ({
          ...prev,
          [imageUrl]: tags,
        }));

        try {
          const categoryDoc = await getDoc(doc(db, "imagecategories", imageId));
          if (categoryDoc.exists()) {
            setImageCategories((prev) => ({
              ...prev,
              [imageUrl]: categoryDoc.data().categoryId,
            }));
          }
        } catch (error) {
          console.error("Error fetching image category:", error);
        }
      }
    } else {
      // New image (preview)
      // Use temporary tags if they exist
      if (!imageTags[imageUrl] && temporaryTags[imageUrl]) {
        setImageTags((prev) => ({
          ...prev,
          [imageUrl]: temporaryTags[imageUrl],
        }));
      }
      // Use temporary categories if they exist
      if (!imageCategories[imageUrl] && temporaryCategories[imageUrl]) {
        setImageCategories((prev) => ({
          ...prev,
          [imageUrl]: temporaryCategories[imageUrl],
        }));
      }
    }
  };

  // Modify handleTagSubmit to work with both new and existing images
  const handleTagSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage || !imageTag.trim()) return;

    const newTag = imageTag.trim();
    const currentTags = imageTags[selectedImage] || [];

    if (currentTags.length >= 10) {
      toast.warning("Maximum 10 tags allowed per image");
      return;
    }
    if (currentTags.includes(newTag)) {
      toast.warning("Tag already exists");
      return;
    }

    const newTags = [...currentTags, newTag];

    if (selectedImage.startsWith('data:')) {
      // New image (preview)
      setTemporaryTags((prev) => ({
        ...prev,
        [selectedImage]: newTags,
      }));
      setImageTags((prev) => ({
        ...prev,
        [selectedImage]: newTags,
      }));
    } else {
      // Existing image (URL)
      const imageId = getImageIdFromUrl(selectedImage);
      if (!imageId) return;

      try {
        await setDoc(doc(db, "tags", imageId), {
          tag: newTags.join(", "),
        });
      } catch (error) {
        console.error("Error saving tag:", error);
        toast.error("Failed to save tag");
        return;
      }
    }

    setImageTags((prev) => ({
      ...prev,
      [selectedImage]: newTags,
    }));
    setImageTag("");
  };

  const removeTag = async (tag) => {
    if (!selectedImage) return;

    const imageId = getImageIdFromUrl(selectedImage);
    if (!imageId) return;

    try {
      const newTags = (imageTags[selectedImage] || []).filter((t) => t !== tag);

      // Update Firebase
      await setDoc(doc(db, "tags", imageId), {
        tag: newTags.join(", "),
      });

      // Update local state
      setImageTags((prev) => ({
        ...prev,
        [selectedImage]: newTags,
      }));
    } catch (error) {
      console.error("Error removing tag:", error);
      toast.error("Failed to remove tag");
    }
  };

  // Add this function to extract image ID from Cloudinary URL
  const getImageIdFromUrl = (url) => {
    const matches = url.match(/\/v\d+\/([^/]+)\.[^.]+$/);
    return matches ? matches[1] : null;
  };

  // Add this function to fetch tags from Firebase
  const fetchImageTags = async (imageId) => {
    try {
      const tagDoc = await getDoc(doc(db, "tags", imageId));
      console.log("Tag Doc =============> ", tagDoc);
      if (tagDoc.exists()) {
        return tagDoc.data().tag.split(", ");
      }
      return [];
    } catch (error) {
      console.error("Error fetching tags:", error);
      return [];
    }
  };

  // Modify handleImageCategoryChange to work with both new and existing images
  const handleImageCategoryChange = async (imageUrl, categoryId) => {
    try {
      if (imageUrl.startsWith('data:')) {
        // New image (preview)
        setTemporaryCategories((prev) => ({
          ...prev,
          [imageUrl]: categoryId,
        }));
        setImageCategories((prev) => ({
          ...prev,
          [imageUrl]: categoryId,
        }));
      } else {
        // Existing image (URL)
        const imageId = getImageIdFromUrl(imageUrl);
        if (!imageId) return;

        // Update Firebase
        await setDoc(doc(db, "imagecategories", imageId), {
          categoryId: categoryId,
        });

        // Update local state
        setImageCategories((prev) => ({
          ...prev,
          [imageUrl]: categoryId,
        }));
      }
    } catch (error) {
      console.error("Error saving image category:", error);
      toast.error("Failed to save category");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex z-30 items-start justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        // Only close if clicking the overlay background
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg w-full md:w-[70%] my-8 h-[90%] overflow-y-scroll no-scrollbar">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-30">
          <h2 className="text-xl font-semibold text-black">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full text-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar Upload */}
        <div className="p-3 flex flex-col space-y-6 items-center">
          <div className="relative">
            <img
              src={avatarPreview || user?.photoURL || userImage}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover"
            />
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-gray-900 rounded-full p-1 text-white hover:bg-gray-700"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={avatarInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleAvatarUpload(e.target.files[0])}
            />
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Name */}
          {
            <div>
              <label className="block text-left text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                placeholder="Your name"
                value={fullname}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
              />
            </div>
          }

          {/* Location */}
          <div>
            <label className="block text-left text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            {/* <LocationAutocomplete initialLocation={initialLocation} setLocationInfo={setLocationInfo} /> */}
            <input
              type="text"
              placeholder="Enter city, state or country"
              value={locationInfo}
              onChange={(e) => setLocationInfo(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
            />
          </div>

          {/* Decription */}
          <div>
            <label className="block text-left text-sm font-medium text-gray-700 mb-2">
              Decription
            </label>
            <textarea
              placeholder="Tell us about yourself and your project"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
            />
          </div>

          {/* More Info */}
          <div>
            <label className="block text-left text-sm font-medium text-gray-700 mb-2">
              More Info
            </label>
            <div className="flex flex-wrap gap-2">
              {infos.map((info, index) => (
                <button
                  key={index}
                  onClick={() => handleInfoToggle(info.id)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    selectedInfos.includes(info.id)
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {info.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-left text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => handleCategoryToggle(category.id)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    selectedCategories.includes(category.id)
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Gallery Upload */}
          <div>
            <label className="block text-left text-sm font-medium text-gray-700 mb-2">
              Gallery
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
                isDragging ? "border-gray-400 bg-gray-50" : "border-gray-200"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={(e) => handleGalleryUpload(e.target.files)}
              />
              <div className="text-center text-sm sm:text-md">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>

            {/* Gallery Preview */}
            {galleryImages.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative group h-32 cursor-move"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", index);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const dragIndex = parseInt(
                        e.dataTransfer.getData("text/plain")
                      );
                      const dropIndex = index;

                      if (dragIndex === dropIndex) return;

                      const newGalleryImages = [...galleryImages];
                      const draggedImage = newGalleryImages[dragIndex];
                      newGalleryImages.splice(dragIndex, 1);
                      newGalleryImages.splice(dropIndex, 0, draggedImage);

                      setGalleryImages(newGalleryImages);
                    }}
                  >
                    <img
                      src={typeof image === "string" ? image : image.preview}
                      alt={
                        typeof image === "string"
                          ? `Gallery ${index + 1}`
                          : image.name
                      }
                      className="w-full h-32 object-cover rounded-lg cursor-pointer"
                      onClick={() => handleImageClick(image)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {typeof image === "string"
                        ? "Uploaded"
                        : `${(image.size / (1024 * 1024)).toFixed(2)}MB`}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(index)}
                      className="absolute top-1 right-1 p-1 bg-white rounded-full 
                        opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={handleSubmit}
            className="w-full bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            {isLoading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>

      {/* Full-screen image viewer */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-gray-800 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-h-[80vh] max-w-[90vw]">
            <img
              src={selectedImage}
              alt="Full screen view"
              className="max-h-[80vh] max-w-[90vw] md:min-w-[800px] min-w-[300px] object-contain"
            />

            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 p-4 w-full">
              {/* Add category selector */}
              <div className="mb-4 relative">
                <Combobox
                  value={imageCategories[selectedImage] || ""}
                  onChange={(value) =>
                    handleImageCategoryChange(selectedImage, value)
                  }
                >
                  <div className="relative">
                    <Combobox.Button className="relative w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-left">
                      <span className="block truncate">
                        {categories.find(
                          (cat) => cat.id === imageCategories[selectedImage]
                        )?.label || "Select a category"}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </span>
                    </Combobox.Button>

                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Combobox.Options className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {categories.map((category) => (
                          <Combobox.Option
                            key={category.id}
                            value={category.id}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-2 px-4 ${
                                active
                                  ? "bg-gray-700 text-white"
                                  : "text-gray-300"
                              }`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={`block truncate ${
                                    selected ? "font-medium" : "font-normal"
                                  }`}
                                >
                                  {category.label}
                                </span>
                              </>
                            )}
                          </Combobox.Option>
                        ))}
                      </Combobox.Options>
                    </Transition>
                  </div>
                </Combobox>
              </div>

              {/* Existing tag input and display */}
              <form onSubmit={handleTagSubmit} className="flex mb-2">
                <input
                  type="text"
                  value={imageTag}
                  onChange={(e) => setImageTag(e.target.value)}
                  placeholder="Add a tag (press Enter)"
                  className="flex-1 px-3 py-2 w-full rounded-lg bg-gray-800 text-white border border-gray-700"
                  maxLength={30}
                />
              </form>

              <div className="flex flex-wrap gap-2">
                {imageTags[selectedImage]?.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfileModal;