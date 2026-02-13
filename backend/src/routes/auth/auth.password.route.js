
import express from 'express';
import { forgotPasswordController } from '../../controllers/auth/forgotPassword.controller.js';
import { resetPasswordController } from '../../controllers/auth/resetPassword.controller.js';

const router = express.Router();

router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);

export default router;
