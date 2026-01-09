import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

function Task() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");

    if (storedUserId) {
      setUserId(Number(storedUserId)); // ✅ FIX
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date || !time || !description) {
      alert("Please fill all fields");
      return;
    }

    if (!userId) {
      alert("Please login first");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId, // ✅ now number
          date,
          time,
          description
        })
      });

      const result = await response.json();

      if (result.success) {
        alert("✅ Task added successfully!");
        setDate("");
        setTime("");
        setDescription("");
        
      } else {
        alert("❌ " + result.message);
      }
    } catch (error) {
      alert("❌ Server not responding");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div style={{ padding: "20px", maxWidth: "800px" }}>
        <h2>➕ Add New Task</h2>

        <p style={{ color: "green" }}>👤 User ID: {userId}</p>

        <form onSubmit={handleSubmit}>
          <input type="date" style={{height:"2rem"}} value={date} onChange={e => setDate(e.target.value)} required />
          <input type="time" style={{height:"2rem"}} value={time} onChange={e => setTime(e.target.value)} required />
          <textarea
            placeholder="Task description"
            style={{height:"2rem"}}
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} style={{height:"3rem",borderRadius:"8px",cursor:"pointer"}}>
            {loading ? "Adding..." : "Add Task"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Task;
