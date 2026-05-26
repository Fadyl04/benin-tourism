import {Router} from 'express';
import {
    registerPrestataireController,
    loginPrestataireController,
    changePasswordPrestataireController,
    deletePrestataireController,
    updatePrestataireController,
    showMePrestataireController
} from '../../controllers/auth/auth.prestataire.controller.js'
import { uploadPrestataire } from '../../middlewares/upload.middleware.js'; 
import { authenticate, authorize} from '../../middlewares/auth.middlewares.js'; 
const router = Router()

router.post(
    '/register', 
    uploadPrestataire.fields([
        {name: 'document_justificatif', maxCount: 1 }, 
        {name: 'image', maxCount: 1}
    ]), 
    registerPrestataireController
);

router.put(
    '/update/:id', 
    authenticate,
    authorize('admin', 'prestataire'),
    uploadPrestataire.fields([
        {name: 'document_justificatif', maxCount: 1 }, 
        {name: 'image', maxCount: 1}
    ]), 
    updatePrestataireController
);

router.get('/show/myinfo', authenticate, authorize('admin', 'prestataire'), showMePrestataireController);

router.post('/login', loginPrestataireController);
router.put('/change-password', authenticate, authorize('admin', 'prestataire'), changePasswordPrestataireController);
router.delete('/delete/:id', authenticate, authorize('admin'), deletePrestataireController);




export default router;