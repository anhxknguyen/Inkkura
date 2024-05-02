import Navbar from "../components/Navbar";
import EmailSVG from "../assets/EmailSVG";
import DiscordSVG from "../assets/DiscordSVG";
import TwitterSVG from "../assets/TwitterSVG";
import InstagramSVG from "../assets/InstagramSVG";
import { UserAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ref,
  listAll,
  getDownloadURL,
  uploadString,
  deleteObject,
} from "firebase/storage";
import { storage, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { updateDoc } from "firebase/firestore";

const EditCommission = ({ commission }) => {
  const [currentIndex, setCurrentIndex] = useState(0); //Stores index of current image being displayed

  //State to store uploading and deleting status. Used to prevent multiple uploads/deletes (spamming)
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  //User and Commission Data
  const { user } = UserAuth();

  const [imageList, setImageList] = useState([]); // stores image URLs as it is in the database
  const [imageOriginalURLList, setImageOriginalURLList] = useState([]); //stores image URLS as it is when uploaded by user

  // State to store commission details
  const [commissionTitle, setCommissionTitle] = useState(commission.title);
  const [commissionDescription, setCommissionDescription] = useState(
    commission.description
  );
  const [lowerPriceRange, setLowerPriceRange] = useState(
    commission.priceRange[0]
  );
  const [upperPriceRange, setUpperPriceRange] = useState(
    commission.priceRange[1]
  );
  const [contactInfo, setContactInfo] = useState(commission.contact);
  const [commissionArtist, setCommissionArtist] = useState(user.uid || "");
  const [artistDisplayName, setArtistDisplayName] = useState(null);
  const [thumbnail, setThumbnail] = useState(commission.thumbnail);
  const [thumbnailImage, setThumbnailImage] = useState(null);

  // State to store editing status of contact info (mainly for styling purposes)
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingDiscord, setIsEditingDiscord] = useState(false);
  const [isEditingTwitter, setIsEditingTwitter] = useState(false);
  const [isEditingInstagram, setIsEditingInstagram] = useState(false);
  const [isHovered, setIsHovered] = useState(false); //Stores whether the image is being hovered over
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    const commmissionDocRef = doc(db, "commissions", commission.id);

    try {
      const docSnapshot = await getDoc(commmissionDocRef);

      // Handle case when the document doesn't exist

      if (!docSnapshot.exists()) {
        console.log("Commission document does not exist.");
        return;
      }

      const imageListStorageFile = ref(
        storage,
        `${commissionArtist}/${commission.id}`
      );
      const imageListStorage = await listAll(imageListStorageFile);
      await Promise.all(
        imageListStorage.items.map((item) => deleteObject(item))
      );

      await Promise.all(
        imageList.map(async (image) => {
          console.log("uploading image");
          const imageRef = ref(
            storage,
            `${user.uid}/${commission.id}/${imageOriginalURLList[imageList.indexOf(image)]}`
          );
          await uploadString(imageRef, image, "data_url", {
            contentType: "image/jpg",
          });
          console.log("Uploaded image");
        })
      );

      // Update commission document with new data
      await updateDoc(commmissionDocRef, {
        title: commissionTitle,
        description: commissionDescription,
        priceRange: [lowerPriceRange, upperPriceRange],
        contact: contactInfo,
        thumbnail: thumbnail,
      });

      console.log("Commission updated successfully.");
      setIsUpdating(false);
      navigate("/commission/" + commission.id);
      location.reload(); // This seems unnecessary, consider removing it
    } catch (error) {
      console.error("Error updating commission:", error);
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const artistDoc = doc(db, "users", commissionArtist);
        const artistSnapshot = await getDoc(artistDoc);
        let displayName = "Unknown Artist";

        if (artistSnapshot.exists()) {
          const artistData = artistSnapshot.data();
          displayName = artistData.displayName;
        }

        setArtistDisplayName(displayName);

        const imagesRef = ref(storage, `${commissionArtist}/${commission.id}`);
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

          Promise.all(
            allImages.map(async (imgUrl) => {
              const response = await fetch(imgUrl);
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
            setImageList(base64Strings); // Log the base64 string of the first image
          });

          const allImagesOriginalURL = imagesList.items.map(
            (image) => image.name
          );
          setImageOriginalURLList(allImagesOriginalURL);
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
      const thumbnailIndex = imageList.findIndex(
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
      prevIndex === 0 ? imageList.length - 1 : prevIndex - 1
    );
  };

  // Function to go to next image
  const goToNextImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === imageList.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Function to delete image
  const deleteImage = (index) => {
    if (imageList.length === 0) return;
    const currentImageUrl = imageList[index];
    setDeleting(true);
    setImageList((prev) => prev.filter((url) => url !== currentImageUrl)); // Remove URL from imageList
    setImageOriginalURLList(
      (prev) => prev.filter((url) => url !== imageOriginalURLList[index]) // Remove original file name from imageOriginalURLList
    );
    setCurrentIndex((prevIndex) =>
      prevIndex === imageList.length - 1 ? 0 : prevIndex
    );

    setDeleting(false);
  };

  return (
    <div className="mb-32">
      <Navbar />
      <div className="flex justify-between mx-10 text-lg">
        <div className="flex items-start justify-start w-1/2">
          <form className="flex flex-col w-4/5 gap-6">
            <div className="flex flex-col">
              <label className="font-medium">
                Title Your Commission Listing
              </label>
              <input
                type="text"
                placeholder="Commission Name"
                value={commissionTitle}
                className="py-3 pl-3 mt-2 border border-black rounded-md "
                onChange={(e) => setCommissionTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium">Listing Description</label>
              <textarea
                placeholder="Commission Description"
                value={commissionDescription}
                className="py-3 pl-3 mt-2 border border-black rounded-md h-80"
                onChange={(e) => setCommissionDescription(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium">Price Range</label>
              <div>
                $
                <span>
                  {" "}
                  <input
                    type="number"
                    placeholder="10"
                    value={lowerPriceRange}
                    className="w-16 h-10 text-center border border-black rounded-md"
                    onChange={(e) => setLowerPriceRange(e.target.value)}
                  ></input>
                </span>{" "}
                to ${" "}
                <span>
                  <input
                    type="number"
                    placeholder="100"
                    value={upperPriceRange}
                    className="w-16 h-10 text-center border border-black rounded-md"
                    onChange={(e) => setUpperPriceRange(e.target.value)}
                  ></input>
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <p className="font-medium">Contact</p>
              <div className="flex items-center gap-2">
                <EmailSVG />
                {isEditingEmail ? (
                  <input
                    type="email"
                    placeholder="Email"
                    value={contactInfo.email}
                    className="w-1/2 pl-2 border border-black rounded-md"
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, email: e.target.value })
                    }
                    i
                    onFocus={() => setIsEditingEmail(true)}
                    onBlur={() => setIsEditingEmail(false)}
                    autoFocus
                  />
                ) : (
                  <p
                    className="text-zinc-500 w-max hover:text-pink hover:cursor-pointer"
                    onClick={() => setIsEditingEmail(true)}
                  >
                    {contactInfo.email ? contactInfo.email : "+ Add Email"}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <DiscordSVG />
                {isEditingDiscord ? (
                  <input
                    type="text"
                    placeholder="Discord"
                    value={contactInfo.discord}
                    className="w-1/2 pl-2 border border-black rounded-md"
                    onChange={(e) =>
                      setContactInfo({
                        ...contactInfo,
                        discord: e.target.value,
                      })
                    }
                    onFocus={() => setIsEditingDiscord(true)}
                    onBlur={() => setIsEditingDiscord(false)}
                    autoFocus
                  />
                ) : (
                  <p
                    className="text-zinc-500 w-max hover:text-pink hover:cursor-pointer"
                    onClick={() => setIsEditingDiscord(true)}
                  >
                    {contactInfo.discord
                      ? contactInfo.discord
                      : "+ Add Discord"}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <TwitterSVG />
                {isEditingTwitter ? (
                  <input
                    type="text"
                    placeholder="Twitter"
                    value={contactInfo.twitter}
                    className="w-1/2 pl-2 border border-black rounded-md"
                    onChange={(e) =>
                      setContactInfo({
                        ...contactInfo,
                        twitter: e.target.value,
                      })
                    }
                    onFocus={() => setIsEditingTwitter(true)}
                    onBlur={() => setIsEditingTwitter(false)}
                    autoFocus
                  />
                ) : (
                  <p
                    className="text-zinc-500 w-max hover:text-pink hover:cursor-pointer"
                    onClick={() => setIsEditingTwitter(true)}
                  >
                    {contactInfo.twitter
                      ? contactInfo.twitter
                      : "+ Add Twitter"}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <InstagramSVG />
                {isEditingInstagram ? (
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Instagram"
                      value={contactInfo.instagram}
                      className="w-1/2 pl-2 border border-black rounded-md"
                      onChange={(e) =>
                        setContactInfo({
                          ...contactInfo,
                          instagram: e.target.value,
                        })
                      }
                      autoFocus
                      onFocus={() => setIsEditingInstagram(true)}
                      onBlur={() => setIsEditingInstagram(false)}
                    />
                  </div>
                ) : (
                  <p
                    className="text-zinc-500 w-max hover:text-pink hover:cursor-pointer"
                    onClick={() => setIsEditingInstagram(true)}
                  >
                    {contactInfo.instagram
                      ? contactInfo.instagram
                      : "+ Add Instagram"}
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>
        <div className="flex flex-col w-1/2 gap-2">
          <div className="flex flex-col">
            <p className="font-medium">Display Your Work</p>
            <label
              htmlFor="file-upload"
              className="px-3 py-4 mt-2 text-sm text-center border rounded-md hover:cursor-pointer font-regular min-w-32 text-whitebg bg-zinc-700 hover:bg-zinc-600"
            >
              {uploading ? "Uploading..." : "Upload Photo(s) +"}
            </label>
            <input
              type="file"
              id="file-upload"
              onChange={(e) => {
                if (e.target.files[0]) {
                  if (imageOriginalURLList.includes(e.target.files[0].name)) {
                    alert("File with same name already uploaded");
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => {
                    setImageList((prev) => [...prev, reader.result]);
                    setImageOriginalURLList((prev) => [
                      ...prev,
                      e.target.files[0].name,
                    ]);
                  };
                  reader.readAsDataURL(e.target.files[0]);
                }
              }}
              disabled={uploading}
              className="hidden"
            ></input>
          </div>
          <div id="uploaded-files" className="text-sm">
            {imageOriginalURLList.map((url, index) => (
              <div className="flex gap-6" key={`${url}-${index}`}>
                <p
                  className="hover:text-pink hover:cursor-pointer"
                  onClick={() => setCurrentIndex(index)}
                >
                  {index + 1}. {url}
                </p>
                <span className="text-red-500 hover:text-red-700">
                  <button
                    onClick={() => deleteImage(index)}
                    disabled={deleting}
                  >
                    &#10005;
                  </button>
                </span>
              </div>
            ))}
          </div>
          <div
            className="relative w-full mb-8"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {imageList.length > 1 && (
              <button
                onClick={goToPreviousImage}
                className="absolute z-10 w-10 h-10 transform -translate-y-1/2 bg-gray-200 border rounded-full left-2 top-1/2 hover:bg-gray-300"
                style={{ display: isHovered ? "block" : "none" }}
              >
                &lt;
              </button>
            )}

            {imageList.length > 1 && (
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
              {imageList.length > 0 && (
                <img
                  src={imageList[currentIndex]}
                  className="object-contain w-full h-full"
                />
              )}
            </div>
          </div>

          <button
            onClick={handleUpdate}
            className="self-end w-1/4 px-4 py-4 mt-2 text-sm bg-blue-700 border rounded-md font-regular min-w-32 text-whitebg hover:bg-blue-600"
          >
            {isUpdating ? "Updating..." : "Update Listing"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCommission;
