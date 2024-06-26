import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signin from "./pages/authPages/Signin";
import Signup from "./pages/authPages/Signup";
import Onboarding from "./pages/authPages/Onboarding";
import { AuthContextProvider } from "./context/authContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserDataProvider } from "./context/userDataContext";
import Settings from "./pages/Settings";
import SearchCommissions from "./pages/SearchCommissions";
import CreateCommission from "./pages/CreateCommission";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "./firebase";
import { getDocs, collection } from "firebase/firestore";
import CommissionPage from "./pages/CommissionPage";
import EditCommission from "./pages/EditCommission";

const App = () => {
  const [commissions, setCommissions] = useState([]);

  useEffect(() => {
    const findAllCommissions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "commissions"));
        const allCommissions = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().primary) {
            return;
          }
          allCommissions.push(doc.data());
        });
        const filteredCommissions = allCommissions.filter((commission) => {
          return (
            !commission.hasOwnProperty("primary") &&
            commission.published === true
          );
        });
        setCommissions(filteredCommissions);
      } catch (error) {
        console.error("Error getting commissions:", error);
      }
    };

    findAllCommissions();
  }, []);

  return (
    <AuthContextProvider>
      <UserDataProvider>
        <Routes>
          <Route path="/" element={<Home />} key={document.location.href} />
          <Route
            path="/signin"
            element={<Signin />}
            key={document.location.href}
          />
          <Route
            path="/signup"
            element={<Signup />}
            key={document.location.href}
          />
          <Route
            path="onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
            key={document.location.href}
          />
          <Route
            path="/accsettings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
            key={document.location.href}
          />
          <Route
            path="/searchCommissions"
            element={<SearchCommissions />}
            key={document.location.href}
          />
          <Route
            path="/createCommission"
            element={
              <ProtectedRoute>
                <CreateCommission />
              </ProtectedRoute>
            }
            key={document.location.href}
          />
          {commissions.map((commission) => {
            return (
              <Route
                key={commission.id}
                path={`/commission/${commission.id}`}
                element={<CommissionPage commission={commission} />}
              />
            );
          })}
          {commissions.map((commission) => {
            return (
              <Route
                key={`edit-${commission.id}`}
                path={`/editcommission/${commission.id}`}
                element={<EditCommission commission={commission} />}
              />
            );
          })}
        </Routes>
      </UserDataProvider>
    </AuthContextProvider>
  );
};

export default App;
