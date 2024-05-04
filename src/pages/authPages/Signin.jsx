import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GooglePNG from "../../assets/google.png";
import { UserAuth } from "../../context/authContext";
import { useUserData } from "../../context/userDataContext";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, signIn } = UserAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { userData } = useUserData();

  useEffect(() => {
    if (user && userData && userData.onboarded == false) {
      navigate("/onboarding");
    } else if (user) {
      navigate(-1);
    }
  }, [user]);

  //function to handle sign in
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signIn(email, password);
    } catch (error) {
      // Handle authentication errors
      console.log(error.code);
      switch (error.code) {
        case "auth/invalid-credential":
          setError("invalid-credential");
          break;
        case "auth/invalid-email":
          setError("invalid-email");
          break;
        case "auth/missing-password":
          setError("missing-password");
          break;
        default:
          setError("An error occurred!");
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-start w-1/4 gap-5 px-8 py-20 border rounded-lg border-zinc-300">
        <h2 className="text-4xl font-bold">Sign In</h2>
        <form id="signin-form" className="w-full" onSubmit={handleSignIn}>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full py-3 pl-3 my-2 border rounded-md ${
              error === "invalid-credential" || error === "invalid-email"
                ? "border-red-500"
                : ""
            }`}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full py-3 pl-3 my-2 border rounded-md ${
              error === "invalid-credential" && "border-red-500"
            }`}
          />
          {error && (
            <p className="text-sm text-red-500">Error: {getErrorMsg(error)}</p>
          )}
          <button
            type="submit"
            className="w-full px-2 py-3 my-2 border rounded-md text-whitebg bg-zinc-700 hover:bg-zinc-600"
          >
            Sign In
          </button>
        </form>
        <p className="line">
          <span className="linespan">OR</span>
        </p>
        <button className="flex items-center justify-center w-full gap-2 px-2 py-3 border rounded-md bg-whitebg text-zinc-500 hover:bg-zinc-100">
          <span>
            <img className="w-8" src={GooglePNG} alt="Google Logo" />
          </span>
          Continue with Google
        </button>
        <p>
          New here?{" "}
          <span>
            <Link className="text-blue-500 hover:text-blue-400" to="/signup">
              Sign up
            </Link>
          </span>
        </p>
      </div>
    </div>
  );
};

//Translates error code to error message
const getErrorMsg = (error) => {
  switch (error) {
    case "invalid-credential":
      return "Your credential(s) are invalid.";
    case "invalid-email":
      return "Email is invalid.";
    case "missing-password":
      return "Please enter a password.";
    default:
      return error;
  }
};

export default Signin;
