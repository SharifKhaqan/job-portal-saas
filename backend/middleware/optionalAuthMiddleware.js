const jwt = require("jsonwebtoken");

module.exports = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  // Public endpoints can still personalize results when a valid token exists.
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

  if (!token) {
    return next();
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    req.user = null;
  }

  return next();
};
