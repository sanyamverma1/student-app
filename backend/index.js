const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Student = require("./models/Student");
const seedData = require("./data/seed.json");

const app = express();
app.use(cors());
app.use(express.json());

//  MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/studentapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async() => {
    console.log(" MongoDB connected")
    
    await Student.deleteMany({});
    await Student.insertMany(seedData);
    console.log("Database reset and default students imported!");

  })

  .catch((err) => console.error(" MongoDB connection error:", err));

// ✅ Check if student exists
app.post("/api/check-student", async (req, res) => {
  try {
    const { studentId } = req.body; // frontend sends studentId here
    
    if (!studentId) {
      console.error("❌ Missing student ID in request");
      return res.status(400).json({ error: "Missing student ID" });
    }

    const student = await Student.findOne({ studentId });
    if (student) {
      console.log(`🔎 Found student: ${studentId}`);
      return res.status(200).json({ exists: true, student });
    } else {
      console.log(`🆕 New student detected: ${studentId}`);
      return res.status(200).json({ exists: false });
    }
  } catch (err) {
    console.error("❌ Error checking student:", err);
    res.status(500).json({ error: "Server error while checking student" });
  }
});
// Login route
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const studentId = email.split("@")[0];
    console.log(`Login attempt: ${email} => studentId: ${studentId}`);

    const student = await Student.findOne({ studentId });

    if (!student) {
      console.log(`No student found with ID: ${studentId}`);
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.password !== password) {
      console.log(`Incorrect password for: ${email}`);
      return res.status(401).json({ message: "Invalid password" });
    }

    console.log(`Login successful for: ${email}`);
    return res.status(200).json({
      message: "Login successful!",
      student,
    });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

//  Submit (register or update student)
app.post("/api/submit", async (req, res) => {
  try {
    const studentId = req.body.studentId?.trim();
    if (!studentId) {
      return res.status(400).json({ message: "Missing studentId" });
    }

    const payload = { ...req.body };
    delete payload._id;
    delete payload.__v;

    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      const updated = await Student.findOneAndUpdate(
        { studentId },
        { $set: payload },
        { new: true }
      );
      console.log(`🔁 Updated student ${studentId}`);
      return res.status(200).json({
        message: "✅ Student details updated successfully!",
        student: updated,
      });
    }

    const newStudent = new Student(payload);
    await newStudent.save();
    console.log(`🆕 Registered new student: ${studentId}`);
    return res
      .status(201)
      .json({ message: "✅ Student registered successfully!", student: newStudent });
  } catch (err) {
    console.error("❌ Error submitting student:", err);
    return res.status(500).json({
      message: "❌ Failed to submit form",
      error: err.message,
    });
  }
});
app.get("/api/submissions", async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

app.listen(5000, () => console.log(" Server running on http://localhost:5000"));


