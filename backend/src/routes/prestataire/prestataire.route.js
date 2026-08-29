import {Router} from 'express';

import {
    getPendingPrestatairesController,
    getPrestataireByIdController,
    scheduleInterviewController,
    validatePrestataireController,
    rejectPrestataireController
} from "../../controllers/prestataire/prestataire.controller.js";


import {
    authenticate,
    authorize
} from "../../middlewares/auth.middlewares.js";

const router = Router();


// Protection administrateur
router.use(
    authenticate,
    authorize("admin")
);


/**
 * GET
 * Liste des demandes prestataires
 */
router.get(
    "/demandes",
    getPendingPrestatairesController
);

/**
 * GET
 * Détail d'un prestataire
 */
router.get(
    "/:id",
    getPrestataireByIdController
);





/**
 * PUT
 * Passage entretien
 */
router.put(
    "/:id/interview",
    scheduleInterviewController
);



/**
 * PUT
 * Validation prestataire
 */
router.put(
    "/:id/validate",
    validatePrestataireController
);





/**
 * PUT
 * Refus prestataire
 */
router.put(
    "/:id/reject",
    rejectPrestataireController
);


export default router;