import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "../styles/Pending.css";


function Pending() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showPopup, setShowPopup] = useState(false);


  const userId = localStorage.getItem("user_id");

  // ⏱ current date & time
  const now = new Date();
  const todayDate = now.toISOString().split("T")[0];
  const currentTime = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const openTaskPopup = (task) => {
  setSelectedTask(task);
  setShowPopup(true);
};

const closePopup = () => {
  setShowPopup(false);
  setSelectedTask(null);
};


  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
  }, [userId]);

  // ✅ FETCH ONLY PENDING TASKS
  const fetchTasks = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/tasks?user_id=${userId}`
      );
      const data = await res.json();

      // filter pending only
      const pendingTasks = data.filter(
        task => task.status === "pending"
      );

      setTasks(pendingTasks);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ COMPLETE TASK
  const completeTask = async (id) => {
    await fetch(`http://localhost:5000/tasks/${id}/complete`, {
      method: "PUT"
    });

    setTasks(tasks.filter(task => task.id !== id));
  };

  // ✅ DELETE TASK
  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    await fetch(`http://localhost:5000/tasks/${id}`, {
      method: "DELETE"
    });

    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="dashboards">
      <Sidebar />

      <div className="pending-container">
  <h1 className="pending-title">📋 Pending Tasks</h1>

  {loading ? (
    <p className="loading-text">Loading...</p>
  ) : tasks.length === 0 ? (
    <div className="empty-box">
      <p>No pending tasks 🎉</p>
      <p className="empty-sub">
        Add tasks from <strong>Task</strong> page
      </p>
    </div>
  ) : (
    <ul className="task-list">
      {tasks.map(task => (
        <li
  key={task.id}
  className="task-card"
  onClick={() => openTaskPopup(task)}
>

          
          <div className="task-datetime">
            Now: 📅 {todayDate} ⏰ {currentTime}
          </div>

          <div className="task-desc">
            {task.description}
          </div>

          <div className="task-actions">
            <button
  className="btn-complete"
  onClick={(e) => {
    e.stopPropagation();
    completeTask(task.id);
  }}
>
  ✅ Completed
</button>

<button
  className="btn-delete"
  onClick={(e) => {
    e.stopPropagation();
    deleteTask(task.id);
  }}
>
  ❌ Delete
</button>

          </div>

        </li>
      ))}
    </ul>
  )}
</div>
{showPopup && selectedTask && (
  <div className="popup-overlay" onClick={closePopup}>
    <div className="popup-card" onClick={(e) => e.stopPropagation()}>
      
      <h2>📌 Task Details</h2>

      <p><strong>Description:</strong> {selectedTask.description}</p>
      <p><strong>Date:</strong> {selectedTask.date}</p>
      <p><strong>Time:</strong> {selectedTask.time}</p>
      <p><strong>Status:</strong> {selectedTask.status}</p>

      {selectedTask.assigned_by_admin && (
        <div className="assigned-by">
  👤 Assigned by: <strong>{selectedTask.assigned_by_admin}</strong>
</div>


      )}

      <button className="btn-close" onClick={closePopup}>
        Close
      </button>

    </div>
  </div>
)}


    </div>
  );
}

export default Pending;
