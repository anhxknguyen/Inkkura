import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signin from "./pages/authPages/Signin";
import Signup from "./pages/authPages/Signup";
import Onboarding from "./pages/authPages/Onboarding";
import { AuthContextProvider } from "./context/authContext";
import ProtectedRoute from "./pages/ProtectedRoute";
import { UserDataProvider } from "./context/userDataContext";
import Settings from "./pages/Settings";

const App = () => {
  return (
    <AuthContextProvider>
      <UserDataProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accsettings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </UserDataProvider>
    </AuthContextProvider>
  );
};

export default App;
