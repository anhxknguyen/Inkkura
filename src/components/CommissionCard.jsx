import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";
import { storage } from "../firebase";
import ImageModal from "./ImageModal";
import { UserAuth } from "../context/authContext";
import magnifyingGlass from "../assets/magnify.png";
import magnifyingGlassHovered from "../assets/magnify-hover.png";
import PaintbrushSVG from "../assets/PaintbrushSVG";

const CommissionCard = ({ commission }) => {
  const { user } = UserAuth();
  const title = commission.title;
  const priceRange = commission.priceRange;
  const artistUID = commission.artist;
  const [artistDisplayName, setArtistDisplayName] = useState(null);
  const [images, setImages] = useState([]);
  const thumbnail = commission.thumbnail;
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const deliveryTime = commission.deliveryTime;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMagnifyHovered, setIsMagnifyHovered] = useState(false);

  const [isImageOpen, setIsImageOpen] = useState(false);
  const navigate = useNavigate();

  const openModal = () => {
    setIsImageOpen(true);
  };

  const closeModal = () => {
    setIsImageOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const artistDoc = doc(db, "users", artistUID);
        const artistSnapshot = await getDoc(artistDoc);
        let displayName = "Unknown Artist";

        if (artistSnapshot.exists()) {
          const artistData = artistSnapshot.data();
          displayName = artistData.displayName;
        }

        setArtistDisplayName(displayName);

        const imagesRef = ref(storage, `${artistUID}/${commission.id}`);
        const imagesList = await listAll(imagesRef);
        let thumbnailTracker;

        if (imagesList.items.length > 0) {
          const allImages = await Promise.all(
            imagesList.items.map(async (fileRef) => {
              if (fileRef.name === thumbnail) {
                thumbnailTracker = await getDownloadURL(fileRef);
              }
              const url = await getDownloadURL(fileRef);
              const metadata = await getMetadata(fileRef);
              return { url, metadata };
            })
          );

          const thumbnailRef = imagesList.items.find(
            (image) => image.name === thumbnail
          );

          if (thumbnailRef) {
            const thumbnailURL = await getDownloadURL(thumbnailRef);
            setThumbnailImage(thumbnailURL);
          }

          allImages.sort((a, b) => {
            const uploadTimeA = new Date(a.metadata.timeCreated).getTime();
            const uploadTimeB = new Date(b.metadata.timeCreated).getTime();
            return uploadTimeA - uploadTimeB;
          });

          const thumbnailIndex = allImages.findIndex(
            (image) => image.url === thumbnailTracker
          );

          // Set the currentIndex to the index of the thumbnail
          if (thumbnailIndex !== -1) {
            setCurrentIndex(thumbnailIndex);
          }

          Promise.all(
            allImages.map(async (imgUrl) => {
              const response = await fetch(imgUrl.url);
              const blob = await response.blob();
              return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  resolve(reader.result);
                };
                reader.readAsDataURL(blob);
              });
            })
          ).then((base64Strings) => {
            setImages(base64Strings); // Log the base64 string of the first image
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
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
    <div
      onClick={() => navigate(`/commission/${commission.id}`)}
      className={`rounded-md hover:bg-zinc-100 grid-item hover:cursor-pointer`}
    >
      <div className="flex flex-col">
        <div
          className="relative flex flex-col w-full"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img
            className={`h-64 rounded-md m-2 ${isHovered ? "object-contain bg-zinc-300" : "object-cover hover:bg-zinc-100"} no-select hover:cursor-pointer`}
            onClick={() => openModal(images[currentIndex])}
            src={images[currentIndex]}
          />
          <img
            onMouseEnter={() => setIsMagnifyHovered(true)}
            onMouseLeave={() => setIsMagnifyHovered(false)}
            onClick={(e) => {
              openModal(images[currentIndex]);
              e.stopPropagation();
            }}
            className="absolute w-10 h-10 text-2xl top-4 right-4"
            src={isMagnifyHovered ? magnifyingGlassHovered : magnifyingGlass}
          />
          {images.length > 1 && (
            <button
              onClick={(e) => {
                goToPreviousImage();
                e.stopPropagation();
              }}
              className="absolute z-10 w-10 h-10 transform -translate-y-1/2 bg-gray-200 border rounded-full left-3 top-1/2 hover:bg-gray-300"
              style={{ display: isHovered ? "block" : "none" }}
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
              className="absolute z-10 w-10 h-10 transform -translate-y-1/2 bg-gray-200 border rounded-full right-3 top-1/2 hover:bg-gray-300"
              style={{ display: isHovered ? "block" : "none" }}
            >
              &gt;
            </button>
          )}
        </div>
        <div></div>
        <div className="px-2 pb-2">
          <div className="flex items-center justify-between text-sm">
            <div>{artistDisplayName}</div>
            <div className="p-1 bg-green-200 rounded-md">
              ${priceRange[0]} - ${priceRange[1]}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="font-medium text-md">{title}</div>
              <div className="text-sm">
                Estimated Completion: {deliveryTime} days
              </div>
            </div>
            {user && user.uid === artistUID && (
              <button
                onClick={(e) => {
                  navigate(`/editcommission/${commission.id}`);
                  e.stopPropagation();
                }}
                className="px-4 py-1 rounded-md bg-pink hover:bg-rose-300 text-rose-800"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
      {isImageOpen && (
        <ImageModal
          currIndex={currentIndex}
          onClose={closeModal}
          images={images}
        />
      )}
    </div>
  );
};

export default CommissionCard;
