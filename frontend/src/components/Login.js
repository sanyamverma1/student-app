import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

function Login() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (role === "student") {
      if (!email.endsWith("@student.edu")) {
        setError("Please use your student email address");
        return;
      }

      try {
        const res = await axios.post("http://localhost:5000/api/login", {
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

    if (role === "admin") {
      if (email === "admin@school.edu" && password === "admin123") {
        alert("Admin login successful!");
        navigate("/admin");
        return;
      }
    }

    setError("Invalid email or password");
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <select
            className="form-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label className="remember-me">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember me
        </label>

        <button type="submit">Login</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default Login;
