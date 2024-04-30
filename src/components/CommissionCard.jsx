import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CommissionCard = ({ commission }) => {
  const title = commission.title;
  const priceRange = commission.priceRange;
  const artistUID = commission.artist;
  const images = commission.images;
  const estimatedCompletion = 14;
  const [artistDisplayName, setArtistDisplayName] = useState(null);

  useEffect(() => {
    const fetchArtistDisplayName = async () => {
      try {
        const artistDoc = doc(db, "users", artistUID);
        const artistSnapshot = await getDoc(artistDoc);
        if (artistSnapshot.exists()) {
          const artistData = artistSnapshot.data();
          const displayName = artistData.displayName;
          setArtistDisplayName(displayName);
        } else {
          setArtistDisplayName("Unknown Artist");
        }
      } catch (error) {
        console.error("Error fetching artist display name:", error);
        setArtistDisplayName("Unknown Artist");
      }
    };

    fetchArtistDisplayName();
  }, []);

  return (
    <Link
      to={`/commission/${commission.id}`}
      className="p-2 rounded-md hover:bg-zinc-100 grid-item"
    >
      <div className="flex flex-col gap-1">
        <img
          className="object-cover h-64 rounded-md hover:object-contain bg-zinc-100"
          src={images[0]}
        />
        <div className="flex items-center justify-between text-sm">
          <div>{artistDisplayName}</div>
          <div className="p-1 bg-green-200 rounded-md">
            ${priceRange[0]} - ${priceRange[1]}
          </div>
        </div>
        <div className="font-medium text-md">{title}</div>
        <div className="text-sm">
          Estimated Completion: {estimatedCompletion} days
        </div>
      </div>
    </Link>
  );
};

export default CommissionCard;
