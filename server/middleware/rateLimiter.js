import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, 
    message: { error: "Too many attempts, please try again after 15 minutes." },
    standardHeaders: true, 
    legacyHeaders: false, 
});