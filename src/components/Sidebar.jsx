import { useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <h2>TaskManage</h2>
      <ul>
        <li onClick={() => navigate("/dashboard")}>Dashboard</li>
        <li onClick={() => navigate("/Task")}>Tasks</li>
        <li onClick={() => navigate("/Pending")}>Pending</li>
        <li onClick={() => navigate("/")}>Logout</li>
      </ul>
    </div>
  );
}

export default Sidebar;
