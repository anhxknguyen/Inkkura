import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DiscordSVG from "../assets/DiscordSVG";
import EmailSVG from "../assets/EmailSVG";
import TwitterSVG from "../assets/TwitterSVG";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import InstagramSVG from "../assets/InstagramSVG";
import { UserAuth } from "../context/authContext";
import { getMetadata } from "firebase/storage";
import ImageModal from "../components/ImageModal";

const CommissionPage = ({ commission, prevPath }) => {
  const title = commission.title;
  const description = commission.description;
  const { user } = UserAuth();
  const priceRange = commission.priceRange;
  const artistUID = commission.artist;
  const contacts = commission.contact;
  const [artistDisplayName, setArtistDisplayName] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0); //Stores index of current image being displayed
  const [isHovered, setIsHovered] = useState(false); //Stores whether the image is being hovered over
  const [images, setImages] = useState([]); //Stores all images for the commission
  const [imageNamesList, setImageNamesList] = useState([]);
  let isOwner = false;
  const [deliveryTime, setDeliveryTime] = commission.deliveryTime;
  const thumbnail = commission.thumbnail;
  const [isImageOpen, setIsImageOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const previousPath = location.state ? location.state.prevPath : null;

  const openModal = () => {
    setIsImageOpen(true);
  };

  const closeModal = () => {
    setIsImageOpen(false);
  };

  if (user) {
    if (artistUID === user.uid) {
      isOwner = true;
    }
  }

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

  const handleBackButton = () => {
    if (previousPath) {
      navigate(previousPath);
    } else {
      navigate("/searchCommissions");
    }
  };

  return (
    <div className="h-full mb-32">
      <Navbar />
      <div className="flex items-center justify-start mx-10 text-lg h-4/5">
        <div className="flex-col w-full gap-10">
          <div className="flex items-center gap-5">
            <span
              className="text-xl hover:cursor-pointer"
              onClick={() => handleBackButton()}
            >
              &lt;
            </span>
            <div className="text-4xl font-semibold">{title}</div>
            <div className="px-4 py-2 bg-green-200 rounded-md">
              ${priceRange[0]} - ${priceRange[1]}
            </div>
            {isOwner && (
              <Link to={`/editcommission/${commission.id}`}>
                <button className="px-4 py-2 rounded-md bg-pink text-rose-800">
                  Edit
                </button>
              </Link>
            )}
          </div>
          <div className="flex justify-between w-full gap-20 mt-4">
            <div
              className="relative w-1/2 mb-8"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {images.length > 1 && (
                <button
                  onClick={goToPreviousImage}
                  className="absolute z-10 w-10 h-10 transform -translate-y-1/2 bg-gray-200 border rounded-full left-2 top-1/2 hover:bg-gray-300"
                  style={{ display: isHovered ? "block" : "none" }}
                >
                  &lt;
                </button>
              )}

              {images.length > 1 && (
                <button
                  onClick={goToNextImage}
                  className="absolute z-10 w-10 h-10 transform -translate-y-1/2 bg-gray-200 border rounded-full right-2 top-1/2 hover:bg-gray-300"
                  style={{ display: isHovered ? "block" : "none" }}
                >
                  {" "}
                  &gt;
                </button>
              )}
              <div
                id="preview"
                className="relative border border-black rounded-md h-preview"
              >
                {images.length > 0 ? (
                  <img
                    src={images[currentIndex]}
                    className="object-contain w-full h-full no-select hover:cursor-pointer"
                    onClick={() => openModal(images[currentIndex])}
                  />
                ) : (
                  <img className="object-contain w-full h-full no-select hover:cursor-pointer bg-zinc-400 animate-pulse" />
                )}
              </div>
            </div>
            <div className="flex flex-col w-1/2 gap-10">
              <div className="text-3xl font-semibold">
                Contact and Description
              </div>
              <div>
                {Object.entries(contacts).map(([key, value]) => (
                  <div key={key} className="flex items-center text-blue-800">
                    <span className="mr-2">
                      {key === "discord" && <DiscordSVG />}
                      {key === "email" && <EmailSVG />}
                      {key === "twitter" && <TwitterSVG />}
                      {key === "instagram" && <InstagramSVG />}
                    </span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
              <div>{description}</div>
            </div>
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

export default CommissionPage;
