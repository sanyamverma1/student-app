import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login.js";
// import StudentForm from "./components/StudentForm";
// import AdminDashboard from "./components/AdminDashboard";
// import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/login.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* <Route path="/form" element={<StudentForm />} /> */}
        {/* <Route path="/admin" element={<AdminDashboard />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
