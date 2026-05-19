import { query } from '../db.js';

export const createTicket = async ( req, res ) => {
    try {
        const { title, description, priority } = req.body;

        const customerId = req.user.id; // coming from middleware

        const newTicket = await query(
            "INSERT INTO tickets (title, description, priority, customer_id) VALUES ($1, $2, $3, $4) RETURNING *",
            [title, description, priority || 'low', customerId]
        );

        res.status(201).json(newTicket.rows[0]);

    } catch (err) {
        console.error("Error creating ticket:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
};

export const getTickets = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // req.query allows accessing data at end of URL after the ? symbol( ?search=bug&status=open)
        const { search, status } = req.query;


        let queryText = `
            SELECT tickets.*, users.name AS customer_name, users.email AS customer_email 
            FROM tickets 
            JOIN users ON tickets.customer_id = users.id 
            WHERE 1=1
        `;

        let queryParams = [];
        let paramCount = 1;

        // customer see only their own tickets
        if (userRole === 'customer') {
            queryText += ` AND tickets.customer_id = $${paramCount}`;
            queryParams.push(userId);
            paramCount++;
        }

        // Status Filter
        if (status && status !== 'all') {
            queryText += ` AND tickets.status = $${paramCount}`;
            queryParams.push(status);
            paramCount++;
        }

        // Search Filter
        if (search) {
            queryText += ` AND (tickets.title ILIKE $${paramCount} OR users.name ILIKE $${paramCount} OR users.email ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
            paramCount++;
        }

        queryText += ` ORDER BY tickets.id DESC`;

        const tickets = await query(queryText, queryParams);
        res.json(tickets.rows);

    } catch (err) {
        console.error("Error fetching tickets:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
};


export const updateTicketStatus = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const { status } = req.body;
        const userRole = req.user.role;

        if (userRole == 'customer') {
            return res.status(403).json({ error: "Access Denied. Admins and Staffs only." });
        }

        const updatedTicket = await query(
            "UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *",
            [status, ticketId]
        );

        if (updatedTicket.rows.length === 0) {
            return res.status(404).json({ error: "Ticket not found." });
        }

        res.json(updatedTicket.rows[0]);

    } catch (err) {
        console.error("Error updating ticket:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
};


export const addReply = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const userId = req.user.id;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message cannot be empty." });
        }

        const newReply = await query(
            "INSERT INTO ticket_replies (ticket_id, user_id, message) VALUES ($1, $2, $3) RETURNING *",
            [ticketId, userId, message]
        );

        const fullReply = await query(
            `SELECT ticket_replies.*, users.name AS author_name, users.role AS author_role 
             FROM ticket_replies 
             JOIN users ON ticket_replies.user_id = users.id 
             WHERE ticket_replies.id = $1`,
            [newReply.rows[0].id]
        );

        const savedReply = fullReply.rows[0];

        // get the io instance set in server.js & emit the message to anyone in this ticket room
        const io = req.app.get('io');
        io.to(`ticket_${ticketId}`).emit('receive_reply', savedReply);

        res.status(201).json(savedReply);

    } catch (err) {
        console.error("Error adding reply:", err.message);
        

        if (err.code === '23503') {
            return res.status(404).json({ error: "Ticket not found." });
        }
        res.status(500).json({ error: "Server Error" });
    }
};



export const getReplies = async (req, res) => {
    try {
        const ticketId = req.params.id;

        const replies = await query(
            `SELECT ticket_replies.*, users.name AS author_name, users.role AS author_role 
             FROM ticket_replies 
             JOIN users ON ticket_replies.user_id = users.id 
             WHERE ticket_id = $1 
             ORDER BY ticket_replies.created_at ASC`,
            [ticketId]
        );

        res.json(replies.rows);

    } catch (err) {
        console.error("Error fetching replies:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
};


export const assignTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const { staff_id } = req.body;
        const userRole = req.user.role;

        if (userRole !== 'admin') {
            return res.status(403).json({ error: "Access Denied. Admins only." });
        }

        const updatedTicket = await query(
            "UPDATE tickets SET staff_id = $1 WHERE id = $2 RETURNING *",
            [staff_id, ticketId]
        );

        if (updatedTicket.rows.length === 0) {
            return res.status(404).json({ error: "Ticket not found." });
        }

        res.json({ 
            message: "Ticket successfully assigned!", 
            ticket: updatedTicket.rows[0] 
        });

    } catch (err) {
        console.error("Error assigning ticket:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
};


export const getDashboardStats = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.id;

        if (userRole === 'customer') {
            // Customer only see their own ticket stats
            const [total, open, resolved, recent] = await Promise.all([
                query("SELECT COUNT(*) FROM tickets WHERE customer_id = $1", [userId]),
                query("SELECT COUNT(*) FROM tickets WHERE status = 'open' AND customer_id = $1", [userId]),
                query("SELECT COUNT(*) FROM tickets WHERE status = 'resolved' AND customer_id = $1", [userId]),
                query(`SELECT tickets.*, users.email AS customer_email 
                       FROM tickets 
                       JOIN users ON tickets.customer_id = users.id 
                       WHERE customer_id = $1 
                       ORDER BY tickets.id DESC LIMIT 5`, [userId])
            ]);

            res.json({
                total: parseInt(total.rows[0].count),
                open: parseInt(open.rows[0].count),
                resolved: parseInt(resolved.rows[0].count),
                activeUsers: 1, // Customers don't need to see total users
                recentTickets: recent.rows
            });
        } else {

            const [total, open, resolved, usersCount, recent] = await Promise.all([
                query("SELECT COUNT(*) FROM tickets"),
                query("SELECT COUNT(*) FROM tickets WHERE status = 'open'"),
                query("SELECT COUNT(*) FROM tickets WHERE status = 'resolved'"),
                query("SELECT COUNT(*) FROM users"),
                query(`SELECT tickets.*, users.email AS customer_email 
                       FROM tickets 
                       JOIN users ON tickets.customer_id = users.id 
                       ORDER BY tickets.id DESC LIMIT 5`)
            ]);

            res.json({
                total: parseInt(total.rows[0].count),
                open: parseInt(open.rows[0].count),
                resolved: parseInt(resolved.rows[0].count),
                activeUsers: parseInt(usersCount.rows[0].count),
                recentTickets: recent.rows
            });
        }
    } catch (err) {
        console.error("Error fetching dashboard stats:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
};