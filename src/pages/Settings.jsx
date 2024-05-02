import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { UserAuth } from "../context/authContext";
import { useUserData } from "../context/userDataContext";
import { db, storage } from "../firebase";
import { checkDisplayNameExists } from "../utilFunc/checkDisplayNameExists";
import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  where,
  getDocs,
  query,
} from "firebase/firestore";
import { ref, deleteObject, listAll } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import CommissionCard from "../components/CommissionCard";

//Need to add email update functionality
const Settings = () => {
  const { user, deleteAccount } = UserAuth();
  const { userData, updateUserData } = useUserData();
  const [displayName, setDisplayName] = useState(userData.displayName || "");
  const [error, setError] = useState("");
  const [isVerified, setisVerified] = useState(false);
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [userCommissionsList, setUserCommissionsList] = useState([]);

  // useEffect to update displayName state when userData.displayName changes
  useEffect(() => {
    setDisplayName(userData.displayName || "");
  }, [userData.displayName]);

  useEffect(() => {
    setisVerified(user.emailVerified);
  }, [user.emailVerified]);

  // Function to handle account deletion
  const handleDelete = async () => {
    // Deletion confirmation
    const deletionConfirmation = confirm(
      "Are you sure you want to delete your account?"
    );
    if (!deletionConfirmation) {
      return;
    }
    // Prompt for reauthentication
    const password = prompt("Please enter your password to confirm deletion:");
    if (!password) {
      return;
    }
    // Reauthenticate user
    const credential = EmailAuthProvider.credential(user.email, password);
    // Delete user data from database and delete account
    try {
      await reauthenticateWithCredential(user, credential);
      setIsDeleting(true);
      await deleteDoc(doc(db, "users", user.uid));
      console.log("deleted user data");

      //for every commission that is owned by the user, delete it
      const commissionsSnapshot = collection(db, "commissions");
      const querySnapshot = await getDocs(
        query(commissionsSnapshot, where("artist", "==", user.uid))
      );
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      console.log("deleted commissions");

      const userStorageRef = ref(storage, `${user.uid}`);
      const userStorageSnapshot = await listAll(userStorageRef);

      // Iterate through each commissions folder
      await Promise.all(
        userStorageSnapshot.prefixes.map(async (commissionFolderRef) => {
          // List all items (files) within the commissions folder
          const commissionSnapshot = await listAll(commissionFolderRef);

          // Delete all files within the commissions folder
          await Promise.all(
            commissionSnapshot.items.map((item) => deleteObject(item))
          );
        })
      );

      await deleteAccount();
      navigate("/");
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        alert("Please log out and log back in to delete your account.");
      } else if (error.code === "auth/wrong-password") {
        alert("Incorrect password. Please try again.");
      } else {
        console.log(error.message);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  //find all commissions that the user owns
  const fetchCommissions = async () => {
    try {
      const fetchedCommissions = [];
      const commissionsRef = collection(db, "commissions");
      const querySnapshot = await getDocs(
        query(commissionsRef, where("artist", "==", user.uid))
      );
      console.log(querySnapshot.docs);
      querySnapshot.forEach((commission) => {
        fetchedCommissions.push(commission.data());
      });
      setUserCommissionsList(fetchedCommissions);
    } catch (error) {
      console.error("Error getting commissions:", error);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  // Function to handle displayName changes
  const displayNameSubmit = async (e) => {
    e.preventDefault();
    // Empty displayName input
    if (!displayName) {
      setError("display-name-empty");
      return;
    }

    // Calls checkDisplayNameExists() to check if the inputted displayName is already taken. If it is, do not allow the user to proceed.
    const displayNameExists = await checkDisplayNameExists(displayName);
    setError("");
    if (displayNameExists) {
      setError("display-name-exists");
      return;
    }

    // Update displayName in database
    const docRef = doc(collection(db, "users"), user.uid);
    await updateDoc(docRef, {
      displayName: displayName,
      lowercaseDisplayName: displayName.toLowerCase(),
      onboarded: true,
    });
    updateUserData({ displayName: displayName });
    location.reload();
  };

  return (
    <div>
      <Navbar />
      <div className="flex flex-col h-full gap-10">
        <div className="flex items-center justify-start mx-10 text-lg">
          <form className="flex flex-col w-full">
            <div className="flex flex-col">
              <label className="font-medium">Display Name</label>
              <input
                type="text"
                value={displayName}
                placeholder="Display Name"
                className={`w-1/4 py-3 pl-3 my-2 border rounded-md ${
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
            </div>
            {error && (
              <p className="text-sm text-red-500">
                Error: {getErrorMsg(error)}
              </p>
            )}
            <div className="w-1/4 font-medium">
              Verification Status:{" "}
              {isVerified ? (
                <span className="font-normal text-green-500">
                  Email Verified
                </span>
              ) : (
                <span className="font-normal text-red-500">
                  Email Not Verified
                </span>
              )}
            </div>
            <div className="flex w-1/4 gap-1">
              <button
                type="delete"
                className="w-1/2 px-2 py-3 my-2 text-red-700 border border-red-700 rounded-md hover:bg-red-700 hover:text-whitebg"
                onClick={handleDelete}
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>
              <button
                type="submit"
                className="w-1/2 px-2 py-3 my-2 border rounded-md text-whitebg bg-zinc-700 hover:bg-zinc-600"
                onClick={displayNameSubmit}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-start mx-10 text-3xl font-medium">
            My Commission Listings
          </div>
          {userCommissionsList.length > 0 ? (
            <div className="mx-10 grid-container">
              {userCommissionsList.map((commission) => {
                return (
                  <CommissionCard key={commission.id} commission={commission} />
                );
              })}
            </div>
          ) : (
            <div className="mx-10 mt-5">
              You do not have any commissions listed.
            </div>
          )}
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

export default Settings;
