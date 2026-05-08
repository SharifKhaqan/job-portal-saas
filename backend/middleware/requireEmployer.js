module.exports = (req, res, next) => {
  if (req.user?.role !== "employer") {
    return res.status(403).json({ message: "Only employers can perform this action" });
  }
  next();
};
