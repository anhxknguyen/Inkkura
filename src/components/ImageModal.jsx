import React from "react";
import { useEffect, useRef } from "react";

const ImageModal = ({ imageUrl, onClose }) => {
  const modalRef = useRef(null);

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-75">
      <img
        ref={modalRef}
        src={imageUrl}
        alt="Large Commission"
        className="max-w-full max-h-full no-select"
      />
      <button
        className="absolute text-3xl text-white top-10 right-20"
        onClick={onClose}
      >
        &#10005;
      </button>
    </div>
  );
};

export default ImageModal;
