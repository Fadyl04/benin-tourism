import {
  createVisiteService,
  getAllVisiteService,
  getVisiteByIdService,
  updateVisiteService,
  findVisiteExistService
} from "../services/visite.service.js";
import {moveVisiteToTrashService, getDeletedVisiteSivice} from "../services/trash.service.js";
import {restoreVisiteService} from "../services/restore.service.js"
import { visiteSchema } from "../utils/validators.js";
import {checkPrestataireValidation, handlePrestataireError} from '../services/auth/auth.prestataire.service.js'; 
import { success } from "zod";
  
/**
 * Créer une visite
 */
export const createVisiteController = async (req, res) => {
  try {
    const image = req.file ? `/uploads/visites/${req.file.filename}` : null;

    // Préparation des données avec gestion des champs vides
    const inputData = { 
      ...req.body, 
      image,
      id_hotel: req.body.id_hotel || null,
      id_transport: req.body.id_transport  
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

    //console.log("Entrée dans createVisiteController");
    // Vérification des prestataire APRÈS validation
    // Le guide est OBLIGATOIRE
    try {
      await checkPrestataireValidation(data.id_guide, "guide");
    } catch (error) {
      return handlePrestataireError(error, res, "Guide");
    }

    // Vérification de l'hôtel s'il est fourni
    if (data.id_hotel) {
      try {
        await checkPrestataireValidation(data.id_hotel, "hotel");
      } catch (error) {
        return handlePrestataireError(error, res, "Hôtel");
      }
    }

    // Vérification du transport s'il est fourni
    if (data.id_transport) {
      try {
        await checkPrestataireValidation(data.id_transport, "transport");
      } catch (error) {
        return handlePrestataireError(error, res, "Transport");
      }
    }

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
      id_transport: data.id_transport,
      siteIds: Array.isArray(data.siteIds) ? data.siteIds : []
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
    let { page = "1", limit = "10", search } = req.query;
    page = Number(page);
    limit = Number(limit);
    if (!Number.isInteger(page) || page < 1) page = 1;
    if (!Number.isInteger(limit) || limit < 1) limit = 10;
    if (limit > 100) limit = 100;
    const visites = await getAllVisiteService({
      page,
      limit,
      search
    });
    res.status(200).json({ 
      success: true, 
      data: visites,
      pagination: pagination
    });
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
    
    if (!id_visite || typeof id_visite !== 'string') {

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
 * Déplacer vers la corbeille
 */
export const deleteVisiteController = async (req, res) => {
    try {
      const { id_visite } = req.params;
      
      if (!id_visite || typeof id_visite !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: "ID de visite invalide" 
        });
      }
      const deleted =  await moveVisiteToTrashService(id);
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

    const image = req.file ? `/uploads/visites/${req.file.filename}` : undefined;

    const payload = { ...req.body, image };

    // CONVERSION DES CHAMPS NUMÉRIQUES
    const numericFields = ['prix_economique', 'prix_confort', 'prix_premium', 'nombre_places'];
    numericFields.forEach(field => {
      if (payload[field] !== undefined && payload[field] !== '') {
        // Convertir en nombre
        payload[field] = Number(payload[field]);
        // Vérifier si la conversion a réussi
        if (isNaN(payload[field])) {
          return res.status(400).json({
            success: false,
            message: `Le champ ${field} doit être un nombre valide`
          });
        }
      }
    });

    // Conversion siteIds si string JSON
    if (typeof payload.siteIds === "string") {
      try {
        payload.siteIds = JSON.parse(payload.siteIds);
      } catch {
        payload.siteIds = payload.siteIds.split(",").map(id => id.trim());
      }
    }

    // Valider avec le schéma complet
    const parsed = visiteSchema.safeParse(payload);
    
    if (!parsed.success) {
      // Extraire les champs présents
      const presentFields = Object.keys(payload).filter(key => 
        payload[key] !== undefined && payload[key] !== null
      );
      
      // Filtrer les erreurs pertinentes
      const relevantErrors = parsed.error.issues.filter(issue => {
        // Ignorer les erreurs de type 'undefined' pour les champs requis
        if (issue.code === 'invalid_type' && issue.received === 'undefined') {
          return false;
        }
        // Pour la validation des dates
        if (issue.path[0] === 'date_fin' && issue.code === 'custom') {
          return payload.date_debut && payload.date_fin;
        }
        // Pour les autres erreurs
        return presentFields.includes(issue.path[0]);
      });

      if (relevantErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Validation échouée",
          errors: relevantErrors.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }
    }

    // Utiliser les données du payload avec les valeurs converties
    const visiteData = { ...payload };

    // Validation manuelle des dates
    if (visiteData.date_debut && visiteData.date_fin) {
      if (new Date(visiteData.date_fin) <= new Date(visiteData.date_debut)) {
        return res.status(400).json({
          success: false,
          message: "La date de fin doit être après la date de début"
        });
      }
    }

    // Vérification des prestataires
    if (visiteData.id_guide) {
      try {
        await checkPrestataireValidation(visiteData.id_guide, "guide");
      } catch (error) {
        return handlePrestataireError(error, res, "Guide");
      }
    }

    if (visiteData.id_hotel) {
      try {
        await checkPrestataireValidation(visiteData.id_hotel, "hotel");
      } catch (error) {
        return handlePrestataireError(error, res, "Hôtel");
      }
    }

    if (visiteData.id_transport) {
      try {
        await checkPrestataireValidation(visiteData.id_transport, "transport");
      } catch (error) {
        return handlePrestataireError(error, res, "Transport");
      }
    }

    // Vérification des doublons
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
      message: error.message || "Erreur serveur lors de la mise à jour"
    });
  }
};

/**
 * Récuperer les visites de la corbeille.
 */
export const getDeletedVisiteController = async (req, res) => {
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
  const visites = await getDeletedVisiteSivice({page, limit});
  return res.status(200).json({
    success: true,
    data: visites.data,
    pagination: visites.pagination
  })
} catch (error) {
  return res.status(500).json({
    success: false,
    message:"Erreur serveur lors de la récupération de la corbeille"

  });
}
};

/**
 * Restaurer un évènements.
 */
export const restoreVisiteController = async (req, res) => {
  try {
    const { id } = req.params;
    const visite = await restoreVisiteService(id);
    if(!visite) {
      return res.status(404).json({
        success: false,
        message: "visite non trouvé"

      });
    }
    return res.status(200).json({
      success: true,
      message: "Visite restauré avec succès",
      data: visite
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:"Erreur serveur lors de la restauration"

    });
  }
}
