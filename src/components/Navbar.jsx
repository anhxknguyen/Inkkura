import { useState, useRef, useEffect } from "react";
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

  // Update display name when user data changes
  useEffect(() => {
    setDisplayName(userData.displayName || "");
  }, [userData.displayName, userData]);

  // Close dropdown when clicked outside of dropdown
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

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await logout();
      //If user is on a protected route, redirect to home page. Else, reload the page.
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
          <Link to="/" className="mx-5 my-5 text-3xl font-bold hover:text-pink">
            Inkkura
          </Link>
        ) : (
          <div></div>
        )}

        <div className="flex items-center gap-5 mx-5 my-5">
          <Link to="/searchcommissions" className="py-2 hover:text-pink">
            Browse
          </Link>
          {user && (
            <Link
              to="/createCommission"
              className="px-4 py-2 border border-black rounded hover:bg-pink hover:cursor-pointer"
            >
              +
            </Link>
          )}
          {user ? (
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              ref={dropdownRef}
              className="relative flex items-center justify-between gap-10"
            >
              <button
                id="user-settings"
                type="button"
                className="px-4 py-2 bg-white border border-black rounded-md min-w-32 hover:bg-pink"
              >
                {displayName || user.email}
              </button>
              {showDropdown && (
                <ul className="absolute w-full bg-white border-b border-black rounded-b-md border-x top-full">
                  <li>
                    <Link
                      to="/accsettings"
                      className="block w-full px-4 py-2 hover:bg-pink hover:cursor-pointer"
                    >
                      Settings
                    </Link>
                  </li>
                  <li>
                    <button
                      className="block w-full px-4 py-2 text-left hover:bg-pink"
                      onClick={handleLogout}
                    >
                      Sign Out
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <div className="flex space-x-2">
              <Link to="/signin" className="px-4 py-2 hover:text-pink">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 border rounded bg-zinc-100 hover:bg-zinc-200"
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
