import {Router} from 'express';
import {
    registerPrestataireController,
    loginPrestataireController,
    changePasswordPrestataireController,
    deletePrestataireController,
    updatePrestataireController,
    showMePrestataireController
} from '../../controllers/auth/auth.prestataire.controller.js'
import { upload, uploadError } from '../../middlewares/upload.middleware.js';
import { authenticate, adminRole, prestataireRole} from '../../middlewares/auth.middlewares.js'; 
const router = Router()

router.post(
    '/register', 
    upload.fields([
        {name: 'document_justificatif', maxCount: 1 }, 
        {name: 'image', maxCount: 1}
    ]), 
    uploadError,
    registerPrestataireController
);

router.put(
    '/update/:id', 
    prestataireRole, 
    upload.fields([
        {name: 'document_justificatif', maxCount: 1 }, 
        {name: 'image', maxCount: 1}
    ]), 
    uploadError,
    updatePrestataireController
);

router.get('/show/myinfo', prestataireRole, showMePrestataireController);

router.post('/login', loginPrestataireController);
router.put('/change-password', authenticate, changePasswordPrestataireController);
router.delete('/delete/:id',adminRole, deletePrestataireController);




export default router;