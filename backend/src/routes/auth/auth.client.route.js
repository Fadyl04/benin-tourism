import {Router} from 'express';
import {
    registerClientController,
    loginClientController,
    logoutClientController
} from '../../controllers/auth/auth.client.controller.js';
import { authenticate } from '../../middlewares/auth.middlewares.js'; 

const router = Router();

router.post('/register', registerClientController);
router.post('/login', loginClientController);
router.post('/logout', authenticate, logoutClientController);
export default router;