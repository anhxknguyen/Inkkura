import React, { useState, useEffect, useLayoutEffect } from "react";
import logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../../context/authContext";
import { db } from "../../firebase";
import {
  collection,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const Onboarding = () => {
  const { user } = UserAuth();
  const [displayName, setDisplayName] = useState("");
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useLayoutEffect(() => {
    if (userData.onboarded) {
      navigate("/");
    }
  }, [userData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user && user.uid) {
          const docRef = doc(collection(db, "users"), user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!displayName) {
      setError("display-name-empty");
      return;
    }

    // Check if displayName is already taken
    const displayNameExists = await checkDisplayNameExists(displayName);
    setError("");
    if (displayNameExists) {
      setError("display-name-exists");
      return;
    }

    // Update the document with the new displayName
    const docRef = doc(collection(db, "users"), user.uid);
    await updateDoc(docRef, {
      displayName: displayName,
      onboarded: true,
    });
    navigate("/");
  };

  // Function to check if displayName already exists
  const checkDisplayNameExists = async (displayName) => {
    try {
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(
        query(usersRef, where("displayName", "==", displayName))
      );
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking displayName existence:", error);
      return true; // Consider it exists if an error occurs
    }
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
                className={`w-full py-3 pl-3 my-2 border rounded-md ${error === "display-name-exists" || error === "display-name-empty" ? "border-red-500" : ""}`}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              {error && (
                <p className="text-sm text-red-500">
                  {error && (
                    <p className="text-sm text-red-500">
                      Error: {getErrorMsg(error)}
                    </p>
                  )}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-1/2 px-2 py-3 my-2 border rounded-md text-whitebg bg-zinc-700 hover:bg-zinc-600"
              onClick={handleSubmit}
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

const getErrorMsg = (error) => {
  switch (error) {
    case "display-name-exists":
      return "This name already exists.";
    case "display-name-empty":
      return "Display name cannot be empty.";
    default:
      return "An error occurred.";
  }
};

export default Onboarding;
