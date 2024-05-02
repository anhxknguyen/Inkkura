import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import DiscordSVG from "../assets/DiscordSVG";
import EmailSVG from "../assets/EmailSVG";
import TwitterSVG from "../assets/TwitterSVG";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import InstagramSVG from "../assets/InstagramSVG";
import { UserAuth } from "../context/authContext";

const ArtistPage = ({ commission }) => {
  const title = commission.title;
  const description = commission.description;
  const { user } = UserAuth();
  const priceRange = commission.priceRange;
  const artistUID = commission.artist;
  const contacts = commission.contact;
  const estimatedCompletion = 14;
  const [artistDisplayName, setArtistDisplayName] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0); //Stores index of current image being displayed
  const [isHovered, setIsHovered] = useState(false); //Stores whether the image is being hovered over
  const [images, setImages] = useState([]); //Stores all images for the commission
  const thumbnail = commission.thumbnail;
  const [thumbnailImage, setThumbnailImage] = useState(null);
  let isOwner = false;

  if (user && artistUID === user.uid) {
    isOwner = true;
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

        if (imagesList.items.length > 0) {
          const allImages = await Promise.all(
            imagesList.items.map(async (image) => {
              const url = await getDownloadURL(image);
              if (image.name === thumbnail) {
                setThumbnailImage(url);
              }
              return url;
            })
          );
          setImages(allImages);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  //set thumbnail image to index 0
  useEffect(() => {
    if (thumbnailImage) {
      const thumbnailIndex = images.findIndex(
        (image) => image === thumbnailImage
      );
      if (thumbnailIndex !== -1) {
        setCurrentIndex(thumbnailIndex);
      }
    }
  }, [thumbnailImage]);

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
    <div className="h-full mb-32">
      <Navbar />
      <div className="flex items-center justify-start mx-10 text-lg h-4/5">
        <div className="flex-col w-full gap-10">
          <div className="flex items-center gap-5">
            <Link className="text-xl" to="/searchcommissions">
              &lt;
            </Link>
            <div className="text-4xl font-semibold">{title}</div>
            <div className="px-4 py-2 bg-green-200 rounded-md">
              ${priceRange[0]} - ${priceRange[1]}
            </div>
            {isOwner && (
              <Link to={`/editcommission/${commission.id}`}>
                <button className="px-4 py-2 bg-blue-200 rounded-md">
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
                {images.length > 0 && (
                  <img
                    src={images[currentIndex]}
                    className="object-contain w-full h-full"
                  />
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
    </div>
  );
};

export default ArtistPage;
