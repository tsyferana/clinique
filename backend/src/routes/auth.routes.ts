import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.me);
router.put('/change-password', authenticateToken, authController.changePassword);

export default router;
