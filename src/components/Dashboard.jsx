import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "../styles/Dashboard.css";

function Dashboard() {
  const [counts, setCounts] = useState({
    total: 0,
    completed: 0,
    pending: 0
  });

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (userId) {
      fetchDashboardCounts();
    }
  }, [userId]);

  const fetchDashboardCounts = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/dashboard/counts?user_id=${userId}`
      );
      const data = await response.json();
      setCounts(data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <Navbar />

        <div className="cards">
          <div className="card">
            <h3>Total Tasks</h3>
            <p>{counts.total}</p>
          </div>

          <div className="card">
            <h3>Completed</h3>
            <p>{counts.completed}</p>
          </div>

          <div className="card">
            <h3>Pending</h3>
            <p>{counts.pending}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
