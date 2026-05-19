import express from 'express';
import { authLimiter } from '../middleware/rateLimiter.js';
import { createUser, getUsers, loginUser, getProfile, updateUserRole, getStaffUsers } from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';
 
export const userRouter = express.Router();


userRouter.post('/', authLimiter, createUser);

userRouter.get('/', verifyToken , getUsers);   // No rate limiting needed here as they require a valid token

userRouter.post('/login', authLimiter, loginUser);

userRouter.get('/me', verifyToken, getProfile);

userRouter.put('/:id/role', verifyToken, updateUserRole);

userRouter.get('/staff', verifyToken, getStaffUsers);