import {
  createEvenementService,
  getAllEvenementService,
  getEvenementByIdService,
  updateEvenementService,
  findEvenementExistService

} from '../services/evenement.service.js';
import { moveEvenementToTrashService, getDeletedEvenementService } from '../services/trash.service.js'; 
import { restoreEvenementService } from '../services/restore.service.js';
import { evenementSchema } from '../utils/validators.js';
import {checkPrestataireValidation, handlePrestataireError} from '../services/auth/auth.prestataire.service.js';
import { date, success } from 'zod';

/**
 * Création d'un evenement
 */
export const createEvenementController = async (req, res) => {
  try {
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    // Prétraitement
    const processedData = { ...req.body };

    if (processedData.prix_elite === '' || processedData.prix_elite === 'null') {
      processedData.prix_elite = null;
    } else if (processedData.prix_elite !== undefined) {
      processedData.prix_elite = Number(processedData.prix_elite);
    }

    const numericFields = ['nombre_place', 'prix_standard', 'prix_vip', 'prix_premium'];
    numericFields.forEach(field => {
      if (processedData[field] !== undefined && processedData[field] !== '') {
        processedData[field] = Number(processedData[field]);
      }
    });

    // Validation Zod
    const parsedData = evenementSchema.safeParse({
      ...processedData,
      image: imagePath
    });

    if (!parsedData.success) {
      return res.status(400).json({
        success: false,
        message: "Validation échouée",
        errors: parsedData.error.issues.map(issue   => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    const data = parsedData.data;
    //console.log("Entrée dans createEvenementController");
    // Vérification du prestataire APRÈS validation
    if (data.id_hotel) {
      try {
        await checkPrestataireValidation(data.id_hotel, "hotel");
      } catch (error) {
        return handlePrestataireError(error, res, "Hôtel");
      }
    }

    // Vérification doublon
    const existingEvent = await findEvenementExistService({
      nom: data.nom,
      description: data.description,
      date_debut: data.date_debut,
      localisation: data.localisation
    });

    if (existingEvent) {
      return res.status(400).json({
        success: false,
        message: "Un événement avec ces caractéristiques existe déjà"
      });
    }

    const evenement = await createEvenementService(data);

    return res.status(201).json({
      success: true,
      data: evenement,
      message: 'Événement créé avec succès',
    });

  } catch (error) {
    console.error('Erreur createEvenementController:', error);

    return res.status(500).json({
      success: false,
      message: error.message || "Erreur serveur"
    });
  }
};



/**
 *  Récupérer tous les évènements
 */
export const getAllEvenementController = async (req, res) => {
  try {
    let { page = "1", limit = "10", categorie } = req.query;
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
    const evenements = await getAllEvenementService({
      page,
      limit,
      categorie
    });
    res.status(200).json({
      success: true, 
      data: evenements,
      pagination: evenements.pagination
    });
  } catch (error) {
    res.status(500).json({success: false, message: error.message });
  }
};

/**
 *  Récupérer un evenement par son ID
 */
export const getEvenementByIdController = async (req, res) => {
  try {
    const {id} = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "L'identifiant du evenement est requis."
      });
    }
    const evenement = await getEvenementByIdService(id);

    if (!evenement) {
      return res.status(404).json({ success: false, message: 'Événement non trouvé' });
    }
    res.status(200).json({ success: true, data: evenement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 *  Mise à jour d'un évènement
 */
export const updateEvenementController = async (req, res) => {
  try {
    const id = req.params.id;
    /* console.log('ID de l\'événement à mettre à jour:', id); */
    
    if (!id || typeof id !== "string") {
      return res.status(400).json({ 
        success: false, 
        message: "Identifiant d'événement invalide." 
      });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;
    const updatedData = { ...req.body, image: imagePath };

    /* console.log('Données reçues pour mise à jour:', updatedData);*/
    // Prétraitement des données numériques
    const numericFields = ['nombre_place', 'prix_standard', 'prix_vip', 'prix_elite', 'prix_premium'];
    numericFields.forEach(field => {
      if (updatedData[field] !== undefined && updatedData[field] !== '') {
        updatedData[field] = Number(updatedData[field]);
        if (isNaN(updatedData[field])) {
          updatedData[field] = undefined;
        }
      } else if (updatedData[field] === '') {
        updatedData[field] = null; 
      }
    });

    // Validation des données avec Zod
    const validationResult = evenementSchema.safeParse(updatedData);
    if (!validationResult.success) {
      const presentFields = Object.keys(updatedData).filter(key => updatedData[key] !== undefined);
      const errors = validationResult.error.issues.filter(issue => 
        presentFields.includes(issue.path[0])
      );
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Validation échouée",
          errors: errors.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }
      return res.status(400).json({
        success: false,
        message: "Validation échouée",
        errors: validationResult.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    const data = validationResult.data || {};
    /* console.log('Données validées:', data); */

    //console.log("Entrée dans updateEvenementController");
    // Vérification du prestataire APRÈS validation
    if (data.id_hotel) {
      try {
        await checkPrestataireValidation(data.id_hotel, "hotel");
      } catch (error) {
        return handlePrestataireError(error, res, "Hôtel");
      }
    }

    // Vérifier si les nouvelles données existent DÉJÀ pour un AUTRE événement
    if (data.nom && data.description && data.date_debut && data.localisation) {
      const existingEvent = await findEvenementExistService({
        nom: data.nom,
        description: data.description,
        date_debut: data.date_debut,
        localisation: data.localisation
      }, id);

      // Si un événement existe ET que ce n'est pas l'événement en cours de modification
      if (existingEvent && existingEvent.id_evenement !== id) {
        return res.status(400).json({
          success: false,
          message: "Un autre événement avec ces caractéristiques (nom, description, date, localisation) existe déjà !"
        });
      }
    }

    // Mise à jour de l'événement
    const evenement = await updateEvenementService(id, data);

    if (!evenement) {
      return res.status(404).json({
        success: false,
        message: "Événement non trouvé avec l'ID: " + id
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: evenement, 
      message: 'Événement mis à jour avec succès' 
    });

  } catch (error) {
    console.error('Error in updateEvenementController:', error);
    
    // Gestion spécifique des erreurs Prisma
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        message: "Événement non trouvé" 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: "Erreur serveur lors de la mise à jour",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

  
/**
 * Déplacer vers la corbeille
 */
export const deleteEvenementController = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validation UUID (String)
    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "ID d'événement invalide"
      });
    }

    // Appel du service avec UUID string
    const result = await moveEvenementToTrashService(id);

    // Vérifier si l'événement a bien été trouvé et supprimé
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "L'événement n'existe pas."
      });
    }

    // Retourner la réponse de succès UNIQUEMENT si tout s'est bien passé
    return res.status(200).json({
      success: true,
      message: "Événement déplacé vers la corbeille",
    });

  } catch (error) {
    console.error("Error in deleteEvenementController:", error);

    // Prisma: record not found
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Événement non trouvé"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la suppression",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/**
 * Récuperer les evenement de la corbeille.
 */
export const getDeletedEvenementController = async (req, res) => {
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
    const events = await getAllEvenementService({page, limit});
    return res.status(200).json({
      success: true,
      data: events,
      pagination: events.pagination
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:"Erreur serveur lors de la récupération de la corbeille"

    });
  }
}


/**
 * Restaurer un evenement.
 */
export const restoreEvenementController = async (req, res) => {
  try {
    const { id } = req.params;
    const events = await restoreEvenementService(id);
    if (!events) {
      return res.status(404).json({
        success: false,
        message: "evenement non trouvé"
      });
    }
    return res.status(200).json({
      success: true,
      message: "evenement restauré avec succès",
      data: events
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:"Erreur serveur lors de la restauration"
    });

  }
}