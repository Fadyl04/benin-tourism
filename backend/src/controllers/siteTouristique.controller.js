import {
  createSiteService,
  getAllSiteService,
  getSiteByIdService,
  updateSiteService,
  findSiteExistService
} from '../services/siteTouristique.service.js';
import { 
  moveSiteToTrashService, 
  getDeletedSitesService 
} from '../services/trash.service.js';
import {restoreSiteService} from '../services/restore.service.js'

import { siteTouristiqueSchema } from '../utils/validators.js';


/**
 * Créer un site tousistique
 */
export const createSiteController = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "L'image est obligatoire"
      });
    }
    const imagePath = `/uploads/sites/${req.file.filename}`;

    // Validation avec Zod
    const validatedData = siteTouristiqueSchema.safeParse({ ...req.body, image: imagePath });
    if (!validatedData.success) {
      const errorMessages = validatedData.error?.errors?.map(e => e.message)
      || validatedData.error?.issues?.map(issue => issue.message)
      || ["Erreur de validation inconnue"];

      return res.status(400).json({success: false, message: "Validation échouée", errors: errorMessages})
    }

    const valid = validatedData.data;
    
    // Vérification si le site existe déjà
    const existingSite = await findSiteExistService({
      nom: valid.nom,
      description: valid.description,
      localisation: valid.localisation
    });

    if (existingSite) {
      return res.status(400).json({
        success: false,
        message: "Un site existe déjà avec ce nom, cette description et cette localisation !"
      });
    }

    // Création du site
    const site = await createSiteService(valid);

    return res.status(201).json({
      success: true,
      message: 'Site touristique créé avec succès',
      data: site
    });

  } catch (error) {
    console.error('Error de createSiteController:', error)
    return res.status(500).json({
      success: false,
      message: error.message || "Erreur serveur lors de la création du site"
    });
  }
};


/**
 * Récupérer tous les sites touristiques
 */
export const getAllSiteController = async (req, res) => {
  try {
    let { page = "1", limit = "10", categorie, search } = req.query;
    page = Number(page);
    limit = Number(limit);
    if (!Number.isInteger(page) || page < 1) page = 1;
    if (!Number.isInteger(limit) || limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const result = await getAllSiteService({
      page,
      limit,
      categorie,
      search, // ← ajouté
    });

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });

  } catch (error) {
    console.error("Erreur getAllSiteController:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des sites"
    });
  }
}; 

/**
 *  Récupérer un site tousistique par son ID
 */
export const getSiteByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const site = await getSiteByIdService(id);
    if (!site) {
      return res.status(404).json({
        success: false,
        message: "Site touristique non trouvé"

      });

    }
    return res.status(200).json({
      success: true,
      data: site

    });
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Erreur serveur"

    });

  }

};


/**
 * Mettre à jour un site touristique
 */
export const updateSiteController = async (req, res) => {
  try {
    const { id } = req.params;

    const imagePath = req.file
      ? `/uploads/sites/${req.file.filename}`
    : undefined;

    const updateData = {
      ...req.body,
      ...(imagePath && { image: imagePath })
    };

    const validated = siteTouristiqueSchema.partial().safeParse(updateData);

    if (!validated.success) {
      return res.status(400).json({
        success: false,
        message: "Erreur de validation",
        errors: validated.error.issues.map(i => i.message)
      });
    }

    const site = await updateSiteService(id, validated.data);

    res.status(200).json({
      success: true,
      message: "Site mis à jour avec succès",
      data: site
    });

  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Site non trouvé"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Déplacer vers la corbeille
 */
export const deleteSiteController = async (req, res) => {

  try {

    const { id } = req.params;
    const site = await moveSiteToTrashService(id);
    if (!site) {
      return res.status(404).json({
        success: false,
        message: "Site non trouvé"

      });

    }
    return res.status(200).json({

      success: true,

      message: "Site déplacé vers la corbeille"

    });

  } catch (error) {

    return res.status(500).json({

      success: false,

      message:

        "Erreur serveur lors de la suppression"

    });

  }

};

/**
 * Récuperer les sites de la corbeille.
 */
export const getDeletedSitesController = async (req, res) => {

  try {
    let { page = "1", limit = "10" } = req.query;

    page = Number(page);
    limit = Number(limit);
    if (!Number.isInteger(page) || page < 1) {
      page = 1;
    }

    if (!Number.isInteger(limit) || limit < 1) {
      limit = 10;
    }


    if (limit > 100) {
      limit = 100;
    }
    const result = await getDeletedSitesService({ page,limit });
    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination

    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message:"Erreur serveur lors de la récupération de la corbeille"

    });

  }

};

/**
 * Restaurer un sites.
 */
export const restoreSiteController = async (req, res) => {

  try {

    const { id } = req.params;
    const site = await restoreSiteService(id);
    if (!site) {

      return res.status(404).json({
        success: false,
        message: "Site non trouvé"

      });

    }
    return res.status(200).json({
      success: true,
      message: "Site restauré avec succès",
      data: site

    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message:"Erreur serveur lors de la restauration"

    });

  }

};



