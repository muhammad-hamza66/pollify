import jwt from "jsonwebtoken";

// Guard: JWT_SECRET must be present and strong (validated at startup in server.js)
const JWT_SECRET = process.env.JWT_SECRET;

export const protect = (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch {
        // Never leak JWT error details to the client
        res.status(401).json({ message: "Not authorized, token invalid" });
    }
};