import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { createServer } from 'http'; 
import { Server } from 'socket.io';

import { userRouter } from './routes/userRoutes.js';
import { ticketRouter } from './routes/ticketRoutes.js'

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// upgrade Express to an HTTP server for Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// 'io' globally accessible to all controllers
app.set('io', io);

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_ticket', (ticketId) => {
        socket.join(`ticket_${ticketId}`);
        console.log(`User joined ticket room: ${ticketId}`);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});


// Routes
app.use('/api/users', userRouter);
app.use('/api/tickets', ticketRouter);


const PORT = process.env.PORT || 5000;

// listening on httpServer not on app
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});