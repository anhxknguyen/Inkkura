import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { storage } from "../firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";
import { UserAuth } from "../context/authContext";

const CreateCommission = () => {
  const [showAddEmail, setShowAddEmail] = useState(false);
  const [showAddDiscord, setShowAddDiscord] = useState(false);
  const [showAddTwitter, setShowAddTwitter] = useState(false);
  const [showAddInstagram, setShowAddInstagram] = useState(false);
  const [imageUpload, setImageUpload] = useState(null);
  const [imageList, setImageList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { user } = UserAuth();
  const imageListRef = ref(storage, `${user.uid}/`);

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

  const deleteCurrentImage = () => {
    if (imageList.length === 0) return;
    const currentImageUrl = imageList[currentIndex];
    const imageRef = ref(storage, currentImageUrl);
    setDeleting(true);
    deleteObject(imageRef)
      .then(() => {
        setImageList((prev) => prev.filter((url) => url !== currentImageUrl));
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

  useEffect(() => {
    let isMounted = true;
    listAll(imageListRef).then((res) => {
      if (isMounted) {
        const urls = [];
        res.items.forEach((itemRef) => {
          getDownloadURL(itemRef).then((url) => {
            urls.push(url);
            if (urls.length === res.items.length) {
              setImageList(urls);
            }
          });
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (imageUpload !== null) {
      uploadImage();
    }
  }, [imageUpload]);

  const goToPreviousImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? imageList.length - 1 : prevIndex - 1
    );
  };

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
                className="py-3 pl-3 mt-2 border border-black rounded-md "
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium">Listing Description</label>
              <textarea
                placeholder="Commission Description"
                className="py-3 pl-3 mt-2 border border-black rounded-md h-80"
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
                    className="w-16 h-10 text-center border border-black rounded-md"
                  ></input>
                </span>{" "}
                to ${" "}
                <span>
                  <input
                    type="number"
                    placeholder="100"
                    className="w-16 h-10 text-center border border-black rounded-md"
                  ></input>
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <p className="font-medium">Contact</p>
              {showAddEmail ? (
                <input
                  type="email"
                  placeholder="Email"
                  className="w-1/2 pl-2 mt-2 border border-black rounded-md"
                />
              ) : (
                <p
                  className="text-zinc-500 hover:text-pink hover:cursor-pointer"
                  onClick={() => setShowAddEmail(true)}
                >
                  + Add Email
                </p>
              )}
              {showAddDiscord ? (
                <input
                  type="text"
                  placeholder="Discord"
                  className="w-1/2 pl-2 mt-2 border border-black rounded-md"
                />
              ) : (
                <p
                  className="w-1/2 text-zinc-500 hover:text-pink hover:cursor-pointer"
                  onClick={() => setShowAddDiscord(true)}
                >
                  + Add Discord
                </p>
              )}
              {showAddTwitter ? (
                <input
                  type="text"
                  placeholder="Twitter"
                  className="w-1/2 pl-2 mt-2 border border-black rounded-md"
                />
              ) : (
                <p
                  className="w-1/2 text-zinc-500 hover:text-pink hover:cursor-pointer"
                  onClick={() => setShowAddTwitter(true)}
                >
                  + Add Twitter
                </p>
              )}
              {showAddInstagram ? (
                <input
                  type="text"
                  placeholder="Instagram"
                  className="w-1/2 pl-2 mt-2 border border-black rounded-md"
                />
              ) : (
                <p
                  className="text-zinc-500 hover:text-pink hover:cursor-pointer"
                  onClick={() => setShowAddInstagram(true)}
                >
                  + Add Instagram
                </p>
              )}
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
          {/* <div id="uploaded-files" className="text-sm">
            
          </div> */}
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
              className="w-1/5 px-2 py-1 text-white bg-red-500 rounded-full hover:bg-red-600"
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
          <button className="self-end w-1/4 px-4 py-4 mt-2 text-sm bg-blue-700 border rounded font-regular min-w-32 text-whitebg hover:bg-blue-600">
            Publish Listing
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCommission;
