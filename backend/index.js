const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const formRoutes = require("./routes/formRoutes");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.2:27017/studentapp")
  .then(() => console.log(" MongoDB connected"))
  .catch((err) => console.error(" MongoDB connection error:", err));

app.use("/api", formRoutes);
app.post("/api/submit", async (req, res) => {
  try {
    console.log("Received form:", req.body); // optional debug
    res.status(200).json({ message: "Form submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit form" });
  }
});
app.listen(5000, () => console.log("Backend running on port 5000"));
