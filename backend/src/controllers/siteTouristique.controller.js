import {
  createSiteService,
  getAllSiteService,
  getSiteByIdService,
  updateSiteService,
  deleteSiteService,
  searchSiteService, 
  findSiteExistService
} from '../services/siteTouristique.service.js';
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
    const imagePath = `/uploads/${req.file.filename}`;

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
    const sites = await getAllSiteService();
    res.status(200).json({success: true, data: sites});
  } catch (error) {
    res.status(500).json({success: false, message: error.message });
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

    res.status(200).json({
      success: true,
      data: site
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * Mettre à jour un site touristique
 */
export const updateSiteController = async (req, res) => {
  try {
    const { id } = req.params;

    const imagePath = req.file ? `/uploads/${req.file.filename}`
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
 * Supprimer un site tousistique
 */
export const deleteSiteController = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteSiteService(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Site non trouvé"
      });
    }

    res.status(200).json({
      success: true,
      message: "Site supprimé avec succès"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la suppression"
    });
  }
};


/**
 * Rechercher un site tousistique
 */
export const searchSiteController = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un nom à rechercher'
      });
    }

    // Utiliser bien la variable "name" et non "nom"
    const sites = await searchSiteService(name);

    res.status(200).json({
      success: true,
      results: sites.length,
      data: sites
    });
  } catch (error) {
    console.error("Erreur de recherche d'un site touristique :", error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur : ' + error.message
    });
  }
};