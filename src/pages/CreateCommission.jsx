import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { db, storage } from "../firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";
import { UserAuth } from "../context/authContext";
import { useUserData } from "../context/userDataContext";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import DiscordSVG from "../assets/DiscordSVG";
import EmailSVG from "../assets/EmailSVG";
import TwitterSVG from "../assets/TwitterSVG";
import InstagramSVG from "../assets/InstagramSVG";
import { v4 } from "uuid";

const CreateCommission = () => {
  const [imageUpload, setImageUpload] = useState(null); //Stores uploaded image
  const [currentIndex, setCurrentIndex] = useState(0); //Stores index of current image being displayed

  //State to store uploading and deleting status. Used to prevent multiple uploads/deletes (spamming)
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  //User and Commission Data
  const { user } = UserAuth();
  let { userData } = useUserData();
  const [commissionData, setCommissionData] = useState({}); //Stores commission data

  const imageListRef = ref(storage, `${user.uid}/`);
  const [imageList, setImageList] = useState([]); // stores image URLs as it is in the database
  const [imageOriginalURLList, setImageOriginalURLList] = useState([]); //stores image URLS as it is when uploaded by user

  // State to store commission details
  const [commissionTitle, setCommissionTitle] = useState("");
  const [commissionDescription, setCommissionDescription] = useState("");
  const [lowerPriceRange, setLowerPriceRange] = useState(0);
  const [upperPriceRange, setUpperPriceRange] = useState(0);
  const [contactInfo, setContactInfo] = useState({});
  const [commissionArtist, setCommissionArtist] = useState(user.uid || "");

  // State to store editing status of contact info (mainly for styling purposes)
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingDiscord, setIsEditingDiscord] = useState(false);
  const [isEditingTwitter, setIsEditingTwitter] = useState(false);
  const [isEditingInstagram, setIsEditingInstagram] = useState(false);
  const [isPublishedListing, setIsPublishedListing] = useState(false);
  const [isHovered, setIsHovered] = useState(false); //Stores whether the image is being hovered over

  // Function to handle publish/update listing
  const handlePublish = async (e) => {
    e.preventDefault();
    const commmissionsDocRef = doc(db, "commissions", user.uid);
    const docSnapshot = await getDoc(commmissionsDocRef);
    // If document does not exist, create a new document
    if (docSnapshot.exists() === false) {
      await setDoc(doc(db, "commissions", user.uid), {
        id: v4(),
        title: commissionTitle,
        description: commissionDescription,
        priceRange: [lowerPriceRange, upperPriceRange],
        contact: contactInfo,
        images: imageList,
        published: true,
        artist: commissionArtist,
      });
      location.reload();
      return;
    }
    // If document exists, update the document
    await updateDoc(commmissionsDocRef, {
      title: commissionTitle,
      description: commissionDescription,
      priceRange: [lowerPriceRange, upperPriceRange],
      contact: contactInfo,
      images: imageList,
      published: true,
      artist: commissionArtist,
    });
    location.reload();
  };

  const reFetchCommissionData = async () => {
    try {
      if (user && user.uid) {
        const docRef = doc(db, "commissions", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCommissionData(docSnap.data());
        }
      }
    } catch (error) {
      console.error("Error fetching commission data:", error);
    }
  };

  // Function to upload image
  const uploadImage = () => {
    if (imageUpload == null) {
      console.log("fail");
      return;
    }
    const imageName = imageUpload.name;
    const imageRef = ref(storage, `${user.uid}/${imageName}`);

    // Check if image already exists in storage
    if (imageOriginalURLList.includes(imageName)) {
      console.log("Image already exists in storage");
      return;
    }

    // Upload image
    setUploading(true);
    uploadBytes(imageRef, imageUpload)
      .then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          setImageList((prev) => [...prev, url]);
          setImageOriginalURLList((prev) => [...prev, imageName]);
        });
      })
      .catch((error) => {
        console.error("Error uploading image:", error);
      })
      .finally(() => {
        setUploading(false);
      });
  };

  // Function to delete image
  const deleteImage = (index) => {
    if (imageList.length === 0) return;
    const currentImageUrl = imageList[index];
    const imageRef = ref(storage, currentImageUrl);
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

  // useEffect to list all images at start of render
  useEffect(() => {
    let isMounted = true;
    const publishedImages = commissionData.images; // Stores published images only (not the ones in firebase storage)
    listAll(imageListRef).then((res) => {
      if (isMounted) {
        const urls = []; // New array to hold image URLs
        const originalNames = []; // New array to hold original file names
        res.items.forEach((itemRef) => {
          // Loop through each item in the storage
          getDownloadURL(itemRef).then((url) => {
            // Get download URL of each item
            if (publishedImages && publishedImages.includes(url)) {
              // If the image is published, add it to the lists
              originalNames.push(itemRef.name);
              urls.push(url);
            } else if (publishedImages && !publishedImages.includes(url)) {
              // If the image is not published, delete it from storage
              deleteObject(itemRef);
            }
            if (publishedImages && urls.length === publishedImages.length) {
              // Set lists after all published images are added
              setImageList(urls);
              setImageOriginalURLList(originalNames); // Set original file names
            }
          });
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, [commissionData.images]);

  useEffect(() => {
    reFetchCommissionData();
  }, []);

  // useEffect to set commission title
  useEffect(() => {
    setCommissionTitle(commissionData.title || "");
  }, [commissionData.title]);

  // useEffect to set commission description
  useEffect(() => {
    setCommissionDescription(commissionData.description || "");
  }, [commissionData.description]);

  // useEffect to set price range
  useEffect(() => {
    setLowerPriceRange(
      commissionData.priceRange ? commissionData.priceRange[0] : 0
    );
    setUpperPriceRange(
      commissionData.priceRange ? commissionData.priceRange[1] : 0
    );
  }, [commissionData.priceRange]);

  // useEffect to set published status
  useEffect(() => {
    setIsPublishedListing(commissionData.published || false);
  }, [commissionData.published]);

  // useEffect to set contact info
  useEffect(() => {
    setContactInfo(commissionData.contact || {});
  }, [commissionData.contact]);

  // useEffect to upload image as soon as a new file is uploaded
  useEffect(() => {
    if (imageUpload !== null) {
      uploadImage();
    }
  }, [imageUpload]);

  // useEffect to set commission artist
  useEffect(() => {
    if (user.uid) {
      setCommissionArtist(user.uid);
    }
  }, [user.uid]);

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

  return (
    <div className="mb-32">
      <Navbar />
      <div className="flex justify-between mx-5 text-lg">
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
                setImageUpload(e.target.files[0]);
              }}
              disabled={uploading}
              className="hidden"
            ></input>
          </div>
          <div id="uploaded-files" className="text-sm">
            {imageOriginalURLList.map((url, index) => (
              <div className="flex gap-6">
                <p
                  key={index}
                  className=" hover:text-pink hover:cursor-pointer w-fit"
                  onClick={() => {
                    setCurrentIndex(index);
                  }}
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
            <button
              onClick={goToPreviousImage}
              className="absolute z-10 w-10 h-10 transform -translate-y-1/2 bg-gray-200 border rounded-full left-2 top-1/2 hover:bg-gray-300"
              style={{ display: isHovered ? "block" : "none" }}
            >
              &lt;
            </button>
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
              <button
                onClick={goToNextImage}
                className="absolute z-10 w-10 h-10 transform -translate-y-1/2 bg-gray-200 border rounded-full right-2 top-1/2 hover:bg-gray-300"
                style={{ display: isHovered ? "block" : "none" }}
              >
                &gt;
              </button>
            </div>
          </div>

          <button
            onClick={handlePublish}
            className="self-end w-1/4 px-4 py-4 mt-2 text-sm bg-blue-700 border rounded-md font-regular min-w-32 text-whitebg hover:bg-blue-600"
          >
            {isPublishedListing ? "Update Listing" : "Publish Listing"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCommission;
