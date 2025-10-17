import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/studentForm.css';

function StudentForm() {
  const navigate = useNavigate();

  const [studentData] = useState({
    studentID: '120938467',
    email: '120938467@student.edu',
  });

  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });

  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log('Submitted:', { ...studentData, ...formData });
    setSuccessMessage('Form submitted successfully!');
    setFormData({ subject: '', message: '' });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="student-form-container">
      <h2>Student Form</h2>

      <form onSubmit={handleSubmit}>
        <label>Student ID</label>
        <input type="text" value={studentData.studentID} disabled />

        <label>Email</label>
        <input type="email" value={studentData.email} disabled />

        <label>Subject</label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Enter your subject"
          required
        />

        <label>Message</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Enter your message"
          rows="4"
          required
        ></textarea>

        <button type="submit">Submit</button>
      </form>

      {successMessage && <p className="success">{successMessage}</p>}

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default StudentForm;
