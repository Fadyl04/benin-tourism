import {
  createEvenementService,
  getAllEvenementService,
  getEvenementByIdService,
  updateEvenementService,
  deleteEvenementService,
  searchEvenementService,
  findEvenementExistService

} from '../services/evenement.service.js';
import { evenementSchema } from '../utils/validators.js';

/**
 * Création d'un evenement
 */
export const createEvenementController = async (req, res) => {
  try {
    /* console.log('Données reçues:', req.body); */ // Debug
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    // Prétraitement des données
    const processedData = { ...req.body };
    
    // Gestion spécifique de prix_elite
    if (processedData.prix_elite === '' || processedData.prix_elite === 'null') {
      processedData.prix_elite = null;
    } else if (processedData.prix_elite) {
      processedData.prix_elite = Number(processedData.prix_elite);
    }

    // Conversion des autres champs numériques
    const numericFields = ['nombre_place', 'prix_standard', 'prix_vip', 'prix_premium'];
    numericFields.forEach(field => {
      if (processedData[field] !== undefined && processedData[field] !== '') {
        processedData[field] = Number(processedData[field]);
      }
    });

    /* console.log('Données traitées:', processedData); */

    // Validation des données
    const parsedData = evenementSchema.safeParse({ 
      ...processedData, 
      image: imagePath 
    });
    
    if (!parsedData.success) {
      const errorMessages = parsedData.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        value: issue.received
      }));

      return res.status(400).json({
        success: false,
        message: "Validation échouée",
        errors: errorMessages
      });
    }

    const data = parsedData.data;
    console.log('Données validées:', data);

    // Vérification de l'existence de l'événement
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

    // Création de l'événement
    const evenement = await createEvenementService(data);

    return res.status(201).json({
      success: true,
      data: evenement,
      message: 'Événement créé avec succès',
    });

  } catch (error) {
    console.error('Error de createEvenementController:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "Erreur serveur lors de la création de l'événement"
    });
  }
};


/**
 *  Récupérer tous les évènements
 */
export const getAllEvenementController = async (req, res) => {
  try {
    const evenements = await getAllEvenementService();
    res.status(200).json({success: true, data: evenements});
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
    const id = Number(req.params.id);
    /* console.log('ID de l\'événement à mettre à jour:', id); */
    
    if (isNaN(id)) {
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
    const parsed = evenementSchema.partial().safeParse(updatedData);
    if (!parsed.success) {
      const errorMessages = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        value: issue.received
      }));

      return res.status(400).json({
        success: false,
        message: "Validation échouée",
        errors: errorMessages
      });
    }

    const data = parsed.data;
    /* console.log('Données validées:', data); */

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
 * Supprimer un événement
 */
export const deleteEvenementController = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validation de l'ID
    const eventId = Number(id);
    if (isNaN(eventId)) {
      return res.status(400).json({ 
        success: false, 
        message: "ID d'événement invalide" 
      });
    }

    // Appel du service
    const result = await deleteEvenementService(eventId);

    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: "Événement non trouvé" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Événement supprimé avec succès',
      data: result 
    });

  } catch (error) {
    console.error('Error in deleteEvenementController:', error);
    
    // Gestion spécifique des erreurs Prisma
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        message: "Événement non trouvé" 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur lors de la suppression",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Rechercher un événement
 */
export const searchEvenementController = async (req, res) => {
  try {
    const { nom } = req.query;
    const resultats = await searchEvenementService(nom);
    res.status(200).json(resultats);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Erreur lors de la recherche' });
  }
};