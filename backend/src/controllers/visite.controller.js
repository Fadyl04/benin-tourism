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
      image: image,
      id_hotel: req.body.id_hotel === '' ? null : req.body.id_hotel,
      id_transport: req.body.id_transport === '' ? null : req.body.id_transport
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
      id_guide: Number(data.id_guide),
      id_hotel: data.id_hotel ? Number(data.id_hotel) : null,
      id_transport: data.id_transport ? Number(data.id_transport) : null,
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
    const visiteId = Number(id_visite);

    if (!id_visite || isNaN(visiteId)) {
      return res.status(400).json({
        success: false,
        message: "ID de visite invalide"
      });
    }

    const visite = await getVisiteByIdService(visiteId);

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
      const visiteId = Number(id_visite);
      if (isNaN(visiteId)) {
        return res.status(400).json({ 
          success: false, 
          message: "ID d'événement invalide" 
        });
      }
      const answers =  await deleteVisiteService(visiteId);
      if (!answers) {
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
    const visiteId = Number(id_visite);

    if (!id_visite || isNaN(visiteId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Identifiant de visite invalide." 
      });
    }

    // Gestion du fichier image
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    // Préparation des données pour validation
    const payload = { ...req.body, image };

    // Si siteIds fourni en string (JSON ou CSV), convertir en tableau de nombres
    if (payload.siteIds) {
      if (typeof payload.siteIds === "string") {
        try {
          const maybe = JSON.parse(payload.siteIds);
          payload.siteIds = Array.isArray(maybe) ? maybe.map(Number) : payload.siteIds.split(",").map(s => Number(s.trim()));
        } catch {
          payload.siteIds = payload.siteIds.split(",").map(s => Number(s.trim()));
        }
      }
      payload.siteIds = payload.siteIds.filter(id => !isNaN(id));
    }

    // Conversion sécurisée des champs numériques
    const numericFields = ["prix_economique", "prix_confort", "prix_premium", "nombre_places", "id_guide", "id_hotel", "id_transport"];
    numericFields.forEach(field => {
      if (payload[field] !== undefined && payload[field] !== null && payload[field] !== '') {
        payload[field] = Number(payload[field]);
      } else if (payload[field] === '') {
        payload[field] = null; // Pour les champs nullable
      }
    });

    // Validation avec Zod (partielle autorisée)
    const parsed = visiteSchema.partial().safeParse(payload);
    if (!parsed.success) {
      const errorMessages = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      
      return res.status(400).json({
        success: false,
        message: "Validation échouée",
        errors: errorMessages
      });
    }

    const visiteData = parsed.data;

    // Vérification des doublons (uniquement si les champs concernés sont modifiés)
    if (visiteData.nom && visiteData.description && visiteData.date_debut) {
      const existingVisite = await findVisiteExistService({
        nom: visiteData.nom,
        description: visiteData.description,
        date_debut: visiteData.date_debut
      }, visiteId);

      if (existingVisite && existingVisite.id_visite !== visiteId) {
        return res.status(400).json({
          success: false,
          message: "Une autre visite avec ces caractéristiques (nom, description, date) existe déjà !"
        });
      }
    }

    const updatedVisite = await updateVisiteService(visiteId, visiteData);

    if (!updatedVisite) {
      return res.status(404).json({ 
        success: false, 
        message: "Visite non trouvée." 
      });
    }

    return res.status(200).json({
      success: true,
      message: "Visite mise à jour avec succès",
      data: updatedVisite
    });

  } catch (error) {
    console.error("Erreur updateVisiteController :", error);

    // Gestion spécifique des erreurs Prisma
    if (error.code === "P2025") {
      return res.status(404).json({ 
        success: false, 
        message: "Visite non trouvée." 
      });
    }

    if (error.code === "P2002") {
      return res.status(400).json({ 
        success: false, 
        message: "Une visite avec ces caractéristiques existe déjà." 
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de la mise à jour de la visite"
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