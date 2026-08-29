import {
  getPendingPrestataires,
  getPrestataireById,
  schedulePrestataireInterview,
  validatePrestataire,
  rejectPrestataire
} from "../../services/prestataire/prestataire-validation.service.js";

import {
  sendPrestataireInterviewNotification,
  sendPrestataireValidatedNotification,
  sendPrestataireRejectedNotification
} from "../../services/notification/prestataire.notification.js";

/**
 * Liste des demandes prestataires
 */
export const getPendingPrestatairesController = async (req, res) => {
  try {
    let { page = "1", limit = "10", search, statut } = req.query;
    page  = Math.max(1, parseInt(page)  || 1);
    limit = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const result = await getPendingPrestataires({ page, limit, search, statut });

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error("GET PENDING PRESTATAIRES ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Détail d'un prestataire
 */
export const getPrestataireByIdController = async (req, res) => {
  try {
    const prestataire = await getPrestataireById(req.params.id);
    if (!prestataire) {
      return res.status(404).json({ success: false, message: "Prestataire introuvable" });
    }
    return res.status(200).json({ success: true, data: prestataire });
  } catch (error) {
    console.error("GET PRESTATAIRE ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Programmer un entretien
 * Body attendu : { dateEntretien, heureEntretien }
 */
export const scheduleInterviewController = async (req, res) => {
  try {
    const { id } = req.params;
    const { dateEntretien, heureEntretien } = req.body;

    if (!dateEntretien || !heureEntretien) {
      return res.status(400).json({
        success: false,
        message: "dateEntretien et heureEntretien sont requis"
      });
    }

    // Statut mis à jour sans stocker date/heure
    const prestataire = await schedulePrestataireInterview(id);

    // Email + PDF envoyés avec date/heure sans stockage BDD
    sendPrestataireInterviewNotification(prestataire, dateEntretien, heureEntretien)
      .catch(err => console.error("EMAIL ENTRETIEN ERROR:", err));

    return res.status(200).json({
      success: true,
      message: "Entretien programmé et convocation envoyée par email",
      data: prestataire
    });
  } catch (error) {
    console.error("SCHEDULE INTERVIEW ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Valider un prestataire
 */
export const validatePrestataireController = async (req, res) => {
  try {
    const { id } = req.params;
    const { prestataire, tempPassword } = await validatePrestataire(id);

    // Envoi email en arrière-plan
    sendPrestataireValidatedNotification(prestataire, tempPassword)
      .catch(err => console.error("EMAIL VALIDATION ERROR:", err));

    return res.status(200).json({
      success: true,
      message: "Prestataire validé et notifié par email",
      data: prestataire
    });
  } catch (error) {
    console.error("VALIDATE PRESTATAIRE ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Refuser un prestataire
 * Body attendu : { raison }
 */
export const rejectPrestataireController = async (req, res) => {
  try {
    const { id } = req.params;
    const { raison } = req.body;

    const prestataire = await rejectPrestataire(id);

    // Envoi email en arrière-plan
    sendPrestataireRejectedNotification(prestataire, raison)
      .catch(err => console.error("EMAIL REFUS ERROR:", err));

    return res.status(200).json({
      success: true,
      message: "Prestataire refusé et notifié par email",
      data: prestataire
    });
  } catch (error) {
    console.error("REJECT PRESTATAIRE ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};