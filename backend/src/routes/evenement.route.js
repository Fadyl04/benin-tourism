import {Router} from 'express';
import {
    createEvenementController,
    getAllEvenementController,
    getEvenementByIdController,
    updateEvenementController,
    deleteEvenementController,
    getDeletedEvenementController,
    restoreEvenementController
} from '../controllers/evenement.controller.js';
import { createUploadMiddleware } from '../middlewares/upload.middleware.js';
import {authenticate, authorize} from '../middlewares/auth.middlewares.js';
import { can} from "../middlewares/can.middleware.js";

const router = Router();
const uploadEvenement = createUploadMiddleware('evenements');

/**
 * @swagger
 * tags:
 *   - name: Evenements
 *     description: Gestion des événements
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     Evenement:
 *       type: object
 *       properties:
 *         
 *         nom:
 *           type: string
 *           example: "Festival Culturel"
 *         description:
 *           type: string
 *           example: "Grand festival annuel"
 *         localisation:
 *           type: string
 *           example: "Abidjan"
 *         date_debut:
 *           type: string
 *           format: date-time
 *           example: "2026-03-01T18:00:00.000Z"
 *         date_fin:
 *           type: string
 *           format: date-time
 *           example: "2026-03-01T23:00:00.000Z"
 *         nombre_place:
 *           type: integer
 *           example: 500
 *         prix_standard:
 *           type: number
 *           format: float
 *           example: 15000.00
 *         prix_vip:
 *           type: number
 *           format: float
 *           example: 30000.00
 *         prix_elite:
 *           type: number
 *           format: float
 *           example: 50000.00
 *         prix_premium:
 *           type: number
 *           format: float
 *           example: 75000.00
 *         categorie:
 *           type: string
 *           example: "Musique"
 *         id_hotel:
 *           type: string
 *           example: "550e8400-e29b-41d4-a716-446655440111"
 *         image:
 *           type: string
 *           example: "/uploads/event.jpg"
 *         
 */


/**
 * @swagger
 * /evenement/create:
 *   post:
 *     summary: Créer un événement
 *     tags: [Evenements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - description
 *               - localisation
 *               - date_debut
 *               - date_fin
 *               - nombre_place
 *               - prix_standard
 *               - prix_vip
 *               - prix_premium
 *               - categorie
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *               localisation:
 *                 type: string
 *               date_debut:
 *                 type: string
 *                 format: date-time
 *               date_fin:
 *                 type: string
 *                 format: date-time
 *               nombre_place:
 *                 type: integer
 *               prix_standard:
 *                 type: number
 *               prix_vip:
 *                 type: number
 *               prix_elite:
 *                 type: number
 *               prix_premium:
 *                 type: number
 *               categorie:
 *                 type: string
 *               id_hotel:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Événement créé avec succès
 */
router.post('/create', authenticate, can('create', 'Evenement'), uploadEvenement.single('image'), createEvenementController);

/**
 * @swagger
 * /evenement/show:
 *   get:
 *     summary: Récupérer tous les événements
 *     tags: [Evenements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des événements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Evenement'
 */
router.get('/show', authenticate, getAllEvenementController);

router.get('/trash', can('read', 'Evenement'), getDeletedEvenementController);


router.patch('/restore/:id', authenticate, can('update', 'Evenement'), restoreEvenementController);


/**
 * @swagger
 * /evenement/update/{id}:
 *   put:
 *     summary: Mettre à jour un événement
 *     tags: [Evenements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'événement (UUID)
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *               localisation:
 *                 type: string
 *               date_debut:
 *                 type: string
 *                 format: date-time
 *               date_fin:
 *                 type: string
 *                 format: date-time
 *               nombre_place:
 *                 type: integer
 *               prix_standard:
 *                 type: number
 *               prix_vip:
 *                 type: number
 *               prix_elite:
 *                 type: number
 *               prix_premium:
 *                 type: number
 *               categorie:
 *                 type: string
 *               id_hotel:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Événement mis à jour avec succès
 *       404:
 *         description: Événement non trouvé
 */
router.put('/update/:id', authenticate, can('update', 'Evenement'), uploadEvenement.single('image'), updateEvenementController);


/**
 * @swagger
 * /evenement/delete/{id}:
 *   delete:
 *     summary: Supprimer un événement
 *     tags: [Evenements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'événement (UUID)
 *     responses:
 *       200:
 *         description: Événement supprimé avec succès
 *       404:
 *         description: Événement non trouvé
 */
router.delete('/delete/:id',authenticate, can('delete', 'Evenement'),deleteEvenementController);





/**
 * @swagger
 * /evenement/{id}:
 *   get:
 *     summary: Récupérer un événement par ID
 *     tags: [Evenements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'événement (UUID)
 *     responses:
 *       200:
 *         description: Événement trouvé
 *       404:
 *         description: Événement non trouvé
 */
router.get('/:id', authenticate, getEvenementByIdController);

export default router;