import {Router} from 'express';
import {loginAdminController, logoutAdminController} from '../../controllers/auth/auth.admin.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middlewares.js';
import { 
    getAllPrestatairesController,
    validerPrestataireController,
    refuserPrestataireController,
    entretienPrestataireController,
    demandeEnAttenteController,
    countAllPrestatairesController,
    countPrestatairesByTypeController,
    countPrestatairesEnAttenteController,
    countPrestatairesRejetesController,
    countPrestatairesValidesController,
    getPrestatairesStatsController,
    getEventStatsController,
    getVisitStatsController,
    getGlobalStatsController
} from '../../controllers/auth/auth.admin.controller.js';

const router = Router();

router.post('/login', loginAdminController);
router.post("/logout", authenticate, authorize('admin'), logoutAdminController);

/**
 * Gestion des prestataires
 */
router.get('/prestataires', authenticate, authorize('admin'), getAllPrestatairesController);
router.post('/prestataires/:Iduser/valider', authenticate, authorize('admin'), validerPrestataireController);
router.post('/prestataires/:Iduser/refuser', authenticate, authorize('admin'), refuserPrestataireController);
router.post('/prestataires/:Iduser/entretien', authenticate, authorize('admin'), entretienPrestataireController);
router.post('/prestataires/:Iduser/attente', authenticate, authorize('admin'), demandeEnAttenteController);

/**
 * Statistiques prestataires
 */
router.get('/prestataires/count/valides', authenticate, authorize('admin'), countPrestatairesValidesController);
router.get('/prestataires/count/en-attente', authenticate, authorize('admin'), countPrestatairesEnAttenteController);
router.get('/prestataires/count/rejetes', authenticate, authorize('admin'), countPrestatairesRejetesController);
router.get('/prestataires/count/all', authenticate, authorize('admin'), countAllPrestatairesController);
router.get('/prestataires/count/type/:type', authenticate, authorize('admin'), countPrestatairesByTypeController);
router.get('/prestataires/stats', authenticate, authorize('admin'), getPrestatairesStatsController);

/**
 * Statistiques événements et visites
 */
router.get('/stats/evenements', authenticate, authorize('admin'), getEventStatsController);
router.get('/stats/visites', authenticate, authorize('admin'), getVisitStatsController);
router.get('/stats/global', authenticate, authorize('admin'), getGlobalStatsController);



export default router;