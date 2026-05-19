import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format- "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: "Access Denied. Token not found." });
    }

    try {
        // verifying token using our secret key and decode the payload (id, role)
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = verified;

        next(); 

    } catch (err) {
        res.status(403).json({ error: "Invalid or expired token." });
    }
};