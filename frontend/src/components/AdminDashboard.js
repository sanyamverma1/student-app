import React, { useEffect, useState } from "react";
import apiClient from "../api";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedStudent, setEditedStudent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch students
  const fetchStudents = async () => {
    try {
      const res = await apiClient.get("/api/admin/students");
      setStudents(res.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching students:", err);
      setError("Failed to load student data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Edit mode
  const handleEdit = (student) => {
    setEditingId(student._id);
    setEditedStudent({ ...student });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedStudent({});
  };

  const handleChange = (e, field) => {
    setEditedStudent({ ...editedStudent, [field]: e.target.value });
  };

  const handleSave = async (id) => {
    try {
      await apiClient.put(`/api/admin/students/${id}`, editedStudent);
      alert("✅ Student updated successfully!");
      setEditingId(null);
      fetchStudents();
    } catch (err) {
      console.error("❌ Error updating student:", err);
      alert("Failed to update student.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await apiClient.delete(`/api/admin/students/${id}`);
      alert("🗑️ Student deleted successfully!");
      fetchStudents();
    } catch (err) {
      console.error("❌ Error deleting student:", err);
      alert("Failed to delete student.");
    }
  };

  // ✅ Logout handler
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      navigate("/"); // Go back to login page
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold">🎓 Admin Dashboard</h2>
        <button className="btn btn-danger px-4" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {loading ? (
        <p className="text-center text-muted">Loading students...</p>
      ) : error ? (
        <p className="text-danger text-center">{error}</p>
      ) : (
        <div className="table-responsive shadow rounded">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Student ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Education</th>
                <th>Major</th>
                <th>Degree Start</th>
                <th>Degree End</th>
                <th>Gender</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student._id}>
                  <td>{index + 1}</td>

                  {[
                    "studentId",
                    "firstName",
                    "lastName",
                    "email",
                    "education",
                    "major",
                    "degreeStart",
                    "degreeEnd",
                    "gender",
                  ].map((field) => (
                    <td key={field}>
                      {editingId === student._id ? (
                        <input
                          type="text"
                          value={editedStudent[field] || ""}
                          onChange={(e) => handleChange(e, field)}
                          className="form-control form-control-sm"
                        />
                      ) : (
                        student[field] || "-"
                      )}
                    </td>
                  ))}

                  <td className="text-center">
                    {editingId === student._id ? (
                      <>
                        <button
                          className="btn btn-sm btn-success me-2"
                          onClick={() => handleSave(student._id)}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={handleCancel}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(student)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(student._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
