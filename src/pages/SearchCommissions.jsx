import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getDocs } from "firebase/firestore";
import { collection } from "firebase/firestore";
import { db } from "../firebase";
import CommissionCard from "../components/CommissionCard";

const SearchCommissions = () => {
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
    <div className="mb-32">
      <Navbar />
      <div className="mx-10 grid-container">
        {commissions.map((commission) => {
          return <CommissionCard key={commission.id} commission={commission} />;
        })}
      </div>
    </div>
  );
};

export default SearchCommissions;
