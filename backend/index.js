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
   🧩 MongoDB connection & Conditional Seeding
-------------------------------------------------------------*/
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/studentapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("✅ MongoDB connected");
    await Student.deleteMany({});
    await Student.insertMany(seedData);
    console.log("Database reset and default students imported!");
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

/* ----------------------------------------------------------
   🧠 ADMIN LOGIN
-------------------------------------------------------------*/
const ADMIN_EMAIL = "admin@swin.edu.au";
const ADMIN_PASSWORD = "admin123";

app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      console.log("✅ Admin logged in");
      return res.status(200).json({ message: "Admin login successful" });
    }
    console.log("❌ Invalid admin credentials");
    return res.status(401).json({ message: "Invalid admin credentials" });
  } catch (err) {
    console.error("❌ Error during admin login:", err);
    res.status(500).json({ message: "Server error during admin login" });
  }
});

/* ----------------------------------------------------------
   🧠 STUDENT LOGIN / REGISTER
-------------------------------------------------------------*/
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    if (!email.toLowerCase().endsWith("@student.edu.au")) {
      return res
        .status(400)
        .json({ message: "Only Swinburne student emails are allowed." });
    }

    let student = await Student.findOne({ email });

    if (!student) {
      const hashed = await bcrypt.hash(password, 10);
      const newStudent = new Student({
        email,
        password: hashed,
        studentId: email.split("@")[0],
      });
      await newStudent.save();
      console.log(`🆕 New student registered: ${email}`);
      return res
        .status(201)
        .json({ message: "New student detected — continue registration" });
    }

    const isMatch =
      (await bcrypt.compare(password, student.password)) ||
      password === student.password;

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    console.log(`✅ Existing student logged in: ${email}`);
    return res
      .status(200)
      .json({ message: "Welcome back!", student, existing: true });
  } catch (err) {
    console.error("❌ Error during login:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

/* ----------------------------------------------------------
   🧠 STUDENT SUBMIT / UPDATE DETAILS
-------------------------------------------------------------*/
app.post("/api/submit", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Missing email in request" });

    const payload = { ...req.body };
    if (!payload.studentId) payload.studentId = email.split("@")[0];

    const updated = await Student.findOneAndUpdate(
      { email },
      { $set: payload },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: "✅ Student details saved successfully!",
      student: updated,
    });
  } catch (err) {
    console.error("❌ Error in /api/submit:", err);
    res.status(500).json({ message: "Failed to submit form" });
  }
});

/* ----------------------------------------------------------
   🧠 ADMIN: VIEW, EDIT, DELETE STUDENTS
-------------------------------------------------------------*/
app.get("/api/admin/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch students" });
  }
});

app.put("/api/admin/students/:id", async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res
      .status(200)
      .json({ message: "✅ Student updated successfully", updated });
  } catch {
    res.status(500).json({ message: "❌ Failed to update student" });
  }
});

app.delete("/api/admin/students/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "🗑️ Student deleted successfully" });
  } catch {
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