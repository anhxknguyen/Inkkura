import { useState, useEffect } from "react";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../../context/authContext";
import { useUserData } from "../../context/userDataContext";
import { db } from "../../firebase";
import { collection, updateDoc, doc } from "firebase/firestore";
import { checkDisplayNameExists } from "../../utilFunc/checkDisplayNameExists";

const Onboarding = () => {
  const { user } = UserAuth();
  const [displayName, setDisplayName] = useState("");
  const { userData, updateUserData } = useUserData();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // Redirect to home if user is already onboarded
  useEffect(() => {
    if (userData.onboarded) {
      navigate("/");
    }
  }, [userData]);

  //function to handle displayName changes
  const displayNameSubmit = async (e) => {
    e.preventDefault();
    //Empty displayName input
    if (!displayName) {
      setError("display-name-empty");
      return;
    }

    //Calls displayNameExists() to check if the inputted displayName is already taken. If it is, do not allow the user to proceed.
    const displayNameExists = await checkDisplayNameExists(displayName);
    setError("");
    if (displayNameExists) {
      setError("display-name-exists");
      return;
    }

    //Updates the user's displayName and onboarded status in the database
    const docRef = doc(collection(db, "users"), user.uid);
    await updateDoc(docRef, {
      displayName: displayName,
      lowercaseDisplayName: displayName.toLowerCase(),
      onboarded: true,
    });
    updateUserData({ displayName: displayName });
    //Redirects to home page
    navigate("/");
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between h-full mx-20 my-5">
        <div className="flex flex-col gap-5">
          <h1 className="text-6xl font-bold">Welcome to Inkkura</h1>
          <h2>
            Signed in as{" "}
            <span className="text-zinc-500">{user && user.email}</span>{" "}
          </h2>
          <form id="displayname-form" className="flex flex-col gap-5">
            <div>
              <label>Display Name</label>
              <input
                id="display-name"
                type="displayName"
                value={displayName}
                placeholder="yourdisplayname"
                className={`w-full py-3 pl-3 my-2 border rounded-md ${
                  error === "display-name-exists" ||
                  error === "display-name-empty"
                    ? "border-red-500"
                    : ""
                }`}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setError("");
                }}
              />
              {error && (
                <p className="text-sm text-red-500">
                  Error: {getErrorMsg(error)}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-1/2 px-2 py-3 my-2 border rounded-md text-whitebg bg-zinc-700 hover:bg-zinc-600"
              onClick={displayNameSubmit}
            >
              Let's Go.
            </button>
          </form>
        </div>
        <div className="flex items-center h-full">
          <img className="h-2/4" src={logo} alt="logo" />
        </div>
      </div>
    </div>
  );
};

//Translates error code to error message
const getErrorMsg = (error) => {
  switch (error) {
    case "display-name-exists":
      return "Sorry, this name is already taken.";
    case "display-name-empty":
      return "Display name cannot be empty.";
    default:
      return "An error occurred.";
  }
};

export default Onboarding;
