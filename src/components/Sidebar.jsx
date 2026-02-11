import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";
import DashboardIcon from '@mui/icons-material/Dashboard';

function Sidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    navigate("/");
  };



  return (
    <>
      {/* Hamburger Button */}
      <div className="hamburger" onClick={() => setOpen(!open)} >
        ☰
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${open ? "open" : ""}`} style={{height:"93.5vh"}}>
        <ul>
          <h2>TaskManager</h2>
          <li onClick={() => navigate("/dashboard")}> Dashboard</li>
          <li onClick={() => navigate("/Task")}>Tasks</li>
          <li onClick={() => navigate("/Pending")}>Pending</li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </div>
    </>
  );
}

export default Sidebar;
