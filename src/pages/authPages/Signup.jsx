import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GooglePNG from "../../assets/google.png";
import { UserAuth } from "../../context/authContext";
import { db } from "../../firebase";
import { collection, setDoc, doc } from "firebase/firestore";
import { sendEmailVerification } from "firebase/auth";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { createUser } = UserAuth();
  const [buttonDisabled, setButtonDisabled] = useState(false);
  //function to handle sign up
  const signUp = async (e) => {
    e.preventDefault();
    setError("");
    setButtonDisabled(true);
    //Checks if confirmPassword matches password
    if (password !== confirmPassword) {
      setError("mismatch-pass");
      setButtonDisabled(false);
      return;
    }
    try {
      //creates new user
      await createUser(email, password).then(async (cred) => {
        await sendEmailVerification(cred.user); //sends email verification if successful
        //sets userData in database
        setDoc(doc(collection(db, "users"), cred.user.uid), {
          uid: cred.user.uid,
          email: cred.user.email,
          onboarded: false,
          commissions: [],
        });
      });
      //redirects to onboarding page
      navigate("/onboarding");
    } catch (error) {
      //Handle sign up error
      switch (error.code) {
        case "auth/invalid-email":
          setError("invalid-email");
          break;
        case "auth/email-already-in-use":
          setError("email-in-use");
          break;
        case "auth/missing-password":
          setError("missing-password");
          break;
        case "auth/weak-password":
          setError("weak-pass");
          break;
        default:
          setError("An error occurred!");
      }
      setButtonDisabled(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-start w-1/4 gap-5 px-8 py-20 border rounded-lg border-zinc-300">
        <h2 className="text-4xl font-bold">Sign Up</h2>
        <p>Join the Inkkura community.</p>
        <form id="signup-form" className="w-full" onSubmit={signUp}>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full py-3 pl-3 my-2 border rounded-md ${
              error === "email-in-use" || error === "invalid-email"
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
              error === "weak-pass" || error === "missing-password"
                ? "border-red-500"
                : ""
            }`}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full py-3 pl-3 my-2 border rounded-md ${
              error === "mismatch-pass" && "border-red-500"
            }`}
          />
          {error && (
            <p className="text-sm text-red-500">Error: {getErrorMsg(error)}</p>
          )}
          <button
            type="submit"
            className="w-full px-2 py-3 my-2 border rounded-md text-whitebg bg-zinc-700 hover:bg-zinc-600"
            disabled={buttonDisabled}
          >
            Sign Up
          </button>
        </form>
        <p className="line">
          <span className="linespan">OR</span>
        </p>
        <button className="flex items-center justify-center w-full gap-2 px-2 py-3 border rounded-md bg-whitebg text-zinc-500 hover:bg-zinc-100">
          <span>
            <img className="w-8" src={GooglePNG} />
          </span>
          Continue with Google
        </button>
        <p>
          Already have an account?{" "}
          <span>
            <Link className="text-blue-500 hover:text-blue-400" to="/signin">
              Sign in
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
    case "invalid-email":
      return "Email is invalid.";
    case "email-in-use":
      return "Email already in use.";
    case "missing-password":
      return "Please enter a password.";
    case "weak-pass":
      return "Your password requires at least 6 characters.";
    case "mismatch-pass":
      return "Passwords do not match.";
    default:
      return "An error occurred!";
  }
};

export default Signup;
