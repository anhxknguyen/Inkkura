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

const CreateCommission = () => {
  const [imageUpload, setImageUpload] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { user } = UserAuth();
  const imageListRef = ref(storage, `${user.uid}/`);
  const { commissionData } = useUserData();
  const [imageList, setImageList] = useState([]);
  const [commissionTitle, setCommissionTitle] = useState("");
  const [commissionDescription, setCommissionDescription] = useState("");
  const [lowerPriceRange, setLowerPriceRange] = useState(0);
  const [upperPriceRange, setUpperPriceRange] = useState(0);
  const [contactInfo, setContactInfo] = useState({});
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingDiscord, setIsEditingDiscord] = useState(false);
  const [isEditingTwitter, setIsEditingTwitter] = useState(false);
  const [isEditingInstagram, setIsEditingInstagram] = useState(false);
  const [isPublishedListing, setIsPublishedListing] = useState(false);
  const [imageOriginalURLList, setImageOriginalURLList] = useState([]);

  const handlePublish = async (e) => {
    e.preventDefault();
    const commmissionsDocRef = doc(db, "commissions", user.uid);
    const docSnapshot = await getDoc(commmissionsDocRef);
    if (docSnapshot.exists() === false) {
      await setDoc(doc(db, "commissions", user.uid), {
        title: commissionTitle,
        description: commissionDescription,
        priceRange: [lowerPriceRange, upperPriceRange],
        contact: contactInfo,
        images: imageList,
        published: true,
      });
      return;
    }
    await updateDoc(commmissionsDocRef, {
      title: commissionTitle,
      description: commissionDescription,
      priceRange: [lowerPriceRange, upperPriceRange],
      contact: contactInfo,
      images: imageList,
      published: true,
    });
  };

  // Function to upload image
  const uploadImage = () => {
    if (imageUpload == null) {
      console.log("fail");
      return;
    }
    const imageName = imageUpload.name;
    const imageRef = ref(storage, `${user.uid}/${imageName}`);
    // Do not upload if filename already exists
    listAll(imageListRef)
      .then((res) => {
        const existingFiles = res.items.map((item) => item.name);
        if (existingFiles.includes(imageName)) {
          return;
        }
        //upload image
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
      })
      .catch((error) => {
        console.error("Error listing images:", error);
      });
  };

  // Function to delete image
  const deleteCurrentImage = () => {
    if (imageList.length === 0) return;
    const currentImageUrl = imageList[currentIndex];
    const imageRef = ref(storage, currentImageUrl);
    setDeleting(true);
    deleteObject(imageRef)
      .then(() => {
        setImageList((prev) => prev.filter((url) => url !== currentImageUrl));
        setImageOriginalURLList((prev) =>
          prev.filter((url) => url !== imageOriginalURLList[currentIndex])
        );
        setCurrentIndex((prevIndex) =>
          prevIndex === imageList.length - 1 ? 0 : prevIndex
        );
      })
      .catch((error) => {
        console.error("Error deleting image:", error);
      })
      .finally(() => {
        setDeleting(false);
      });
  };

  // useEffect to list all images at start of render
  useEffect(() => {
    let isMounted = true;
    listAll(imageListRef).then((res) => {
      if (isMounted) {
        const urls = [];
        const originalNames = []; // New array to hold original file names
        res.items.forEach((itemRef) => {
          originalNames.push(itemRef.name); // Store original file names
          getDownloadURL(itemRef).then((url) => {
            urls.push(url);
            if (urls.length === res.items.length) {
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
    console.log(commissionData.contact);
    setContactInfo(commissionData.contact || {});
  }, [commissionData.contact]);

  // useEffect to upload image as soon as a new file is uploaded
  useEffect(() => {
    if (imageUpload !== null) {
      uploadImage();
    }
  }, [imageUpload]);

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
    <div>
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
              <p
                key={index}
                className="hover:text-pink hover:cursor-pointer w-fit"
                onClick={() => {
                  setCurrentIndex(index);
                }}
              >
                {index + 1}. {url}
              </p>
            ))}
          </div>
          <div
            id="preview"
            className="border border-black rounded-md h-preview"
          >
            {imageList.length > 0 && (
              <img
                src={imageList[currentIndex]}
                className="object-contain w-full h-full"
              />
            )}
          </div>
          <div className="flex justify-between">
            <button
              onClick={goToPreviousImage}
              className="w-1/5 bg-gray-200 rounded-full hover:bg-gray-300"
            >
              &lt;
            </button>
            <button
              className="w-1/12 px-2 py-1 text-white bg-red-500 rounded-full hover:bg-red-600"
              onClick={deleteCurrentImage}
              disabled={deleting}
            >
              x
            </button>
            <button
              onClick={goToNextImage}
              className="w-1/5 bg-gray-200 rounded-full hover:bg-gray-300"
            >
              &gt;
            </button>
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
