import {Router} from 'express';
import { 
    cancelReservationController, 
    createReservationController,
    getAllReservationsController,
    getReservationByIdController
} from '../controllers/reservation.controller.js';
import {authenticate} from '../middlewares/auth.middlewares.js';
import {
    payReservationController,
    paiementCallbackController
} from '../controllers/paiement.controller.js';


const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Réservations & Paiements
 *     description: Gestion des réservations et paiements
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Reservation:
 *       type: object
 *       properties:
 *         id_reservation:
 *           type: string
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         id_user:
 *           type: string
 *           example: "550e8400-e29b-41d4-a716-446655440111"
 *         id_evenement:
 *           type: string
 *           nullable: true
 *           example: "550e8400-e29b-41d4-a716-446655440222"
 *         id_visite:
 *           type: string
 *           nullable: true
 *           example: null
 *         montant:
 *           type: number
 *           format: float
 *           example: 30000
 *         nombre_personnes:
 *           type: integer
 *           example: 2
 *         statut:
 *           type: string
 *           example: "en_attente"
 *         date_reservation:
 *           type: string
 *           format: date-time
 */


/**
 * @swagger
 * /reservation:
 *   post:
 *     summary: Créer une réservation (événement ou visite)
 *     tags: [Réservations & Paiements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_evenement:
 *                 type: string
 *                 example: "550e8400-e29b-41d4-a716-446655440222"
 *               id_visite:
 *                 type: string
 *                 example: null
 *               nombre_personnes:
 *                 type: integer
 *                 example: 2
 *               ticket_evenement:
 *                 type: string
 *                 example: "pass_standard"
 *               ticket_visite:
 *                 type: string
 *                 example: null
 *     responses:
 *       201:
 *         description: Réservation créée avec succès
 */
router.post('/reservation', authenticate ,createReservationController);


/**
 * @swagger
 * /pay:
 *   post:
 *     summary: Générer un lien de paiement FedaPay
 *     tags: [Réservations & Paiements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_reservation
 *             properties:
 *               id_reservation:
 *                 type: string
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Lien de paiement généré
 *       404:
 *         description: Réservation non trouvée
 */
router.post('/pay', authenticate, payReservationController);


/**
 * @swagger
 * /callback:
 *   get:
 *     summary: Callback FedaPay après paiement
 *     tags: [Réservations & Paiements]
 *     parameters:
 *       - in: query
 *         name: transaction
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la transaction FedaPay
 *       - in: query
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *         description: Statut du paiement (success, failed)
 *     responses:
 *       200:
 *         description: Paiement traité
 */
router.get('/callback', paiementCallbackController);


/**
 * @swagger
 * /cancel:
 *   delete:
 *     summary: Annuler une réservation
 *     tags: [Réservations & Paiements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_reservation
 *             properties:
 *               id_reservation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Réservation annulée
 */
router.delete('/cancel', authenticate, cancelReservationController);

/**
 * @swagger
 * /show:
 *   get:
 *     summary: Récupérer toutes les réservations de l'utilisateur connecté
 *     tags: [Réservations & Paiements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des réservations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 */
router.get('/show', authenticate, getAllReservationsController);



/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Récupérer une réservation par ID
 *     tags: [Réservations & Paiements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la réservation (UUID)
 *     responses:
 *       200:
 *         description: Réservation trouvée
 *       404:
 *         description: Réservation non trouvée
 */
router.get('/:id', authenticate, getReservationByIdController);

export default router;