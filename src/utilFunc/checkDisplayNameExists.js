import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const checkDisplayNameExists = async (displayName) => {
  try {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(
      query(
        usersRef,
        where("lowercaseDisplayName", "==", displayName.toLowerCase()) //For case insensitive comparison
      )
    );
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking displayName existence:", error);
    return true; // Consider it exists if an error occurs
  }
};
