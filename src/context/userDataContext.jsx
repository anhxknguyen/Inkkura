import React, { createContext, useContext, useState, useEffect } from "react";
import { UserAuth } from "./authContext";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

//global variable to fetch and store user data
const UserDataContext = createContext();

export const UserDataProvider = ({ children }) => {
  const { user } = UserAuth();
  const [userData, setUserData] = useState({});

  //fetches and sets user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user && user.uid) {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [user]);

  //used to set user data to new data
  const updateUserData = (newData) => {
    setUserData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  return (
    <UserDataContext.Provider value={{ userData, updateUserData }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => useContext(UserDataContext);
