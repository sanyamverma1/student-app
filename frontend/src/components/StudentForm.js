import React, { useState } from "react";
import axios from "axios";

function StudentForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [response, setResponse] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/submit", form);
      setResponse(" Form submitted successfully!");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setResponse(" Failed to submit form");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Student Form</h3>
      <form onSubmit={handleSubmit} className="card p-3 shadow-sm">
        <input className="form-control mb-2" name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        <input className="form-control mb-2" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input className="form-control mb-2" name="subject" placeholder="Subject" value={form.subject} onChange={handleChange} />
        <textarea className="form-control mb-2" name="message" placeholder="Message" value={form.message} onChange={handleChange}></textarea>
        <button className="btn btn-success">Submit</button>
      </form>
      {response && <p className="mt-3 text-success">{response}</p>}
    </div>
  );
}

export default StudentForm;
