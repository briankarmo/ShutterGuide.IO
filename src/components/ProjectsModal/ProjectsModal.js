import React, { useState, useEffect, useContext, useCallback } from "react";
import { X, ArrowLeft, Trash } from "lucide-react";
import {
  getFirestore,
  collection,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
  where,
  query,
} from "firebase/firestore";
import { AuthContext } from "../../context/UserContext";
import app from "../../firebase/firebase.config";
import loading_gif from "../../assets/img/loading.gif";
import { toast } from "react-toastify";

const ProjectsModal = ({ onClose }) => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("new");
  const [loading, setLoading] = useState(false);
  const db = getFirestore(app);
  const [selectedProject, setSelectedProject] = useState(null);

  const getOrders = useCallback(
    async (db, status) => {
      const ordersRef = collection(db, "orders");
      const ordersQuery = query(
        ordersRef,
        where("authorId", "==", user.uid),
        where("status", "==", status)
      );
      try {
        setLoading(true);
        const querySnapshot = await getDocs(ordersQuery);
        const orders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch project information for each order
        const projectPromises = orders.map(async (order) => {
          const projectRef = doc(db, "projects", order.projectId); // Reference to the projects collection
          const projectSnapshot = await getDoc(projectRef);

          // Get the project data if it exists
          const projectData = projectSnapshot.exists()
            ? {
                id: projectSnapshot.id,
                ...projectSnapshot.data(),
              }
            : null;

          return {
            ...order,
            project: projectData, // Add project data to the order
          };
        });

        // Wait for all project data to be fetched
        const ordersWithProjects = await Promise.all(projectPromises);
        setOrders(ordersWithProjects); // Set the orders with project information
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    },
    [user.uid]
  );

  const handleArchive = async (orderId) => {
    const db = getFirestore(app);
    // Update the status field in the orders collection
    const orderRef = doc(db, "orders", orderId); // Reference to the specific order document
    await updateDoc(orderRef, {
      status: 1, // Change this to the desired status
    });
    getOrders(db, 0);
  };

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

  useEffect(() => {
    const db = getFirestore(app);
    getOrders(db, 0);
  }, [getOrders]);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const handleProjectDelete = async (projectId) => {
    const modal = window.confirm(
      "Are you sure you want to delete this project?"
    );
    if (modal) {
      const db = getFirestore(app);
      const projectRef = doc(db, "orders", projectId);
      await deleteDoc(projectRef);
      if (activeTab === "new") {
        getOrders(db, 0);
      } else {
        getOrders(db, 1);
      }
      toast.success("Project deleted successfully");
    } else {
      toast.error("Project not deleted");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg w-full md:max-w-[70%] my-8 h-[80%] overflow-y-scroll no-scrollbar">
        {!selectedProject ? (
          <>
            {/* List View Header */}
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-30">
              <h2 className="text-xl md:text-2xl font-bold text-black">
                PROJECTS
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    getOrders(db, 0);
                    setActiveTab("new");
                  }}
                  className={`md:text-xl text-sm md:px-6 px-4 py-2 font-bold rounded ${
                    activeTab === "new"
                      ? "bg-black text-white"
                      : "bg-white text-black border border-black"
                  }`}
                >
                  NEW
                </button>
                <button
                  onClick={() => {
                    getOrders(db, 1);
                    setActiveTab("archive");
                  }}
                  className={`md:text-xl text-sm md:px-6 px-4 py-2 font-bold rounded ${
                    activeTab === "archive"
                      ? "bg-black text-white"
                      : "bg-white text-black border border-black"
                  }`}
                >
                  ARCHIVE
                </button>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Projects List */}
            <div className="p-6 grid gap-4">
              {!loading ? (
                orders && orders.length > 0 ? (
                  orders.map((item, index) => (
                    <div
                      key={index}
                      className="border-2 border-black rounded-lg p-4 cursor-pointer text-start"
                      onClick={() => handleProjectClick(item)}
                    >
                      <div
                        className="flex justify-between items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="font-bold text-xl mb-2 text-black">
                          {item.orderName}
                        </div>
                        <button
                          onClick={() => handleProjectDelete(item.id)}
                          className="p-1 hover:bg-gray-100 rounded-full"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="mb-2 text-black">{item.orderBudget}</div>
                      <div className="text-black font-medium">
                        {item.orderDescription?.slice(0, 200)}
                        {item.orderDescription?.length > 200 ? "..." : ""}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-900 text-center">No orders yet</div>
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
          </>
        ) : (
          // Detailed Project View
          <div className="p-6">
            {/* Back Button Header */}
            <div className="flex items-center mb-6">
              <button
                onClick={() => setSelectedProject(null)}
                className="flex items-center text-black hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="font-bold">BACK</span>
              </button>
            </div>

            {/* Project Details */}
            <div className="border-2 border-black rounded-lg p-6 text-start text-black">
              <h2 className="font-bold text-xl mb-4">
                {selectedProject.orderName}
              </h2>
              <div className="space-y-4">
                <p className="text-black">{selectedProject.orderBudget}</p>
                <p className="text-black">{selectedProject.orderEmail}</p>
                <p className="text-black whitespace-pre-wrap">
                  {selectedProject.orderDescription}
                </p>

                {/* Date inputs */}
                <div className="mt-6 space-y-3">
                  <p className="text-black">
                    <b>Start Date:</b> {selectedProject.orderStart}
                  </p>
                  <p className="text-black">
                    <b>End Date:</b> {selectedProject.orderEnd}
                  </p>
                </div>

                {/* Archive Button */}
                {activeTab === "new" && (
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => {
                        handleArchive(selectedProject.id);
                        setSelectedProject(null);
                      }}
                      className="px-6 py-2 border font-bold border-black rounded"
                    >
                      ARCHIVE
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsModal;
