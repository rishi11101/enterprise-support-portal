import express from 'express';
import { createTicket, getTickets, updateTicketStatus, addReply, getReplies, assignTicket, getDashboardStats } from '../controllers/ticketController.js'
import { verifyToken } from '../middleware/auth.js';

export const ticketRouter = express.Router();



ticketRouter.post('/', verifyToken, createTicket);

ticketRouter.get('/', verifyToken, getTickets);

ticketRouter.get('/dashboard/stats', verifyToken, getDashboardStats);

ticketRouter.put('/:id', verifyToken, updateTicketStatus);

ticketRouter.post('/:id/replies', verifyToken, addReply);

ticketRouter.get('/:id/replies', verifyToken, getReplies);

ticketRouter.put('/:id/assign', verifyToken, assignTicket);