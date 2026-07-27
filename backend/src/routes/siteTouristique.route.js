import { Router } from 'express';

import {
  createSiteController,
  getAllSiteController,
  getSiteByIdController,
  updateSiteController,
  deleteSiteController,
  getDeletedSitesController,
  restoreSiteController
} from '../controllers/siteTouristique.controller.js';

import { createUploadMiddleware } from '../middlewares/upload.middleware.js';

import { authenticate } from '../middlewares/auth.middlewares.js';

import { can } from '../middlewares/can.middleware.js';


const router = Router();


/**
 * Middleware d'upload des images des sites touristiques
 */
const uploadSite = createUploadMiddleware('sites');


/**
 * @swagger
 * tags:
 *   - name: Sites
 *     description: Gestion des sites touristiques
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     Site:
 *       type: object
 *       properties:
 *         id_site:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *
 *         nom:
 *           type: string
 *           example: "Porte du Non-Retour"
 *
 *         image:
 *           type: string
 *           example: "/uploads/sites/porte-non-retour.jpg"
 *
 *         description:
 *           type: string
 *           example: "Site historique et touristique situé à Ouidah."
 *
 *         localisation:
 *           type: string
 *           example: "Ouidah, Bénin"
 *
 *         horaire:
 *           type: string
 *           example: "08:00 - 18:00"
 *
 *         categorie:
 *           type: string
 *           example: "Histoire"
 *
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *         isDeleted:
 *           type: boolean
 *           example: false
 *
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     SitePagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *
 *         limit:
 *           type: integer
 *           example: 10
 *
 *         total:
 *           type: integer
 *           example: 25
 *
 *         totalPages:
 *           type: integer
 *           example: 3
 *
 *         hasNextPage:
 *           type: boolean
 *           example: true
 *
 *         hasPreviousPage:
 *           type: boolean
 *           example: false
 */


/**
 * @swagger
 * /site/create:
 *   post:
 *     summary: Créer un site touristique
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *
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
 *               - horaire
 *               - categorie
 *               - image
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Porte du Non-Retour"
 *
 *               description:
 *                 type: string
 *                 example: "Site historique et touristique situé à Ouidah."
 *
 *               localisation:
 *                 type: string
 *                 example: "Ouidah, Bénin"
 *
 *               horaire:
 *                 type: string
 *                 example: "08:00 - 18:00"
 *
 *               categorie:
 *                 type: string
 *                 example: "Histoire"
 *
 *               image:
 *                 type: string
 *                 format: binary
 *
 *     responses:
 *       201:
 *         description: Site créé avec succès
 *
 *       400:
 *         description: Données invalides
 *
 *       401:
 *         description: Non authentifié
 *
 *       403:
 *         description: Permission refusée
 */
router.post('/create', authenticate, can('create', 'Site'),uploadSite.single('image'), createSiteController );


/**
 * @swagger
 * /site/show:
 *   get:
 *     summary: Récupérer les sites touristiques actifs
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de la page
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Nombre de sites par page
 *
 *       - in: query
 *         name: categorie
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrer les sites par catégorie
 *
 *     responses:
 *       200:
 *         description: Liste paginée des sites touristiques actifs
 *
 *       401:
 *         description: Non authentifié
 */
router.get( '/show', authenticate, getAllSiteController );


/**
 * @swagger
 * /site/trash:
 *   get:
 *     summary: Récupérer les sites touristiques dans la corbeille
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *
 *     responses:
 *       200:
 *         description: Liste paginée des sites supprimés
 *
 *       401:
 *         description: Non authentifié
 *
 *       403:
 *         description: Permission refusée
 */
router.get( '/trash', authenticate, can('read', 'Site'), getDeletedSitesController );


/**
 * @swagger
 * /site/restore/{id}:
 *   patch:
 *     summary: Restaurer un site touristique
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identifiant du site
 *
 *     responses:
 *       200:
 *         description: Site restauré avec succès
 *
 *       404:
 *         description: Site non trouvé
 *
 *       401:
 *         description: Non authentifié
 *
 *       403:
 *         description: Permission refusée
 */
router.patch('/restore/:id', authenticate, can('update', 'Site'), restoreSiteController );


/**
 * @swagger
 * /site/update/{id}:
 *   put:
 *     summary: Mettre à jour un site touristique
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identifiant du site
 *
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *
 *               description:
 *                 type: string
 *
 *               localisation:
 *                 type: string
 *
 *               horaire:
 *                 type: string
 *
 *               categorie:
 *                 type: string
 *
 *               image:
 *                 type: string
 *                 format: binary
 *
 *     responses:
 *       200:
 *         description: Site mis à jour avec succès
 *
 *       404:
 *         description: Site non trouvé
 *
 *       401:
 *         description: Non authentifié
 *
 *       403:
 *         description: Permission refusée
 */
router.put('/update/:id', authenticate, can('update', 'Site'), uploadSite.single('image'), updateSiteController );


/**
 * @swagger
 * /site/delete/{id}:
 *   delete:
 *     summary: Déplacer un site touristique vers la corbeille
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identifiant du site
 *
 *     responses:
 *       200:
 *         description: Site déplacé vers la corbeille
 *
 *       404:
 *         description: Site non trouvé
 *
 *       401:
 *         description: Non authentifié
 *
 *       403:
 *         description: Permission refusée
 */
router.delete( '/delete/:id', authenticate, can('delete', 'Site'), deleteSiteController);


/**
 * @swagger
 * /site/{id}:
 *   get:
 *     summary: Récupérer un site touristique par son ID
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identifiant du site
 *
 *     responses:
 *       200:
 *         description: Site trouvé
 *
 *       404:
 *         description: Site touristique non trouvé
 *
 *       401:
 *         description: Non authentifié
 */
router.get('/:id', authenticate, getSiteByIdController);
export default router;
