require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const Student = require("./models/Student");
const seedData = require("./data/seed.json");

const app = express();
app.use(cors());
app.use(express.json());

/* ----------------------------------------------------------
   🧩 MongoDB connection
-------------------------------------------------------------*/
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/studentapp", {
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

/* ----------------------------------------------------------
   🧠 ADMIN LOGIN
-------------------------------------------------------------*/
const ADMIN_EMAIL = "admin@swin.edu.au";
const ADMIN_PASSWORD = "admin123"; // Can be hashed later

app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      console.log("✅ Admin logged in");
      return res.status(200).json({ message: "Admin login successful" });
    } else {
      console.log("❌ Invalid admin credentials");
      return res.status(401).json({ message: "Invalid admin credentials" });
    }
  } catch (err) {
    console.error("❌ Error during admin login:", err);
    res.status(500).json({ message: "Server error during admin login" });
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

/* ----------------------------------------------------------
   🧠 LOGIN OR REGISTER NEW STUDENT (email + password)
-------------------------------------------------------------*/
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    // ✅ Validate email domain
    if (!email.toLowerCase().endsWith("@student.swin.edu.au")) {
      return res.status(400).json({
        message:
          "Only Swinburne student emails are allowed (@student.swin.edu.au)",
      });
    }

    // 🔍 Check if student exists
    let student = await Student.findOne({ email });

    if (!student) {
      // 🆕 New user → hash their password and save
      const hashed = await bcrypt.hash(password, 10);
      const newStudent = new Student({ email, password: hashed });
      await newStudent.save();

      console.log(`🆕 New student registered: ${email}`);
      return res.status(201).json({
        message: "🆕 New student detected — continue registration",
        existing: false,
        email,
      });
    }

    // ✅ Existing user → verify password
    let isMatch = false;

    try {
      isMatch = await bcrypt.compare(password, student.password);
    } catch {
      console.warn("⚠️ bcrypt compare failed, using fallback check");
    }

    // Fallback if old record was plain-text
    if (!isMatch && password === student.password) {
      isMatch = true;
      const newHash = await bcrypt.hash(password, 10);
      student.password = newHash;
      await student.save();
      console.log(`🔒 Auto-rehashed plain password for ${email}`);
    }

    if (!isMatch) {
      console.log(`❌ Invalid password for ${email}`);
      return res
        .status(401)
        .json({ message: "Invalid password", existing: true });
    }

    console.log(`✅ Existing student logged in: ${email}`);
    return res.status(200).json({
      message: "✅ Welcome back!",
      existing: true,
      student,
    });
  } catch (err) {
    console.error("❌ Error during login:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

/* ----------------------------------------------------------
   🧠 SUBMIT / UPDATE STUDENT DETAILS
-------------------------------------------------------------*/
app.post("/api/submit", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Missing email in request" });
    }

    const payload = { ...req.body };
    delete payload._id;
    delete payload.__v;

    const existingStudent = await Student.findOne({ email });

    if (existingStudent) {
      // ✅ Update existing student details
      // Prevent accidental re-hashing if password hasn’t changed
      const existingStudent = await Student.findOne({ email });
      if (payload.password && payload.password !== existingStudent.password) {
        // If the password is new and not already hashed
        if (!payload.password.startsWith("$2b$")) {
          payload.password = await bcrypt.hash(payload.password, 10);
        }
      }

      const updatedStudent = await Student.findOneAndUpdate(
        { email },
        { $set: payload },
        { new: true }
      );
      console.log(`🔁 Updated student ${email}`);
      return res.status(200).json({
        message: "✅ Student details updated successfully!",
        student: updatedStudent,
      });
    }

    // 🆕 Create new student record
    const newStudent = new Student(payload);
    await newStudent.save();
    console.log(`🆕 New student registered: ${email}`);
    return res.status(201).json({
      message: "✅ Student registered successfully!",
      student: newStudent,
    });
  } catch (err) {
    console.error("❌ Error in /api/submit:", err);
    return res.status(500).json({
      message: "❌ Failed to submit form",
      error: err.message,
    });
  }
});

/* ----------------------------------------------------------
   🧠 ADMIN: VIEW, EDIT, DELETE STUDENTS
-------------------------------------------------------------*/

// GET all students
app.get("/api/admin/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch students" });
  }
});

// UPDATE student
app.put("/api/admin/students/:id", async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res
      .status(200)
      .json({ message: "✅ Student updated successfully", updated });
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to update student" });
  }
});

// DELETE student
app.delete("/api/admin/students/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "🗑️ Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to delete student" });
  }
});

/* ----------------------------------------------------------
   🧩 START SERVER
-------------------------------------------------------------*/
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
