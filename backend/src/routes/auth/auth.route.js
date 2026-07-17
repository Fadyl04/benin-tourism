import {Router} from 'express';
import {
    loginUserController,
    registerClientController,
    registerPrestataireController,
    firstLoginChangePasswordController,
    requestPasswordResetController,
    resetPasswordController,
    logoutUserController
} from '../../controllers/auth/auth.controller.js';

import {authenticate} from '../../middlewares/auth.middlewares.js'; 
import { createUploadMiddleware } from '../../middlewares/upload.middleware.js';
import {authLimiter, forgotPasswordLimiter, resetPasswordLimiter} from '../../middlewares/rateLimit.middleware.js'; 



const router = Router();

/**
 * Upload prestataire
 */
const prestataireUpload = createUploadMiddleware('prestataires');

/* Authentification */


/**
 *  Login centralisé
 *  admin / client / prestataire
*/
router.post('/login', loginUserController, authLimiter);

/**
 * Register client
 */
router.post('/register/client', registerClientController);

/**
 * Register prestataire
 */
router.post(
    '/register/prestataire',

    prestataireUpload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'document_justificatif', maxCount: 1 }
    ]),

    registerPrestataireController
);

/**
 * Changement mot de passe premier login
 */
router.post('/first-login/change-password', authenticate, firstLoginChangePasswordController, );


/**
 * Demande reset password
 */
router.post('/forgot-password', forgotPasswordLimiter, requestPasswordResetController, forgotPasswordLimiter);

/**
 * Reset password
 */
router.post('/reset-password', resetPasswordLimiter, resetPasswordController, resetPasswordLimiter);

/**
 * Logout
 */
router.post('/logout', authenticate, logoutUserController);

export default router;