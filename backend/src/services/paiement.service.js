import prisma from '../config/db.config.js';
import { Transaction } from '../config/fedapay.sdk.js';

/**
 * Crée un lien de paiement FedaPay pour une réservation
 */
export const createPaymentLink = async ({ reservation, user }) => {
  try {
    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || 'localhost';

    const amountInCents = Math.round(Number(reservation.montant) * 100);

    const statutPaiement = 'en_attente';

    const transaction = await Transaction.create({
      description: `Paiement réservation #${reservation.id_reservation}`,
      amount: amountInCents,
      currency: { iso: 'XOF' },
      callback_url: `http://${HOST}:${PORT}/api/paiement/callback`,
      redirect_url: `http://${HOST}:${PORT}/reservation/success/${reservation.id_reservation}`,
      customer: {
        firstname: user.nom || 'Nom',
        lastname: user.prenom || 'Prenom',
        email: user.email || 'test@example.com'
      },
      metadata: { id_reservation: reservation.id_reservation }
    });

    if (!transaction?.payment_url) {
      console.warn('FedaPay transaction sans lien:', transaction);
      return null;
    }

    // Enregistrer l'ID FedaPay comme référence dans la base
    await prisma.paiement.create({
      data: {
        id_reservation: reservation.id_reservation,
        id_user: reservation.id_user,
        montant: Number(transaction.amount) / 100,
        statut: statutPaiement,          
        methode: 'mobile_money',       
        transaction: String(transaction.id)
      }
    });

    return { payment_url: transaction.payment_url, transactionId: String(transaction.id) };
  } catch (error) {
    console.error('Erreur création transaction FedaPay :', error);
    return null;
  }
};

/**
 * Callback FedaPay après paiement
 * Met à jour le statut de la réservation et les places disponibles
 */
export const PaiementCallbackService = async (transactionData) => {
  try {
    const { id_reservation, statut, id, amount, methode } = transactionData;

    if (!id) throw new Error('Transaction ID manquant');

    const montantPaye = amount ? Number(amount) / 100 : undefined;

    const statutPaiement =
      ['reussi', 'approved', 'paid'].includes(statut) ? 'reussi'
      : ['echec', 'failed'].includes(statut) ? 'echec'
      : 'en_attente';

    let methodePaiement = 'mobile_money';
    if (methode === 'card') methodePaiement = 'carte_bancaire';

    const reservation = await prisma.reservation.findUnique({
      where: { id_reservation }
    });

    if (!reservation) throw new Error('Réservation introuvable');

    let paiement;
    let placesRestantes = null;

    await prisma.$transaction(async (tx) => {

      const existingPaiement = await tx.paiement.findUnique({
        where: { transaction: String(id) }
      });

      let ancienStatut = null;

      if (existingPaiement) {
        ancienStatut = existingPaiement.statut;

        paiement = await tx.paiement.update({
          where: { transaction: String(id) },
          data: {
            statut: statutPaiement,
            montant: montantPaye ?? existingPaiement.montant,
            methode: methodePaiement
          }
        });

      } else {
        paiement = await tx.paiement.create({
          data: {
            id_reservation: reservation.id_reservation,
            id_user: reservation.id_user,
            montant: montantPaye ?? Number(reservation.montant),
            statut: statutPaiement,
            methode: methodePaiement,
            transaction: String(id)
          }
        });
      }

      // Vérification du montant (sécurité anti-fraude)
      if (statutPaiement === 'reussi' && montantPaye) {
        if (montantPaye !== Number(reservation.montant)) {
          throw new Error('Montant incohérent');
        }
      }

      // Décrémenter UNE SEULE FOIS
      const decremente =
        statutPaiement === 'reussi' &&
        (!existingPaiement || ancienStatut !== 'reussi');

      if (decremente) {

        // Confirmer la réservation
        await tx.reservation.update({
          where: { id_reservation: reservation.id_reservation },
          data: { statut: 'confirmee' }
        });

        // ----------- EVENEMENT -----------
        if (reservation.id_evenement) {

          const evenement = await tx.evenement.findUnique({
            where: { id_evenement: reservation.id_evenement }
          });

          if (!evenement)
            throw new Error('Événement introuvable');

          if (evenement.nombre_place < reservation.nombre_personnes)
            throw new Error('Places insuffisantes');

          const evenements = await tx.evenement.update({
            where: { id_evenement: reservation.id_evenement },
            data: {
              nombre_place: {
                decrement: reservation.nombre_personnes
              }
            }
          });

          placesRestantes = evenements.nombre_place;
        }

        // ----------- VISITE -----------
        if (reservation.id_visite) {

          const visite = await tx.visite.findUnique({
            where: { id_visite: reservation.id_visite }
          });

          if (!visite)
            throw new Error('Visite introuvable');

          if (visite.nombre_places < reservation.nombre_personnes)
            throw new Error('Places insuffisantes');

          const visites = await tx.visite.update({
            where: { id_visite: reservation.id_visite },
            data: {
              nombre_places: {
                decrement: reservation.nombre_personnes
              }
            }
          });

          placesRestantes = visites.nombre_places;
        }
      }
    });

    const updatedReservation = await prisma.reservation.findUnique({
      where: { id_reservation: reservation.id_reservation }
    });

    return {
      reservation: updatedReservation,
      paiement,
      places_restantes: placesRestantes
    };

  } catch (error) {
    console.error('Erreur callback paiement :', error);
    throw error;
  }
};