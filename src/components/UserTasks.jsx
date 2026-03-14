  import { useState, useEffect } from "react";
  import Sidebar from "./Sidebar";
  import "../styles/Pending.css"; // Reusing styles for consistency

  function UserTasks() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingTasks, setLoadingTasks] = useState(false);

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    useEffect(() => {
      if (role === "admin" && token) {
        fetchUsers();
      } else {
        setLoadingUsers(false);
      }
    }, [role, token]);

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await fetch("http://localhost:5000/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoadingUsers(false);
      }
    };

    const handleUserClick = async (user) => {
      setSelectedUser(user);
      setLoadingTasks(true);
      setTasks([]);
      try {
        // Admins can fetch all tasks, then we filter on the client.
        const res = await fetch(`http://localhost:5000/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allTasks = await res.json();
        // Filter tasks for the selected user by matching the user ID.
        // This is more robust than matching by email string.
        const userTasks = allTasks.filter(task => task.user_id === user.id);

// sort by priority
        const sortedTasks = sortTasksByPriority(userTasks);

        setTasks(sortedTasks);
      } catch (err) {
        console.error(`Failed to fetch tasks for user ${user.id}`, err);
      } finally {
        setLoadingTasks(false);
      }
    };

    const sortTasksByPriority = (tasks) => {
  const priorityOrder = {
    high: 1,
    medium: 2,
    low: 3,
  };

  return tasks.sort((a, b) => {
    return priorityOrder[a.priority?.toLowerCase()] - priorityOrder[b.priority?.toLowerCase()];
  });
};

    const getPriorityClass = (priority) => {
      const p = priority?.toLowerCase();
      if (p === 'high') return 'priority-high';
      if (p === 'medium') return 'priority-medium';
      if (p === 'low') return 'priority-low';
      return '';
    };

    if (role !== "admin") {
      return (
        <div className="dashboards">
          <Sidebar />
          <div className="pending-container">
            <h2>⛔ Access Denied</h2>
            <p>Only Admins can view this page.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="dashboards">
        <Sidebar />
        <div className="pending-container" style={{ display: "flex", gap: "20px", alignItems: 'flex-start' }}>
          <div style={{ flex: 1, borderRight: '1px solid #ccc', paddingRight: '20px', height: 'calc(100vh - 100px)', overflowY: 'auto' }}>
            <h1 className="pending-title">👥 Users</h1>
            {loadingUsers ? (
              <p>Loading users...</p>
            ) : (
              <ul className="task-list">
                {users.map((user) => (
                  <li
                    key={user.id}
                    className="task-card"
                    onClick={() => handleUserClick(user)}
                    style={{
                      cursor: "pointer",
                      color:"black",
                      backgroundColor: selectedUser?.id === user.id ? "rgb(255, 255, 255)" : "white",
                      borderLeft: selectedUser?.id === user.id ? '6px solid #007bff' : '6px solid transparent'
                    }}
                  >
                    {user.email}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div style={{ flex: 2, height: 'calc(100vh - 100px)', overflowY: 'auto' }}>
            <h1 className="pending-title">
              {selectedUser ? `Tasks for ${selectedUser.email}` : "Select a user to see their tasks"}
            </h1>
            {loadingTasks ? (
              <p>Loading tasks...</p>
            ) : !selectedUser ? (
              <div className="empty-box"><p>Please select a user from the list.</p></div>
            ) : tasks.length === 0 ? (
              <div className="empty-box"><p>No tasks assigned to this user. 🎉</p></div>
            ) : (
              <ul className="task-list">
                {tasks.map((task) => (
                  <li key={task.id} className="task-card" style={{ borderLeft: task.status === "completed" ? '6px solid #28a745' : '6px solid #ffc107' }}>
                    <div className="task-datetime">📅 {new Date(task.date).toLocaleDateString("en-IN")} ⏰ {new Date(`1970-01-01T${task.time}`).toLocaleTimeString("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true
})}</div>
                    <div className="task-desc">{task.description}</div>
                    <div style={{ textTransform: "capitalize", fontWeight: "bold", color: task.status === "completed" ? "#28a745" : "#ffc107" }}>
                      Status: {task.status}
                    </div>
                    <div className={`task-priority ${getPriorityClass(task.priority)}`} style={{marginTop: '10px',color: 'black'}}>
                      Priority: {task.priority || 'Medium'}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  export default UserTasks;