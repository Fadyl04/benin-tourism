import {
    createVisiteService,
    getAllVisiteService,
    getVisiteByIdService,
    searchVisiteService,
    deleteVisiteService,
    updateVisiteService,
    findVisiteExistService
} from "../services/visite.service.js";
import { visiteSchema } from "../utils/validators.js";
  
/**
 * Créer une visite
 */
export const createVisiteController = async (req, res) => {
  try {
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    // Préparation des données avec gestion des champs vides
    const inputData = { 
      ...req.body, 
      image,
      id_hotel: req.body.id_hotel || null,
      id_transport: req.body.id_transport || null 
    };

    // Validation avec Zod
    const visiteValid = visiteSchema.safeParse(inputData);
    if (!visiteValid.success) {
      const errorMessages = visiteValid.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      return res.status(400).json({
        success: false, 
        message: "Validation échouée",
        errors: errorMessages
      });
    }

    const data = visiteValid.data;

    // Vérification si la visite existe déjà
    const existingVisite = await findVisiteExistService({
      nom: data.nom,
      description: data.description,
      date_debut: data.date_debut
    });

    if (existingVisite) {
      return res.status(400).json({
        success: false,
        message: "Une visite existe déjà avec ces caractéristiques !"
      });
    }

    // Création de la visite
    const visite = await createVisiteService({
      ...data, 
      id_guide: data.id_guide,
      id_hotel: data.id_hotel || null,
      id_transport: data.id_transport || null,
      siteIds: Array.isArray(data.siteIds) ? data.siteIds.map(Number) : []
    });

    return res.status(201).json({
      success: true,
      message: "Visite créée avec succès",
      data: visite
    });

  } catch (error) {
    console.error('Error de createVisiteController', error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création de visite"
    });
  }
};

  
  
/**
 * Récupérer toutes les visites
 */
export const getAllVisiteController = async (req, res) => {
  try {
    const visites = await getAllVisiteService();
    res.status(200).json({ success: true, data: visites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
  
/**
 * Récupérer une visite par ID
 */
export const getVisiteByIdController = async (req, res) => {
  try {
    const { id_visite } = req.params;
    
    if (!id_visite || isNaN(visiteId)) {
      return res.status(400).json({
        success: false,
        message: "ID de visite invalide"
      });
    }

    const visite = await getVisiteByIdService(id_visite);

    if (!visite) {
      return res.status(404).json({ success: false, message: "Visite non trouvée" });
    }

    res.status(200).json({ success: true, data: visite });
  } catch (error) {
    console.error("Erreur getVisiteByIdController:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

  
  
/**
 * Supprimer une visite
 */
export const deleteVisiteController = async (req, res) => {
    try {
      const { id_visite } = req.params;
      
      if (!id_visite) {
        return res.status(400).json({ 
          success: false, 
          message: "ID d'événement invalide" 
        });
      }
      const deleted =  await deleteVisiteService(id_visite);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Visite non trouvé" });
      } 
      res.status(200).json({success: true,message: "Visite supprimée avec succès" });
    } catch (error) {
      console.error('Error in deleteVisiteController:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ success: false, message: "Visite non trouvé" });
      }
      res.status(500).json({ success: false, message: "Erreur serveur lors de la suppression", error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};
  
/**
 * Mettre à jour une visite
 */
export const updateVisiteController = async (req, res) => {
  try {
    const { id_visite } = req.params;

    if (!id_visite) {
      return res.status(400).json({
        success: false,
        message: "Identifiant invalide"
      });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    const payload = { ...req.body, image };

    // Conversion siteIds si string JSON
    if (typeof payload.siteIds === "string") {
      try {
        payload.siteIds = JSON.parse(payload.siteIds);
      } catch {
        payload.siteIds = payload.siteIds.split(",");
      }
    }

    const parsed = visiteSchema.partial().safeParse(payload);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation échouée",
        errors: parsed.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    const visiteData = parsed.data;

    if (visiteData.nom && visiteData.description && visiteData.date_debut) {
      const existing = await findVisiteExistService(
        {
          nom: visiteData.nom,
          description: visiteData.description,
          date_debut: visiteData.date_debut
        },
        id_visite
      );

      if (existing && existing.id_visite !== id_visite) {
        return res.status(400).json({
          success: false,
          message: "Une autre visite avec ces caractéristiques existe déjà."
        });
      }
    }

    const updated = await updateVisiteService(id_visite, visiteData);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Visite non trouvée"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Visite mise à jour avec succès",
      data: updated
    });

  } catch (error) {
    console.error("Erreur updateVisiteController:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Visite non trouvée"
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Rechercher une visite par nom
 */
export const searchVisiteController = async (req, res) => {
    try {
      const { nom } = req.query;
  
        if (!nom || typeof nom !== "string" || nom.trim() === "") {
        return res.status(400).json({
          success: false,message: "Veuillez fournir un nom à rechercher"});
        }
      const visites = await searchVisiteService(nom);
        res.status(200).json({success: true,results: visites.length,data: visites});
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};