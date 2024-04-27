import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserAuth } from "../context/authContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserData } from "../context/userDataContext";

const Navbar = () => {
  const { user, logout } = UserAuth();
  const location = useLocation();
  const { pathname } = location;
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { userData } = useUserData();
  const [displayName, setDisplayName] = useState(userData.displayName || "");
  const protectedRoutes = ["/accsettings", "/onboarding"];

  useEffect(() => {
    setDisplayName(userData.displayName || "");
  }, [userData.displayName, userData]);

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
      if (protectedRoutes.includes(pathname)) {
        navigate("/");
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <nav>
      <ul className="flex justify-between">
        {pathname !== "/" ? (
          <Link
            to="/"
            className="mx-5 my-5 text-3xl font-bold hover:text-blue-500"
          >
            Inkkura
          </Link>
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
                {displayName || user.email}
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
