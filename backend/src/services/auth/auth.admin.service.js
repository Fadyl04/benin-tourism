import prisma from "../../config/db.config.js";
import bcrypt from 'bcrypt';
import { generateToken } from "../../utils/jwt.js";
import { 
  validerPrestataireMail, 
  refuserPrestataireMail, 
  entretienPrestataireMail, 
  demandeEnAttenteMail 
} from "../../utils/sendMail.js";
import { generatePassword } from './auth.prestataire.service.js';  

/**
 * Connexion admin
 */
export const loginAdminService = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== 'admin') throw new Error('Email ou mot de passe incorrect');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Email ou mot de passe incorrect');

  const token = generateToken({ id_user: user.id_user, role: user.role });
  
  return {
    token,
    user: {
      id: user.id_user,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role
    }
  };
};

/**
 * Lister tous les prestataires
 */
export const getAllPrestatairesService = async () => {
  const prestataires = await prisma.user.findMany({
    where: { role: 'prestataire' },
    include: { prestataire: true },
    orderBy: { id_user: 'desc' }
  });

  return { success: true, data: prestataires, message: "Prestataires récupérés avec succès" };
};

/**
 * Valider un prestataire
 */
export const validerPrestataireService = async (Iduser) => {
  const userExist = await prisma.user.findUnique({ where: { id_user: Iduser }, include: { prestataire: true } });
  if (!userExist) throw new Error("Prestataire introuvable");

  const password = generatePassword();
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.update({
    where: { id_user: Iduser },
    data: {
      statut: 'actif',
      password: hashedPassword,
      firstLogin: true,
      prestataire: { update: { statut_validation: 'valide' } }
    },
    include: { prestataire: true }
  });

  await validerPrestataireMail(user.email, user.nom, user.prenom, password);

  return { success: true, data: user, message: "Prestataire validé avec succès" };
};

/**
 * Refuser un prestataire
 */
export const refuserPrestataireService = async (Iduser, raison) => {
  const userExist = await prisma.user.findUnique({ where: { id_user: Iduser }, include: { prestataire: true } });
  if (!userExist) throw new Error("Prestataire introuvable");

  const user = await prisma.user.update({
    where: { id_user: Iduser },
    data: {
      statut: 'refuse',
      prestataire: { update: { statut_validation: 'refuse' } }
    },
    include: { prestataire: true }
  });

  await refuserPrestataireMail(user.email, user.nom, user.prenom, raison);

  return { success: true, data: user, message: "Prestataire refusé avec succès" };
};


/**
 * Mettre le prestataire en attente d’entretien
 */
export const entretienPrestataireService = async (Iduser, dateEntretien, heureEntretien) => {
  const userExist = await prisma.user.findUnique({ where: { id_user: Iduser }, include: { prestataire: true } });
  if (!userExist) throw new Error("Prestataire introuvable");

  const user = await prisma.user.update({
    where: { id_user: Iduser },
    data: {
      statut: 'en_attente',
      prestataire: { update: { statut_validation: 'en_attente' } }
    },
    include: { prestataire: true }
  });

  await entretienPrestataireMail(user.email, user.nom, user.prenom, dateEntretien, heureEntretien);

  return { success: true, data: user, message: "Prestataire mis en attente d'entretien" };
};

/**
 * Mettre le prestataire en attente (notification mail)
 */
export const demandeEnAttenteService = async (Iduser, adminMessage) => {
  const user = await prisma.user.findUnique({ where: { id_user: Iduser }, include: { prestataire: true } });
  if (!user) throw new Error("Prestataire introuvable");

  await demandeEnAttenteMail(user, adminMessage);

  return { success: true, data: user, message: "Prestataire notifié de la mise en attente" };
};


/**
 * Compter le nombre de prestataires validés
 */
export const countPrestatairesValidesService = async () => {
  try {
    const total = await prisma.prestataire.count({
      where: {
        statut_validation: "valide" // à adapter selon ton enum
      }
    });
    return total;
  } catch (error) {
    throw new Error("Erreur lors du comptage des prestataires validés : " + error.message);
  }
};

/**
 * Compter le nombre de prestataires en attente
 */
export const countPrestatairesEnAttenteService = async () => {
  try {
    const total = await prisma.prestataire.count({
      where: {
        statut_validation: "en_attente"
      }
    });
    return total;
  } catch (error) {
    throw new Error("Erreur lors du comptage des prestataires en attente : " + error.message);
  }
};

/**
 * Compter le nombre de prestataires rejetés
 */
export const countPrestatairesRejetesService = async () => {
  try {
    const total = await prisma.prestataire.count({
      where: {
        statut_validation: "refuse"
      }
    });
    return total;
  } catch (error) {
    throw new Error("Erreur lors du comptage des prestataires rejetés : " + error.message);
  }
};

/**
 * Compter tous les prestataires
 */
export const countAllPrestatairesService = async () => {
  return await prisma.prestataire.count();
};

/**
 * Compter les prestataires par type
 */
export const countPrestatairesByTypeService = async (type) => {
  return await prisma.prestataire.count({
    where: { type }
  });
};

/**
 * Obtenir un résumé du nombre de prestataires par catégorie
 */
export const getPrestatairesStatsService = async () => {
  const hotels = await countPrestatairesByTypeService("hotel");
  const guides = await countPrestatairesByTypeService("guide");
  const transports = await countPrestatairesByTypeService("transport");
  const total = await countAllPrestatairesService();

  return {
    total,
    hotels,
    guides,
    transports,
  };
};

/**
 * Statistiques des places pour les évènements
 */
export const getEventStatsService = async () => {
  const totalPlaces = await prisma.evenement.aggregate({
    _sum: { nombre_place: true }
  });

  const occupied = await prisma.reservation.aggregate({
    _sum: { nombre_personnes: true },
    where: {
      id_evenement: { not: null },
      statut: "confirmee"
    }
  });

  return {
    type: "evenement",
    totalPlaces: totalPlaces._sum.nombre_place || 0,
    occupiedPlaces: occupied._sum.nombre_personnes || 0,
    remainingPlaces:
      (totalPlaces._sum.nombre_place || 0) -
      (occupied._sum.nombre_personnes || 0)
  };
};

/**
 * Statistiques des places pour les visites touristiques
 */
export const getVisitStatsService = async () => {
  const totalPlaces = await prisma.visite.aggregate({
    _sum: { nombre_places: true }
  });

  const occupied = await prisma.reservation.aggregate({
    _sum: { nombre_personnes: true },
    where: {
      id_visite: { not: null },
      statut: "confirmee"
    }
  });

  return {
    type: "visite",
    totalPlaces: totalPlaces._sum.nombre_places || 0,
    occupiedPlaces: occupied._sum.nombre_personnes || 0,
    remainingPlaces:
      (totalPlaces._sum.nombre_places || 0) -
      (occupied._sum.nombre_personnes || 0)
  };
};

/**
 * Stats globales (évènements + visites)
 */
export const getGlobalStatsService = async () => {
  const evenementStats = await getEventStatsService();
  const visiteStats = await getVisitStatsService();

  return {
    evenements: evenementStats,
    visites: visiteStats,
    global: {
      totalPlaces: evenementStats.totalPlaces + visiteStats.totalPlaces,
      occupiedPlaces: evenementStats.occupiedPlaces + visiteStats.occupiedPlaces,
      remainingPlaces: evenementStats.remainingPlaces + visiteStats.remainingPlaces
    }
  };
};
