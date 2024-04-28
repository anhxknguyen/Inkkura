import Navbar from "../components/Navbar";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="h-full">
      <Navbar />
      <div className="flex items-center justify-between mx-20 my-5 h-4/5">
        <div className="flex flex-col">
          <h1 className="font-bold text-8xl">Inkkura</h1>
          <h2 className="text-3xl">bring your artistic visions to life.</h2>
          <Link
            to="/artistListings"
            className="w-1/2 px-6 py-2 mt-5 text-center border rounded-md text-whitebg bg-zinc-700 hover:bg-zinc-600"
          >
            Discover artists
          </Link>
        </div>
        <div className="flex items-center h-full">
          <img className="h-3/4" src={logo} />
        </div>
      </div>
    </div>
  );
};

export default Home;
