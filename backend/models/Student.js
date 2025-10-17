const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  studentId: { type: String, required: true, unique: true },
  education: String,
  major: String,
  degreeStart: String,
  degreeEnd: String,
  gender: String,
});

module.exports = mongoose.model("Student", studentSchema);
