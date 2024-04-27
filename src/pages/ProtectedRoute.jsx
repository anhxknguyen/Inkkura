import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserAuth } from "../context/authContext";
import { set } from "firebase/database";

const ProtectedRoute = ({ children }) => {
  const { user } = UserAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(!user);
  }, [user]);

  setTimeout(() => {
    setLoading(false);
  }, 500);

  if (loading) {
    return <div className="flex justify-center h-full align-center"></div>;
  }

  if (!user) {
    return <Navigate to="/signin" />;
  }

  return children;
};

export default ProtectedRoute;
