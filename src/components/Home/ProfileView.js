import React from "react";
import PhotographerCard from "./PhotographerCard";

const ProfileView = ({ projects, isMobile, onProjectClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 min-h-[55vh]">
      {projects.map((project) => (
        <div
          key={project.id}
          className="group hover:opacity-95 transition-opacity"
        >
          <PhotographerCard
            isMobile={isMobile}
            project={project}
            onClick={() => onProjectClick(project.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default ProfileView;
