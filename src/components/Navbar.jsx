import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserAuth } from "../context/authContext";
import { useLocation } from "react-router-dom";
import { db } from "../firebase";
import { collection, updateDoc, doc, getDoc } from "firebase/firestore";

const Navbar = () => {
  const { user, logout } = UserAuth();
  const location = useLocation();
  const { pathname } = location;
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [userData, setUserData] = useState({});

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.reload();
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <nav>
      <ul className="flex justify-between">
        {pathname !== "/" ? (
          <button className="mx-5 my-5 text-3xl font-bold hover:text-blue-500">
            Inkkura
          </button>
        ) : (
          <div></div>
        )}

        <div
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative mx-5 my-5"
          ref={dropdownRef}
        >
          {user ? (
            <>
              <button
                id="user-settings"
                type="button"
                className="px-4 py-2 border rounded min-w-32 bg-zinc-100 hover:bg-zinc-200"
              >
                {userData.displayName ? userData.displayName : user.email}
              </button>
              {showDropdown && (
                <ul className="absolute w-full bg-white border rounded top-full">
                  <li>
                    <Link
                      to="/accsettings"
                      className="block w-full px-4 py-2 hover:bg-gray-100 hover:cursor-pointer"
                    >
                      Settings
                    </Link>
                  </li>
                  <li>
                    <button
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      Sign Out
                    </button>
                  </li>
                </ul>
              )}
            </>
          ) : (
            <div className="flex space-x-2">
              <Link to="/signin" className="px-6 py-2 hover:text-blue-500">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2 border rounded bg-zinc-100 hover:bg-zinc-200"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </ul>
    </nav>
  );
};

export default Navbar;
