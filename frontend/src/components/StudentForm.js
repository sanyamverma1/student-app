import React, { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";

function StudentForm() {
  const [step, setStep] = useState("check");
  const [studentIdInput, setStudentIdInput] = useState("");
  const [isExistingStudent, setIsExistingStudent] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [response, setResponse] = useState("");

  const emptyForm = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    studentId: "",
    education: "",
    major: "",
    degreeStart: new Date(),
    degreeEnd: new Date(),
    gender: "",
  };

  const [form, setForm] = useState(emptyForm);

  // ✅ Step 1: Check Student ID
  const handleCheckStudent = async () => {
    if (!studentIdInput.trim()) return alert("Please enter your student ID");

    // Reset form first
    setForm({ ...emptyForm, studentId: studentIdInput });

    try {
      const res = await axios.post("http://localhost:5000/api/check-student", {
        studentId: studentIdInput.trim(),
      });

      if (res.data.exists) {
        setForm(res.data.student);
        setIsExistingStudent(true);
        setStep("form");
        alert("Welcome back! You can view or edit your details.");
      } else {
        setIsExistingStudent(false);
        setIsEditable(true);
        setStep("form");
        alert("New student — please complete registration.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error while checking student ID.");
    }
  };

  // ✅ Handle input change
  const handleChange = (e) => {
    if (!isEditable && isExistingStudent) return;
    setForm({ ...form, [e.target.name]: e.target.value });
    setHasChanges(true);
  };

  // ✅ Handle date changes
  const handleDateChange = (field, date) => {
    if (!isEditable && isExistingStudent) return;
    setForm({ ...form, [field]: date });
    setHasChanges(true);
  };

  // ✅ Submit (register or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        degreeStart: form.degreeStart.toISOString().split("T")[0],
        degreeEnd: form.degreeEnd.toISOString().split("T")[0],
      };

      const res = await axios.post("http://localhost:5000/api/submit", payload);
      alert(res.data.message);
      setResponse(res.data.message);

      // ✅ Reset back to login
      setForm(emptyForm);
      setStep("check");
      setStudentIdInput("");
      setIsEditable(false);
      setIsExistingStudent(false);
      setHasChanges(false);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to submit form");
      setResponse("❌ Failed to submit form");
    }
  };

  // ✅ Cancel
  const handleCancel = () => {
    setStep("check");
    setForm(emptyForm);
    setStudentIdInput("");
    setIsEditable(false);
    setIsExistingStudent(false);
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
          <h4 className="text-primary mb-3">🎓 Student Login / Registration</h4>
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Enter your Student ID"
            value={studentIdInput}
            onChange={(e) => setStudentIdInput(e.target.value)}
          />
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
                  value={form.firstName}
                  onChange={handleChange}
                  disabled={isExistingStudent && !isEditable}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Last Name</label>
                <input
                  className="form-control"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  disabled={isExistingStudent && !isEditable}
                />
              </div>

              {/* Student ID */}
              <div className="col-md-6">
                <label className="form-label">Student ID</label>
                <input
                  className="form-control"
                  name="studentId"
                  value={form.studentId}
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
                  value={form.email}
                  onChange={handleChange}
                  disabled={isExistingStudent && !isEditable}
                />
              </div>

              {/* Password */}
              <div className="col-md-6">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={isExistingStudent && !isEditable}
                />
              </div>

              {/* Education */}
              <div className="col-md-6">
                <label className="form-label">Education</label>
                <input
                  className="form-control"
                  name="education"
                  value={form.education}
                  onChange={handleChange}
                  disabled={isExistingStudent && !isEditable}
                />
              </div>

              {/* Major */}
              <div className="col-md-6">
                <label className="form-label">Major</label>
                <input
                  className="form-control"
                  name="major"
                  value={form.major}
                  onChange={handleChange}
                  disabled={isExistingStudent && !isEditable}
                />
              </div>

              {/* Degree Dates */}
              <div className="col-md-6">
                <label className="form-label">Degree Start</label>
                <DatePicker
                  selected={new Date(form.degreeStart)}
                  onChange={(date) => handleDateChange("degreeStart", date)}
                  showMonthYearPicker
                  dateFormat="MMM yyyy"
                  className="form-control"
                  disabled={isExistingStudent && !isEditable}
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
                  disabled={isExistingStudent && !isEditable}
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
                      disabled={isExistingStudent && !isEditable}
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
                      disabled={isExistingStudent && !isEditable}
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
