import { query } from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await query(
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
            [name, email, hashedPassword, role || 'customer']
        );

        res.json(newUser.rows[0]);
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        
        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // jwt.sign() takes 3 args - payload, secret key and options
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error("Error logging in:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
};

export const getUsers = async (req, res) => {
    try {      
        const allUsers = await query("SELECT id, name, email, role FROM users");
        res.json(allUsers.rows);

    } catch (err) {
        console.error("Error fetching users:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
};


export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id; 

        const user = await query(
            "SELECT id, name, email, role FROM users WHERE id = $1",
            [userId]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }

        res.json(user.rows[0]);

    } catch (err) {
        console.error("Error fetching profile:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
};


export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;      // new role to be updated in this "id"
        const userRole = req.user.role; // Person making the request

        if (userRole !== 'admin') {
            return res.status(403).json({ error: "Access Denied. Admins only." });
        }

        const updatedUser = await query(
            "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role",
            [role, id]
        );

        if (updatedUser.rows.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }
        
        res.json(updatedUser.rows[0]);

    } catch (err) {
        console.error("Error updating role:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
};


export const getStaffUsers = async (req, res) => {
    try {
        const result = await query(
            "SELECT id, name, role FROM users WHERE role IN ('admin', 'staff')"
        );

        res.json(result.rows);
        
    } catch (error) {
        console.error("Fetch staff error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};