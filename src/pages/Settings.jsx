import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { UserAuth } from "../context/authContext";
import { useUserData } from "../context/userDataContext";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

const Settings = () => {
  const { user } = UserAuth();
  const { userData, updateUserData } = useUserData();
  const [displayName, setDisplayName] = useState(userData.displayName || "");
  const [error, setError] = useState("");

  useEffect(() => {
    setDisplayName(userData.displayName || "");
  }, [userData.displayName]);

  const displayNameSubmit = async (e) => {
    e.preventDefault();
    if (!displayName) {
      setError("display-name-empty");
      return;
    }

    const displayNameExists = await checkDisplayNameExists(displayName);
    setError("");
    if (displayNameExists) {
      setError("display-name-exists");
      return;
    }

    const docRef = doc(collection(db, "users"), user.uid);
    await updateDoc(docRef, {
      displayName: displayName,
      lowercaseDisplayName: displayName.toLowerCase(),
      onboarded: true,
    });
    updateUserData({ displayName: displayName });
    window.location.reload();
  };

  const checkDisplayNameExists = async (displayName) => {
    try {
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(
        query(
          usersRef,
          where("lowercaseDisplayName", "==", displayName.toLowerCase())
        )
      );
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking displayName existence:", error);
      return true; // Consider it exists if an error occurs
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-start mx-5 text-lg h-4/5">
        <form className="flex flex-col">
          <div className="flex flex-col">
            <label>Display Name</label>
            <input
              type="text"
              value={displayName}
              placeholder="Display Name"
              className={`w-full py-3 pl-3 my-2 border rounded-md ${error === "display-name-exists" || error === "display-name-empty" ? "border-red-500" : ""}`}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setError("");
              }}
            />
          </div>
          {error && (
            <p className="text-sm text-red-500">Error: {getErrorMsg(error)}</p>
          )}
          <button
            type="submit"
            className="w-full px-2 py-3 my-2 border rounded-md text-whitebg bg-zinc-700 hover:bg-zinc-600"
            onClick={displayNameSubmit}
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

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

export default Settings;
