import {Router} from 'express';
import {loginAdminController, logoutAdminController} from '../../controllers/auth/auth.admin.controller.js';
import { adminRole } from '../../middlewares/auth.middlewares.js';
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
router.post("/logout", adminRole, logoutAdminController);

/**
 * Gestion des prestataires
 */
router.get('/prestataires', adminRole, getAllPrestatairesController);
router.post('/prestataires/:Iduser/valider', adminRole, validerPrestataireController);
router.post('/prestataires/:Iduser/refuser', adminRole, refuserPrestataireController);
router.post('/prestataires/:Iduser/entretien', adminRole, entretienPrestataireController);
router.post('/prestataires/:Iduser/attente', adminRole, demandeEnAttenteController);

/**
 * Statistiques prestataires
 */
router.get('/prestataires/count/valides', adminRole, countPrestatairesValidesController);
router.get('/prestataires/count/en-attente', adminRole, countPrestatairesEnAttenteController);
router.get('/prestataires/count/rejetes', adminRole, countPrestatairesRejetesController);
router.get('/prestataires/count/all', adminRole, countAllPrestatairesController);
router.get('/prestataires/count/type/:type', adminRole, countPrestatairesByTypeController);
router.get('/prestataires/stats', adminRole, getPrestatairesStatsController);

/**
 * Statistiques événements et visites
 */
router.get('/stats/evenements', adminRole, getEventStatsController);
router.get('/stats/visites', adminRole, getVisitStatsController);
router.get('/stats/global', adminRole, getGlobalStatsController);



export default router;