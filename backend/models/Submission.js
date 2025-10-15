const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  message: String,
});

module.exports = mongoose.model("Submission", submissionSchema);
