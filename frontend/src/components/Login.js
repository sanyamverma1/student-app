import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import apiClient from "../api";


function Login() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (role === "student") {
      if (!email.endsWith("@student.swin.edu.au")) {
        setError("Please use your Swinburne student email address");
        return;
      }

      try {
        const res = await apiClient.post("/api/login", {
          email,
          password,
        });

        if (res.status === 200) {
          alert("Student login successful!");
          const studentId = res.data.student.studentId;
          navigate("/student-form", { state: { studentId } });
        }
      } catch (err) {
        console.error("Login error:", err);
        setError(
          err.response?.data?.message || "Login failed. Please try again."
        );
      }
      return;
    }

    try {
      // 🧩 Admin login
      if (role === "admin") {
        const res = await apiClient.post("/api/admin/login", {
          email,
          password,
        });
        alert(res.data.message);
        navigate("/admin-dashboard");
        return;
      }

      // 🧩 Student login
      if (!email.toLowerCase().endsWith("@student.swin.edu.au")) {
        setError("Please use your Swinburne student email (e.g., studentId@student.swin.edu.au).");
        return;
      }

      const res = await apiClient.post("/api/login", {
        email,
        password,
      });

      const data = res.data;

      if (data.existing) {
        alert("Welcome back!");
        navigate("/student-form", {
          state: { email, existing: true, student: data.student },
        });
      } else {
        alert("New student detected — please complete your registration.");
        navigate("/student-form", { state: { email, existing: false } });
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      if (err.response?.status === 401) {
        setError("Invalid password.");
      } else if (err.response?.status === 400) {
        setError("Invalid email or missing credentials.");
      } else {
        setError("Server error. Please try again later.");
      }
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        {/* Role selector */}
        <div className="mb-3">
          <label htmlFor="role">Select Role</label>
          <select
            id="role"
            className="form-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Email input */}
        <div className="mb-3">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder={
              role === "student"
                ? "e.g., 103165193@student.swin.edu.au"
                : "e.g., admin@swin.edu.au"
            }
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            required
            className="form-control"
          />
        </div>

        {/* Password input */}
        <div className="mb-3">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-control"
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Login
        </button>

        {error && <p className="error mt-3 text-danger text-center">{error}</p>}
      </form>
    </div>
  );
}

export default Login;
