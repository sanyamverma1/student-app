import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function StudentForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    studentId: "",
    education: "",
    major: "",
    degreeStart: new Date("2021-01-01"),
    degreeEnd: new Date("2025-12-01"),
    gender: "",
  });

  const [response, setResponse] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        degreeStart: form.degreeStart.toISOString().split("T")[0],
        degreeEnd: form.degreeEnd.toISOString().split("T")[0],
      };

      await axios.post("http://localhost:5000/api/submit", payload);
      setResponse("✅ Form submitted successfully!");
    } catch (err) {
      console.error(err);
      setResponse("❌ Failed to submit form");
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #1e90ff, #6a11cb)",
        padding: "40px 0",
      }}
    >
      <div
        className="card shadow-lg p-5"
        style={{
          maxWidth: "800px",
          width: "100%",
          borderRadius: "20px",
          background: "rgba(255, 255, 255, 0.95)",
        }}
      >
        <h3 className="text-center mb-4 text-primary fw-bold">
          🎓 Student Registration Form
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* First & Last Name */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">First Name</label>
              <input
                className="form-control"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Last Name</label>
              <input
                className="form-control"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                required
              />
            </div>

            {/* Email & Password */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
            </div>

            {/* Student ID & Education */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">Student ID</label>
              <input
                className="form-control"
                name="studentId"
                value={form.studentId}
                onChange={handleChange}
                placeholder="Enter student ID"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Education</label>
              <input
                className="form-control"
                name="education"
                value={form.education}
                onChange={handleChange}
                placeholder="e.g. Bachelor of Engineering"
              />
            </div>

            {/* Major */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">Major</label>
              <input
                className="form-control"
                name="major"
                value={form.major}
                onChange={handleChange}
                placeholder="e.g. Software Engineering"
              />
            </div>

            {/* Degree Dates */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">Degree Start</label>
              <DatePicker
                selected={form.degreeStart}
                onChange={(date) => setForm({ ...form, degreeStart: date })}
                dateFormat="MMM yyyy"
                showMonthYearPicker
                className="form-control"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Expected Graduation
              </label>
              <DatePicker
                selected={form.degreeEnd}
                onChange={(date) => setForm({ ...form, degreeEnd: date })}
                dateFormat="MMM yyyy"
                showMonthYearPicker
                className="form-control"
              />
            </div>

            {/* Gender */}
            <div className="col-md-6">
              <label className="form-label fw-semibold d-block">Gender</label>
              <div className="d-flex">
                <div className="form-check me-4">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={form.gender === "male"}
                    onChange={handleChange}
                    className="form-check-input"
                  />
                  <label className="form-check-label">Male</label>
                </div>
                <div className="form-check">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={form.gender === "female"}
                    onChange={handleChange}
                    className="form-check-input"
                  />
                  <label className="form-check-label">Female</label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-5 text-center">
            <button
              className="btn btn-primary px-5 py-2"
              style={{
                background: "linear-gradient(90deg, #6a11cb, #2575fc)",
                border: "none",
                borderRadius: "10px",
                fontWeight: "bold",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.target.style.background =
                  "linear-gradient(90deg, #2575fc, #6a11cb)")
              }
              onMouseLeave={(e) =>
                (e.target.style.background =
                  "linear-gradient(90deg, #6a11cb, #2575fc)")
              }
              type="submit"
            >
              Submit
            </button>
          </div>
        </form>

        {response && (
          <p className="mt-4 text-center fw-bold text-success fs-5">
            {response}
          </p>
        )}
      </div>
    </div>
  );
}

export default StudentForm;
