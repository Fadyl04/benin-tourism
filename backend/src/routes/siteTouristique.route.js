import {Router} from 'express';
import {
    createSiteController,
    getAllSiteController,
    getSiteByIdController,
    updateSiteController,
    deleteSiteController,
    searchSiteController
} from '../controllers/siteTouristique.controller.js';
import { upload } from '../middlewares/upload.middleware.js';
import { authenticate,adminRole } from '../middlewares/auth.middlewares.js';

const router = Router();

router.post('/create', adminRole, upload.single('image'), createSiteController);
router.put('/update/:id', adminRole, upload.single('image'), updateSiteController);
router.delete('/delete/:id', adminRole, deleteSiteController);

router.get('/show', authenticate, getAllSiteController);
router.get('/:id', authenticate, getSiteByIdController);
router.get('/search', searchSiteController);

export default router;