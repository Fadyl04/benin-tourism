import prisma from '../config/db.config.js';
import { 
  createPaymentLink,
  PaiementCallbackService
} from '../services/paiement.service.js';
import { getClientByIdService } from '../services/auth/auth.client.service.js';
import { getReservationByIdService } from '../services/reservation.service.js';

/**
 * Payer la réservation via Fedapay
 */
export const payReservationController = async (req, res) => {
  try {
    const { id_reservation } = req.body;
    const userId = req.user.id_user;

    // Vérifier si la réservation existe
    const reservation = await getReservationByIdService(id_reservation);
    if (!reservation) {
      return res.status(404).json({ success: false, message: "Réservation non trouvée" });
    }

    // Vérifier si l'utilisateur est connecté
    const user = await getClientByIdService(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non connecté" });
    }

    // Empêcher le paiement si la date de l'événement est déjà passée
    if (reservation.evenement && new Date(reservation.evenement.date_debut) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Impossible de payer : la date de l'événement est déjà passée."
      });
    }

    // Empêcher le paiement si la date de la visite est déjà passée
    if (reservation.visite && new Date(reservation.visite.date_debut) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Impossible de payer : la date de la visite est déjà passée."
      });
    }

    //Créer le lien de paiement
    const transaction = await createPaymentLink({ reservation, user });
    if (!transaction?.payment_url) {
      return res.status(400).json({
        success: false,
        message: "Impossible de générer le lien de paiement"
      });
    }

    // Succès
    res.status(200).json({
      success: true,
      paymentUrl: transaction.payment_url,
      transactionId: transaction.transactionId
    });
  } catch (error) {
    console.error("Erreur payReservationController :", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * Controller pour gérer le callback FedaPay après paiement
 */
export const paiementCallbackController = async (req, res) => {
  try {
    /* console.log("CALLBACK QUERY:", req.query);
    console.log("CALLBACK BODY:", req.body); */

    // On prend les données depuis body ou query
    const payload = Object.keys(req.body || {}).length > 0 ? req.body : req.query;

    // Vérifier qu'on a la transaction
    const transactionId = payload.id || payload.transaction; // accepte id ou transaction
    if (!transactionId) {
      return res.status(400).json({ success: false, message: 'Transaction ID manquant' });
    }

    // Vérifier si le paiement existe déjà
    const paiement = await prisma.paiement.findUnique({
      where: { transaction: String(transactionId) }
    });

    if (!paiement) {
      return res.status(404).json({ success: false, message: 'Paiement introuvable' });
    }

    // Déterminer le statut du paiement
    const statut = payload.status
      ? (payload.status === "approved" ? "reussi" : "echec")
      : "reussi"; // par défaut à "reussi" si status manquant pour test manuel

    // Déterminer la méthode de paiement
    const methode = payload.payment_method || "mobile_money"; // par défaut "mobile_money"

    const transactionData = {
      id_reservation: paiement.id_reservation,
      statut,
      id: transactionId,
      amount: payload.amount,         
      methode
    };

    // Récupérer aussi places_restantes depuis le service
    const { reservation, paiement: updatedPaiement, places_restantes } = await PaiementCallbackService(transactionData);

    // Récupérer les infos complémentaires pour la réponse
    let evenement = null;
    let visite = null;
    
    if (reservation.id_evenement) {
      evenement = await prisma.evenement.findUnique({
        where: { id_evenement: reservation.id_evenement },
        select: { 
          nom: true, 
          nombre_place: true,
          date_debut: true
        }
      });
    }
    
    if (reservation.id_visite) {
      visite = await prisma.visite.findUnique({
        where: { id_visite: reservation.id_visite },
        select: { 
          nom: true, 
          nombre_places: true,
          date_debut: true,
          lieu_date_depart: true
        }
      });
    }

    // Retourner une réponse enrichie
    return res.status(200).json({
      success: true,
      message: 'Paiement traité avec succès',
      data: { 
        reservation: {
          id: reservation.id_reservation,
          statut: reservation.statut,
          montant: reservation.montant,
          nombre_personnes: reservation.nombre_personnes,
          date_reservation: reservation.date_reservation
        },
        paiement: {
          id: updatedPaiement.id_paiement,
          statut: updatedPaiement.statut,
          montant: updatedPaiement.montant,
          methode: updatedPaiement.methode,
          transaction: updatedPaiement.transaction,
          date_paiement: updatedPaiement.date_paiement
        },
        // NOUVEAU : places restantes
        places_restantes: places_restantes || evenement?.nombre_place || visite?.nombre_places,
        // Infos détaillées
        details: {
          type: evenement ? 'evenement' : 'visite',
          nom: evenement?.nom || visite?.nom,
          date: evenement?.date_debut || visite?.date_debut,
          places_disponibles: evenement?.nombre_place || visite?.nombre_places
        }
      }
    });

  } catch (error) {
    console.error('❌ Erreur paiementCallbackController :', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur lors du traitement du paiement' 
    });
  }
};