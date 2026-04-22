import jwt from "jsonwebtoken";
export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized: No token provided." });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: Invalid token format." });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    console.error("auth middleware error:", error.message);
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token." });
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied." });
    }

    next();
  };
};