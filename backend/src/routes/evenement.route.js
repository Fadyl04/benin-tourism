import {Router} from 'express';
import {
    createEvenementController,
    getAllEvenementController,
    getEvenementByIdController,
    updateEvenementController,
    deleteEvenementController,
    searchEvenementController
} from '../controllers/evenement.controller.js';
import { upload } from '../middlewares/upload.middleware.js';
import {authenticate, adminRole} from '../middlewares/auth.middlewares.js';

const router = Router();

router.post('/create', adminRole, upload.single('image'), createEvenementController);
router.put('/update/:id', adminRole, upload.single('image'), updateEvenementController);
router.delete('/delete/:id',adminRole ,deleteEvenementController);

router.get('/show', authenticate, getAllEvenementController);
router.get('/search', searchEvenementController);
router.get('/:id', authenticate, getEvenementByIdController);

export default router;

