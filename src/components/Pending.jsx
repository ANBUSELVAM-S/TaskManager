import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

function Pending() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("user_id");

  // ⏱ current date & time
  const now = new Date();
  const todayDate = now.toISOString().split("T")[0];
  const currentTime = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });

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
    <div className="dashboard">
      <Sidebar />

      <div style={{ padding: "20px",maxWidth: "790px" }}>
        <h1 style={{ textAlign: "center" }}>📋 Pending Tasks</h1>

        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : tasks.length === 0 ? (
          <div style={{ padding: "50px", textAlign: "center",maxWidth: "740px" }}>
            <p>No pending tasks 🎉</p>
            <p style={{ fontSize: "14px" }}>
              Add tasks from <strong>Task</strong> page
            </p>
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0,maxWidth: "800px" }}>
            {tasks.map(task => (
              <li
                key={task.id}
                style={{
                  padding: "10px", margin: "10px 0", width: "97%", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", borderRadius: "12px", boxShadow: "0 8px 25px rgba(0,0,0,0.15)", borderLeft: "5px solid #fff"
                }}
              >

                {/* Current date/time */}
                <div style={{ fontSize: "13px",width: "740px" }}>
                  Now: 📅 {todayDate} ⏰ {currentTime}
                </div>

                {/* Description */}
                <div style={{ fontSize: "15px",marginRight: "5rem",width:"45rem" }}>
                  {task.description}
                </div>

                {/* Actions */}
                <button
                  onClick={() => completeTask(task.id)}
                  style={{
                    background: "green",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    marginRight: "10px",
                    cursor: "pointer"
                  }}
                >
                  ✅ Completed
                </button>

                <button
                  onClick={() => deleteTask(task.id)}
                  style={{
                    background: "red",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  🗑 Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Pending;
