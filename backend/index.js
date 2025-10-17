require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Student = require("./models/Student");

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/studentapp";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err
  
  ));

//  Check if student exists by ID
// ✅ Check if student exists by studentId
app.post("/api/check-student", async (req, res) => {
  try {
    const { studentId } = req.body; // now reading correctly

    if (!studentId) {
      return res.status(400).json({ error: "Missing student ID" });
    }

    const student = await Student.findOne({ studentId: studentId.trim() });
    if (student) {
      console.log(`✅ Existing student found: ${studentId}`);
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

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  // You can add database connection checks here in the future
  res.status(200).json({ status: "ok" });
});

//  Submit (register or update student)
app.post("/api/submit", async (req, res) => {
  try {
    console.log("📩 Received student data:", req.body);

    // 1) Pull studentId and validate
    const studentId = (req.body.studentId || "").trim();
    if (!studentId) {
      console.error(" Missing studentId in form submission");
      return res.status(400).json({ message: "Missing studentId" });
    }

    // 2) Whitelist fields (don’t let _id/__v slip through)
    const {
      firstName,
      lastName,
      email,
      password,
      education,
      major,
      degreeStart,
      degreeEnd,
      gender,
    } = req.body;

    // 3) Build a clean $set payload and remove undefined values
    const payload = {
      firstName,
      lastName,
      email,
      password,
      education,
      major,
      degreeStart,
      degreeEnd,
      gender,
    };
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    // 4) Does student already exist?
    const existing = await Student.findOne({ studentId });

    if (existing) {
      //  UPDATE (only set the provided fields)
      const updateResult = await Student.updateOne(
        { studentId },
        { $set: payload },
        { runValidators: true }
      );

      if (updateResult.matchedCount === 0) {
        // (Very rare) race condition: not found at update time
        return res.status(404).json({ message: "Student not found during update." });
      }

      const updatedStudent = await Student.findOne({ studentId });
      console.log(`🔁 Student ${studentId} updated successfully`);
      return res.status(200).json({
        message: " Student details updated successfully!",
        updatedStudent,
      });
    }

    //  CREATE (new student)
    const toCreate = new Student({
      studentId, // ensure we always set the key
      ...payload,
    });
    await toCreate.save();
    console.log(`🆕 New student ${studentId} registered`);
    return res.status(201).json({
      message: " Registration successful!",
      newStudent: toCreate,
    });

  } catch (err) {
    // Surface the real reason in logs & response
    console.error(" Error submitting student:", err);
    return res.status(500).json({
      message: " Failed to submit form",
      error: err?.message || String(err),
    });
  }
});

app.listen(5000, () => console.log(" Server running on http://localhost:5000"));
