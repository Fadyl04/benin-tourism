import {Router} from 'express'
import {
  createVisiteController,
  getAllVisiteController,
  getVisiteByIdController,
  deleteVisiteController,
  updateVisiteController
} from "../controllers/visite.controller.js";
import { authenticate, authorize } from '../middlewares/auth.middlewares.js';
import { createUploadMiddleware } from '../middlewares/upload.middleware.js';
import {can} from "../middlewares/can.middleware.js";

const router = Router();
const uploadVisite = createUploadMiddleware('visites');


/**
 * @swagger
 * tags:
 *   - name: Visites
 *     description: Gestion des visites
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     Visite:
 *       type: object
 *       properties:
 *         nom:
 *           type: string
 *           example: "Visite de la Donga"
 *         description:
 *           type: string
 *           example: "Circuit touristique dans le nord du Bénin"
 *         prix_economique:
 *           type: number
 *           format: float
 *           example: 10000.00
 *         prix_confort:
 *           type: number
 *           format: float
 *           example: 20000.00
 *         prix_premium:
 *           type: number
 *           format: float
 *           example: 30000.00
 *         nombre_places:
 *           type: integer
 *           example: 25
 *         date_debut:
 *           type: string
 *           format: date-time
 *           example: "2026-03-01T08:00:00.000Z"
 *         date_fin:
 *           type: string
 *           format: date-time
 *           example: "2026-03-05T18:00:00.000Z"
 *         lieu_date_depart:
 *           type: string
 *           example: "Cotonou"
 *         parcours:
 *           type: string
 *           example: "Cotonou → Natitingou → Donga"
 *         id_guide:
 *           type: string
 *           example: "550e8400-e29b-41d4-a716-446655440111"
 *         id_hotel:
 *           type: string
 *           nullable: true
 *           example: "550e8400-e29b-41d4-a716-446655440112"
 *         id_transport:
 *           type: string
 *           example: "550e8400-e29b-41d4-a716-446655440113"
 *         siteIds:
 *           type: array
 *           items:
 *             type: string
 *           example: ["uuid-site-1", "uuid-site-2"]
 *         image:
 *           type: string
 *           example: "/uploads/visite.jpg"
 */


/**
 * @swagger
 * /visite/create:
 *   post:
 *     summary: Créer une visite
 *     tags: [Visites]
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
 *               - prix_economique
 *               - prix_confort
 *               - prix_premium
 *               - nombre_places
 *               - date_debut
 *               - date_fin
 *               - lieu_date_depart
 *               - parcours
 *               - id_guide
 *               - id_transport
 *               - siteIds
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *               prix_economique:
 *                 type: number
 *               prix_confort:
 *                 type: number
 *               prix_premium:
 *                 type: number
 *               nombre_places:
 *                 type: integer
 *               date_debut:
 *                 type: string
 *                 format: date-time
 *               date_fin:
 *                 type: string
 *                 format: date-time
 *               lieu_date_depart:
 *                 type: string
 *               parcours:
 *                 type: string
 *               id_guide:
 *                 type: string
 *               id_hotel:
 *                 type: string
 *               id_transport:
 *                 type: string
 *               siteIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Visite créée avec succès
 */
router.post("/create", authenticate, can('create', 'Visite'), uploadVisite.single('image'), createVisiteController);


/**
 * @swagger
 * /visite/update/{id_visite}:
 *   put:
 *     summary: Mettre à jour une visite
 *     tags: [Visites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_visite
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la visite (UUID)
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
 *               prix_economique:
 *                 type: number
 *               prix_confort:
 *                 type: number
 *               prix_premium:
 *                 type: number
 *               nombre_places:
 *                 type: integer
 *               date_debut:
 *                 type: string
 *                 format: date-time
 *               date_fin:
 *                 type: string
 *                 format: date-time
 *               lieu_date_depart:
 *                 type: string
 *               parcours:
 *                 type: string
 *               id_guide:
 *                 type: string
 *               id_hotel:
 *                 type: string
 *               id_transport:
 *                 type: string
 *               siteIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Visite mise à jour avec succès
 *       404:
 *         description: Visite non trouvée
 */
router.put("/update/:id_visite", authenticate, can('update', 'Visite'), uploadVisite.single('image'), updateVisiteController);

/**
 * @swagger
 * /visite/delete/{id_visite}:
 *   delete:
 *     summary: Supprimer une visite
 *     tags: [Visites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_visite
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la visite (UUID)
 *     responses:
 *       200:
 *         description: Visite supprimée avec succès
 *       404:
 *         description: Visite non trouvée
 */
router.delete("/delete/:id_visite", authenticate, can('delete', 'Visite'), deleteVisiteController);


/**
 * @swagger
 * /visite/show:
 *   get:
 *     summary: Récupérer toutes les visites
 *     tags: [Visites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des visites
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Visite'
 */

router.get("/show", authenticate, getAllVisiteController);


/**
 * @swagger
 * /visite/{id_visite}:
 *   get:
 *     summary: Récupérer une visite par ID
 *     tags: [Visites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_visite
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la visite (UUID)
 *     responses:
 *       200:
 *         description: Visite trouvée
 *       404:
 *         description: Visite non trouvée
 */
router.get("/:id_visite", authenticate, getVisiteByIdController);


export default router;