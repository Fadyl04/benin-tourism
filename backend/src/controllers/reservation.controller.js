import {
  createReservationService,
  getAllReservationsService,
  getReservationByIdService,
  cancelReservationService

} from '../services/reservation.service.js';
import { reservationSchema } from '../utils/validators.js';

/**
 * Créer une reservation
 */
export const createReservationController = async (req, res) => {
  try {
    // Validation des données 
    const parsed = reservationSchema.safeParse({ 
      ...req.body, 
      id_user: req.user.id_user 
    });
    
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

    const reservationData = parsed.data;

    // Création de la réservation
    const reservation = await createReservationService(reservationData, req.user.id_user);
    
    res.status(201).json({ 
      success: true, 
      data: reservation, 
      message: 'Réservation créée, en attente de paiement.' 
    });

  } catch (error) {
    console.error('Error in createReservationController:', error);
    
    // Gestion spécifique des erreurs
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        success: false, 
        message: "Une réservation existe déjà pour ces critères." 
      });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        success: false, 
        message: "Référence introuvable: l'utilisateur ou la visite n'existe pas." 
      });
    }
    
    if (error.message.includes('plus de places disponibles')) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: error.message || "Erreur serveur lors de la création de la réservation" 
    });
  }
};

/**
 * Récupérer toutes les reservations
 */
export const getAllReservationsController = async (req, res) => {
    try {
      const reservations = await getAllReservationsService();
      res.status(200).json({ success: true, data: reservations });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
};
  
/**
 * Récupérer une reservation par son ID
 */
export const getReservationByIdController = async (req, res) => {
  try {
    const reservation = await getReservationByIdService(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Réservation non trouvée' });
    }
    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Annuler une reservation
 */
export const cancelReservationController = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validation de l'ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de réservation manquant"
      });
    }

    const reservationId = Number(id);
    if (isNaN(reservationId)) {
      return res.status(400).json({
        success: false,
        message: "ID de réservation invalide"
      });
    }

    // Annulation de la réservation
    const canceledReservation = await cancelReservationService(reservationId);
    
    if (!canceledReservation) {
      return res.status(404).json({
        success: false,
        message: "Réservation non trouvée"
      });
    }

    res.status(200).json({
      success: true,
      message: 'Réservation annulée avec succès',
      data: canceledReservation,
    });

  } catch (error) {
    console.error('Error in cancelReservationController:', error);
    
    // Gestion spécifique des erreurs Prisma
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: "Réservation non trouvée"
      });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: "Opération non autorisée sur cette réservation"
      });
    }

    // Gestion des erreurs métier
    if (error.message.includes('déjà annulée')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('trop tard')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'annulation de la réservation"
    });
  }
};