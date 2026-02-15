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

    // Corriger le montant (FedaPay renvoie en centimes)
    const montantPaye = amount ? Number(amount) / 100 : undefined;

    // Déterminer le statut du paiement
    const statutPaiement = ['reussi', 'approved', 'paid'].includes(statut) ? 'reussi'
      : ['echec', 'failed'].includes(statut) ? 'echec'
    : 'en_attente';

    // Mapper la méthode de paiement
    let methodePaiement = 'mobile_money';
    if (methode === 'card') methodePaiement = 'carte_bancaire';
    if (methode === 'mobile_money') methodePaiement = 'mobile_money';

    // Récupérer la réservation
    const reservation = await prisma.reservation.findUnique({
      where: { id_reservation }
    });
    if (!reservation) throw new Error('Réservation introuvable');

    let paiement;

    // Transaction atomique
    await prisma.$transaction(async (tx) => {
      // Vérifier si le paiement existe déjà
      const existingPaiement = await tx.paiement.findUnique({
        where: { transaction: String(id) }
      });

      if (existingPaiement) {
        // Mettre à jour le paiement existant
        paiement = await tx.paiement.update({
          where: { transaction: String(id) },
          data: {
            statut: statutPaiement,
            montant: montantPaye ?? existingPaiement.montant,
            methode: methodePaiement
          }
        });
      } else {
        // Créer un nouveau paiement
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

      // Si le paiement a réussi, mettre à jour la réservation et les places
      if (statutPaiement === 'reussi' && reservation.statut !== 'confirmee') {
        await tx.reservation.update({
          where: { id_reservation: reservation.id_reservation },
          data: { statut: 'confirmee' }
        });

        // Mise à jour des places pour l'événement
         // ✅ Décrément atomique événement
        if (reservation.id_evenement) {
          await tx.evenement.update({
            where: { id_evenement: reservation.id_evenement },
            data: {
              nombre_place: {
                decrement: reservation.nombre_personnes
              }
            }
          });
        }

        // ✅ Décrément atomique visite
        if (reservation.id_visite) {
          await tx.visite.update({
            where: { id_visite: reservation.id_visite },
            data: {
              nombre_places: {
                decrement: reservation.nombre_personnes
              }
            }
          });
        }
      }
    });

    // Recharger la réservation avec le statut mis à jour
    const updatedReservation = await prisma.reservation.findUnique({
      where: { id_reservation: reservation.id_reservation }
    });

    return { reservation: updatedReservation, paiement };
  } catch (error) {
    console.error('Erreur callback paiement :', error);
    throw error;
  }
};
