const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const auth = (roles = []) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // ✅ Use fallback for compatibility
      const userId = decoded.userId || decoded._id;

      if (!userId) {
        return res.status(401).json({ error: "Invalid token payload: userId missing" });
      }

      req.user = {
        userId,
        role: decoded.role,
        username: decoded.username,
        fullname: decoded.fullname,
      };

      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      next();
    } catch (err) {
      console.error("Auth error:", err);
      res.status(401).json({ error: "Invalid token" });
    }
  };
};

module.exports = auth;
