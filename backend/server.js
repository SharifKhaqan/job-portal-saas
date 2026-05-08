const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");

// Routes
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const userRoutes = require("./routes/userRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Config
dotenv.config();

// App init
const app = express();

app.use(cors());
app.use(express.json());

// Resume files are stored locally and served back to employers/admins.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Feature routes keep request validation and database work inside controllers.
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/user", userRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
