import {Router} from 'express';
import {
    createSiteController,
    getAllSiteController,
    getSiteByIdController,
    updateSiteController,
    deleteSiteController,
} from '../controllers/siteTouristique.controller.js';
import { createUploadMiddleware } from '../middlewares/upload.middleware.js';
import { authenticate, authorize} from '../middlewares/auth.middlewares.js';
import { can } from '../middlewares/can.middleware.js';

const router = Router();
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
 *        
 *         nom:
 *           type: string
 *           example: "Lac Rose"
 *         description:
 *           type: string
 *           example: "Magnifique lac salé situé au Sénégal"
 *         localisation:
 *           type: string
 *           example: "Sénégal"
 *         horaire:
 *           type: string
 *           example: "08:00 - 18:00"
 *         categorie:
 *           type: string
 *           example: "Nature"
 *         image:
 *           type: string
 *           example: "/uploads/lac-rose.jpg"
 */


/**
 * @swagger
 * /site/create:
 *   post:
 *     summary: Créer un site touristique
 *     tags: [Sites]
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
 *               - horaire
 *               - categorie
 *               - image
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *               localisation:
 *                 type: string
 *               horaire:
 *                 type: string
 *               categorie:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Site créé avec succès
 */
router.post('/create', authenticate, can('create', 'Site'), uploadSite.single('image'), createSiteController);


/**
 * @swagger
 * /site/update/{id}:
 *   put:
 *     summary: Mettre à jour un site touristique
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du site
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
 *               horaire:
 *                 type: string
 *               categorie:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Site mis à jour avec succès
 *       404:
 *         description: Site non trouvé
 */
router.put('/update/:id', authenticate, can('update', 'Site'), uploadSite.single('image'), updateSiteController);

/**
 * @swagger
 * /site/delete/{id}:
 *   delete:
 *     summary: Supprimer un site touristique
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du site
 *     responses:
 *       200:
 *         description: Site supprimé avec succès
 *       404:
 *         description: Site non trouvé
 */
router.delete('/delete/:id', authenticate, can('delete', 'Site'), deleteSiteController);

/**
 * @swagger
 * /site/show:
 *   get:
 *     summary: Récupérer tous les sites touristiques
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des sites
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Site'
 */
router.get('/show', authenticate, getAllSiteController);


/**
 * @swagger
 * /site/{id}:
 *   get:
 *     summary: Récupérer un site par ID
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du site
 *     responses:
 *       200:
 *         description: Site trouvé
 *       404:
 *         description: Site non trouvé
 */
router.get('/:id', authenticate, getSiteByIdController);


export default router;