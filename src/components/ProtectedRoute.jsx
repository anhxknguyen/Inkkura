import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserAuth } from "../context/authContext";

// ProtectedRoute component to protect routes that require authentication.
//This is implemented pretty badly. Might need fix in future.
const ProtectedRoute = ({ children }) => {
  const { user } = UserAuth();
  const [loading, setLoading] = useState(true);

  // useEffect to set loading to false when user is loaded
  useEffect(() => {
    setLoading(!user);
  }, [user]);

  // setTimeout to set loading to false after 500ms. Prevents page from being blank when user is already loaded
  setTimeout(() => {
    setLoading(false);
  }, 500);

  // If user is not loaded, return blank page
  if (loading) {
    return <div className="flex justify-center h-full align-center"></div>;
  }

  // If user is not signed in, redirect to signin page
  if (!user) {
    return <Navigate to="/signin" />;
  }

  // If user is signed in, return the protected route
  return children;
};

export default ProtectedRoute;
