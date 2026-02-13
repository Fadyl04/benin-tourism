import { email, success } from 'zod';
import {
  loginAdminService, 
  getAllPrestatairesService,
  validerPrestataireService,
  refuserPrestataireService,
  entretienPrestataireService,
  demandeEnAttenteService,
  countPrestatairesRejetesService,
  countAllPrestatairesService,
  countPrestatairesByTypeService,
  countPrestatairesEnAttenteService,
  countPrestatairesValidesService,
  getPrestatairesStatsService,
  getEventStatsService,
  getVisitStatsService,
  getGlobalStatsService

} from '../../services/auth/auth.admin.service.js';
import { logoutService } from '../../services/auth/logout.service.js';
import { loginSchema } from '../../utils/validators.js';


/**
 * Login
 */
export const loginAdminController = async (req, res) => {
  try {
    const login = loginSchema.safeParse(req.body);
    
    if (!login.success) {
      // Gestion robuste des erreurs Zod
      const validationErrors = login.error?.issues || login.error?.errors || [];

      return res.status(400).json({
        success: false,
        message: "Echec de validation",
        errors: validationErrors.length
          ? validationErrors.map(err => ({
              field: err.path?.join ? err.path.join(".") : err.path,
              message: err.message,
            }))
          : ["Erreur de validation"],
      });
    }

    const { email, password } = login.data;
    const result = await loginAdminService({ email, password });

    return res.status(200).json({
      success: true,
      token: result.token,
      user: result.user,
      message: "Connexion admin réussie",
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * Logout
 */
export const logoutAdminController = async (req, res) => {
  try {
    const result = await logoutService(req.user); 
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la déconnexion de l’admin",
      error: error.message,
    });
  }
};

/**
 * Lister tous les prestataires
 */
export const getAllPrestatairesController = async (req, res) => {
  try {
    const result = await getAllPrestatairesService();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Valider un prestataire
 */
export const validerPrestataireController = async (req, res) => {
  try {
    const { Iduser } = req.params;
    const result = await validerPrestataireService(parseInt(Iduser));
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Refuser un prestataire
 */
export const refuserPrestataireController = async (req, res) => {
  try {
    const { Iduser } = req.params;
    const { raison } = req.body;
    const result = await refuserPrestataireService(parseInt(Iduser), raison);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Mettre le prestataire en attente d'entretien
 */
export const entretienPrestataireController = async (req, res) => {
  try {
    const { Iduser } = req.params;
    const { dateEntretien, heureEntretien } = req.body;
    const result = await entretienPrestataireService(parseInt(Iduser), dateEntretien, heureEntretien);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Mettre le prestataire en attente (notification mail)
 */
export const demandeEnAttenteController = async (req, res) => {
  try {
    const { Iduser } = req.params;
    const { adminMessage } = req.body;
    const result = await demandeEnAttenteService(parseInt(Iduser), adminMessage);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Compter le nombre de prestataires validés
 */
export const countPrestatairesValidesController = async (req, res) => {
  try {
    const total = await countPrestatairesValidesService();
    res.status(200).json({ success: true, data: total, message: "Nombre de prestataires validés" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Compter le nombre de prestataires en attente
 */
export const countPrestatairesEnAttenteController = async (req, res) => {
  try {
    const total = await countPrestatairesEnAttenteService();
    res.status(200).json({ success: true, data: total, message: "Nombre de prestataires en attente" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Compter le nombre de prestataires rejetés
 */
export const countPrestatairesRejetesController = async (req, res) => {
  try {
    const total = await countPrestatairesRejetesService();
    res.status(200).json({ success: true, data: total, message: "Nombre de prestataires rejetés" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Compter tous les prestataires
 */
export const countAllPrestatairesController = async (req, res) => {
  try {
    const total = await countAllPrestatairesService();
    res.status(200).json({ success: true, data: total, message: "Nombre total de prestataires" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Compter les prestataires par type
 */
export const countPrestatairesByTypeController = async (req, res) => {
  try {
    const { type } = req.params; // type = "guide", "hotel" ou "transport"
    const total = await countPrestatairesByTypeService(type);
    res.status(200).json({ success: true, data: total, message: `Nombre de prestataires de type ${type}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Obtenir un résumé du nombre de prestataires par catégorie
 */
export const getPrestatairesStatsController = async (req, res) => {
  try {
    const stats = await getPrestatairesStatsService();
    res.status(200).json({ success: true, data: stats, message: "Statistiques des prestataires" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Statistiques des places pour les évènements
 */
export const getEventStatsController = async (req, res) => {
  try {
    const stats = await getEventStatsService();
    res.status(200).json({
      success: true,
      data: stats,
      message: "Statistiques des places pour les événements"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Statistiques des places pour les visites touristiques
 */
export const getVisitStatsController = async (req, res) => {
  try {
    const stats = await getVisitStatsService();
    res.status(200).json({
      success: true,
      data: stats,
      message: "Statistiques des places pour les visites touristiques"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Stats globales (évènements + visites)
 */
export const getGlobalStatsController = async (req, res) => {
  try {
    const stats = await getGlobalStatsService();
    res.status(200).json({
      success: true,
      data: stats,
      message: "Statistiques globales des places"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};