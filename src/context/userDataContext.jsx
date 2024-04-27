import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { UserAuth } from "./authContext";
import { db } from "../firebase";

const UserDataContext = createContext();

export const useUserData = () => {
  return useContext(UserDataContext);
};

export const UserDataProvider = ({ children }) => {
  const { user } = UserAuth();
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user && user.uid) {
          const docRef = doc(db, "users", user.uid);
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

  return (
    <UserDataContext.Provider value={userData}>
      {children}
    </UserDataContext.Provider>
  );
};
