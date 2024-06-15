import React, { createContext, useContext, useState, useEffect } from "react";
import { onSnapshot, collection } from "firebase/firestore";
import { db } from "../firebase";

const CommissionsContext = createContext();

export const useCommissions = () => {
  return useContext(CommissionsContext);
};

export const CommissionsProvider = ({ children }) => {
  const [commissions, setCommissions] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "commissions"),
      (snapshot) => {
        const updatedCommissions = [];
        snapshot.forEach((doc) => {
          const commission = doc.data();
          if (!commission.primary && commission.published) {
            updatedCommissions.push(commission);
          }
        });
        setCommissions(updatedCommissions);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <CommissionsContext.Provider value={commissions}>
      {children}
    </CommissionsContext.Provider>
  );
};
