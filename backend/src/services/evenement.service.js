import prisma from "../config/db.config.js";

/**
 * Créer un événement
 */
export const createEvenementService = async (data) => {
  return await prisma.evenement.create({ data });
};

/**
 * Récupérer tous les événements
 */
export const getAllEvenementService = async () => {
  return await prisma.evenement.findMany({
      orderBy: { date_debut: 'asc' },
  });
};

/**
 * Récupérer un événement par ID
 */
export const getEvenementByIdService = async (id) => {
  return await prisma.evenement.findUnique({
    where: { id_evenement: id },
  });
};

/**
 * Mettre à jour un événement
 */
export const updateEvenementService = async (id, data) => {
  return await prisma.evenement.update({
    where: { id_evenement: id},
    data,
  });
};
  
/**
 * Supprimer un événement
 */
export const deleteEvenementService = async (id) => {
  try {
    return await prisma.evenement.delete({
      where: { id_evenement: id },
    });
  } catch (error) {
    if (error.code === "P2025") {
      return null; 
    }
    throw error;
  }
};

/**
 * Rechercher un événement
 */
export const searchEvenementService = async (nom) => {
  if (!nom || nom.trim() === '') {
    throw new Error("Le nom de l'événement est requis pour la recherche");
  }
  const evenements = await prisma.evenement.findMany({
    where: {
      nom: {
        contains: nom,
        mode: 'insensitive' 
      }
    }
  });
  
  return evenements;
};


/**
 * Vérifier si un événement existe déjà par nom, description, date et localisation
 */
export const findEvenementExistService = async ({ nom, description, date_debut, localisation }, excludeId = null) => {
  const whereClause = {
    nom,
    description,
    date_debut,
    localisation,
  };

  if (excludeId) {
    whereClause.id_evenement = { not: excludeId }; // PAS Number(excludeId)
  }

  return await prisma.evenement.findFirst({
    where: whereClause
  });
};