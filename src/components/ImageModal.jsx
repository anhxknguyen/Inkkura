import React from "react";
import { useEffect, useRef, useState } from "react";

const ImageModal = ({ currIndex, images, onClose }) => {
  const modalRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(currIndex);

  const handleClickOutside = (event) => {
    if (
      modalRef.current &&
      !modalRef.current.contains(event.target) &&
      !event.target.classList.contains("modal-button")
    ) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to go to previous image
  const goToPreviousImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Function to go to next image
  const goToNextImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-75 cursor-default">
      <img
        ref={modalRef}
        src={images[currentIndex]}
        alt="Large Commission"
        className="max-w-full max-h-full no-select"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        className="absolute text-3xl text-white top-10 right-20"
        onClick={onClose}
      >
        &#10005;
      </button>
      {images.length > 1 && (
        <button
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={(e) => {
            goToPreviousImage();
            e.stopPropagation();
          }}
          className="absolute z-10 w-16 h-16 transform -translate-y-1/2 bg-gray-200 border rounded-full modal-button left-10 top-1/2 hover:bg-gray-300"
        >
          &lt;
        </button>
      )}

      {images.length > 1 && (
        <button
          onClick={(e) => {
            goToNextImage();
            e.stopPropagation();
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="absolute z-10 w-16 h-16 transform -translate-y-1/2 bg-gray-200 border rounded-full modal-button right-10 top-1/2 hover:bg-gray-300"
        >
          &gt;
        </button>
      )}
    </div>
  );
};

export default ImageModal;
