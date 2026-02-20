import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddTaskIcon from '@mui/icons-material/AddTask';
import DownloadingIcon from '@mui/icons-material/Downloading';
import LogoutIcon from '@mui/icons-material/Logout';

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
      <div className={`sidebar ${open ? "open" : ""}`}>
        <ul>
          <h2 className="manager">TaskManager</h2>
          <li onClick={() => navigate("/dashboard")}><DashboardIcon  /> Dashboard</li>
          <li onClick={() => navigate("/Task")}><AssignmentIcon/> Tasks</li>
          <li onClick={() => navigate("/Completed")}><AddTaskIcon  /> Completed</li>
          <li onClick={() => navigate("/Pending")}><DownloadingIcon /> Pending</li>
          <li onClick={handleLogout}><LogoutIcon /> Logout</li>
        </ul>
      </div>
    </>
  );
}

export default Sidebar;
