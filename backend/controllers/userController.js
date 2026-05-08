const User = require("../models/User");

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, skills, bio, phone, address } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (typeof email === "string" && email.trim() && email !== user.email) {
      // Candidate email can change, but it must remain unique globally.
      const existingUser = await User.findOne({ email: email.trim() });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "Email is already in use" });
      }
    }

    user.name = typeof name === "string" && name.trim() ? name.trim() : user.name;
    user.email = typeof email === "string" && email.trim() ? email.trim() : user.email;
    user.bio = typeof bio === "string" ? bio.trim() : user.bio;
    user.phone = typeof phone === "string" ? phone.trim() : user.phone;
    user.address = typeof address === "string" ? address.trim() : user.address;
    user.skills = typeof skills === "string"
      ? skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : user.skills;

    if (req.file) {
      // Store a public path; the actual file is served by /uploads in server.js.
      user.resume = `/uploads/resumes/${req.file.filename}`;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        phone: user.phone,
        address: user.address,
        skills: user.skills,
        resume: user.resume
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
