import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";

function StudentForm() {
  const location = useLocation();
  const studentIdFromLogin = location.state?.studentId || "";
  const [studentIdInput, setStudentIdInput] = useState(studentIdFromLogin);
  const [step, setStep] = useState("check");
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
  const [isExistingStudent, setIsExistingStudent] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // ✅ Step 1: Check student ID
  const handleCheckStudent = async () => {
    console.log("DEBUG studentIdInput:", studentIdInput); 
    if (!studentIdInput.trim())
      return alert("Please enter your student ID to continue");

    try {
      const res = await axios.post("http://localhost:5000/api/check-student", {
        studentId: studentIdInput, // backend uses email field, but we’re treating ID as unique login
      });

      if (res.data.exists) {
        setForm(res.data.student);
        setIsExistingStudent(true);
        setStep("form");
        alert("Welcome back! View or edit your details below.");
      } else {
        setForm((prev) => ({ ...prev, studentId: studentIdInput }));
        setIsExistingStudent(false);
        setIsEditable(true);
        setStep("form");
        alert("New student detected. Please register below.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error while checking student ID.");
    }
  };

  // ✅ Handle input changes
  const handleChange = (e) => {
    if (!isEditable) return;
    setForm({ ...form, [e.target.name]: e.target.value });
    setHasChanges(true);
  };

  const handleDateChange = (field, date) => {
    if (!isEditable) return;
    setForm({ ...form, [field]: date });
    setHasChanges(true);
  };

  // ✅ Handle submit (register/update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        degreeStart: form.degreeStart.toISOString().split("T")[0],
        degreeEnd: form.degreeEnd.toISOString().split("T")[0],
      };

      const res = await axios.post("http://localhost:5000/api/submit", payload);
      setResponse(res.data.message);
      alert(res.data.message);

      // Go back to login/check page
      setStep("check");
      setIsExistingStudent(false);
      setIsEditable(false);
      setHasChanges(false);
      setStudentIdInput("");
    } catch (err) {
      console.error(err);
      setResponse("❌ Failed to submit form");
    }
  };

  // ✅ Handle Cancel
  const handleCancel = () => {
    setStep("check");
    setIsEditable(false);
    setIsExistingStudent(false);
    setStudentIdInput("");
    setHasChanges(false);
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #6a11cb, #2575fc)",
        padding: "40px 0",
      }}
    >
      {step === "check" ? (
        <div
          className="card p-5 shadow-lg text-center"
          style={{ maxWidth: "500px", width: "100%", borderRadius: "20px" }}
        >
          <h4 className="text-primary mb-3">🎓 Confirm Your Student ID</h4>
          <p className="fs-5 fw-bold text-dark mb-3">{studentIdInput}</p>
          <button className="btn btn-primary w-100" onClick={handleCheckStudent}>
            Continue
          </button> 
        </div>
      ) : (
        <div
          className="card shadow-lg p-5"
          style={{
            maxWidth: "900px",
            width: "100%",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.95)",
          }}
        >
          <h3 className="text-center mb-4 text-primary fw-bold">
            {isExistingStudent
              ? "Registered Student Details"
              : "New Student Registration"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* First & Last Name */}
              <div className="col-md-6">
                <label className="form-label">First Name</label>
                <input
                  className="form-control"
                  name="firstName"
                  value={form.firstName || ""}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Last Name</label>
                <input
                  className="form-control"
                  name="lastName"
                  value={form.lastName || ""}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
              </div>

              {/* Student ID */}
              <div className="col-md-6">
                <label className="form-label">Student ID</label>
                <input
                  className="form-control"
                  name="studentId"
                  value={form.studentId || ""}
                  disabled
                />
              </div>

              {/* Email */}
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={form.email || ""}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
              </div>

              {/* Password */}
              <div className="col-md-6">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={form.password || ""}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
              </div>

              {/* Education */}
              <div className="col-md-6">
                <label className="form-label">Education</label>
                <input
                  className="form-control"
                  name="education"
                  value={form.education || ""}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
              </div>

              {/* Major */}
              <div className="col-md-6">
                <label className="form-label">Major</label>
                <input
                  className="form-control"
                  name="major"
                  value={form.major || ""}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
              </div>

              {/* Degree Start & End */}
              <div className="col-md-6">
                <label className="form-label">Degree Start</label>
                <DatePicker
                  selected={new Date(form.degreeStart)}
                  onChange={(date) => handleDateChange("degreeStart", date)}
                  showMonthYearPicker
                  dateFormat="MMM yyyy"
                  className="form-control"
                  disabled={!isEditable}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Expected Graduation</label>
                <DatePicker
                  selected={new Date(form.degreeEnd)}
                  onChange={(date) => handleDateChange("degreeEnd", date)}
                  showMonthYearPicker
                  dateFormat="MMM yyyy"
                  className="form-control"
                  disabled={!isEditable}
                />
              </div>

              {/* Gender */}
              <div className="col-md-6">
                <label className="form-label d-block">Gender</label>
                <div className="d-flex">
                  <div className="form-check me-3">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={form.gender === "male"}
                      onChange={handleChange}
                      disabled={!isEditable}
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
                      disabled={!isEditable}
                      className="form-check-input"
                    />
                    <label className="form-check-label">Female</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-5 text-center d-flex justify-content-center gap-3">
              {isExistingStudent && !isEditable && (
                <button
                  type="button"
                  className="btn btn-warning px-4 py-2"
                  onClick={() => setIsEditable(true)}
                >
                  Edit
                </button>
              )}
              <button
                type="submit"
                className="btn btn-success px-4 py-2"
                disabled={isExistingStudent && (!hasChanges || !isEditable)}
              >
                {isExistingStudent ? "Update" : "Register"}
              </button>
              <button
                type="button"
                className="btn btn-secondary px-4 py-2"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>

          {response && (
            <p className="mt-3 text-center text-success fw-bold">{response}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default StudentForm;
