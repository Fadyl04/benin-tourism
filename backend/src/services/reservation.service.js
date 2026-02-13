import prisma from '../config/db.config.js';

/**
 * Créer une reservation
 */
export const createReservationService = async (data, id_user) => {
  const { id_visite, id_evenement, nombre_personnes, ticket_visite, ticket_evenement } = data;

  // --- Vérifications de base ---
  if (!id_evenement && !id_visite) {
    throw new Error("Une réservation doit concerner soit un évènement soit une visite.");
  }

  if (id_evenement && id_visite) {
    throw new Error("Une réservation ne peut concerner qu'un évènement OU une visite et non les deux");
  }

  if (!nombre_personnes || nombre_personnes <= 0) {
    throw new Error("Nombre de personnes invalide");
  }

  let montantTotal = 0;

  // ----- Cas ÉVÉNEMENT -----
  if (id_evenement) {
    const evenement = await prisma.evenement.findUnique({
      where: { id_evenement: Number(id_evenement) }
    });

    if (!evenement) throw new Error("Événement introuvable");
    if (evenement.nombre_place < nombre_personnes) throw new Error("Pas assez de places disponibles pour l'événement");
    if (!ticket_evenement) throw new Error("Veuillez choisir votre ticket pour l'événement le (ticket_evenement)");

    let prixEvenement;
    switch (ticket_evenement) {
      case "pass_vip": prixEvenement = evenement.prix_vip; break;
      case "pass_elite": prixEvenement = evenement.prix_elite; break;
      case "pass_premium": prixEvenement = evenement.prix_premium; break;
      case "pass_standard": prixEvenement = evenement.prix_standard; break;
      default: throw new Error("Type de ticket événement invalide");
    }

    montantTotal += Number(prixEvenement) * nombre_personnes;
  }

  // ----- Cas VISITE -----
  if (id_visite) {
    const visite = await prisma.visite.findUnique({
      where: { id_visite: Number(id_visite) }
    });

    if (!visite) throw new Error("Visite introuvable");
    if (visite.nombre_places < nombre_personnes) throw new Error("Pas assez de places disponibles pour la visite");
    if (!ticket_visite) throw new Error("Veuillez choisir votre ticket pour la visite le (ticket_visite)");

    let prixVisite;
    switch (ticket_visite) {
      case "pass_confort": prixVisite = visite.prix_confort; break;
      case "pass_premium": prixVisite = visite.prix_premium; break;
      case "pass_economique": prixVisite = visite.prix_economique; break;
      default: throw new Error("Type de ticket visite invalide");
    }

    montantTotal += Number(prixVisite) * nombre_personnes;
  }

  // ----- Création de la réservation -----
  const reservation = await prisma.reservation.create({
    data: {
      id_user: Number(id_user),
      id_visite: id_visite ? Number(id_visite) : null,
      id_evenement: id_evenement ? Number(id_evenement) : null,
      nombre_personnes,
      montant: montantTotal,
      statut: "en_attente",
      date_reservation: new Date(),
    },
  });

  return { 
    success: true, 
    data: reservation, 
    message: "Réservation créée avec succès. En attente de paiement." 
  };
};



/**
 * Récupérer toutes les réservations
 */
export const getAllReservationsService = async () => {
  return await prisma.reservation.findMany({
    include: {
      user: true,
      evenement: true,
      visite: true,
      paiements: true,
    },
    orderBy: {
      date_reservation: 'desc',
    },
  });
};

/**
 * Récupérer une réservation par ID
 */
export const getReservationByIdService = async (id) => {
    return await prisma.reservation.findUnique({
      where: { id_reservation: Number(id) },
      include: {
        user: true,
        evenement: true,
        visite: true,
        paiements: true,
      },
    });
};

/**
 * Annuler une reservation
 */
export const cancelReservationService = async (id) => {
  const reservation = await prisma.reservation.findUnique({
    where: { id_reservation: Number(id) },
  });

  if (!reservation) {
    throw new Error('Réservation introuvable');
  }
  // Si la réservation est déjà annulée
  if (reservation.statut === 'annulee') {
    throw new Error('Cette réservation est déjà annulée');
  }
  // Mise à jour du statut
  const updatedReservation = await prisma.reservation.update({
    where: { id_reservation: Number(id) },
    data: { statut: 'annulee' },
  });
  return updatedReservation;
};