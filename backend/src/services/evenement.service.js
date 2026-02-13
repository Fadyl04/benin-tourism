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
    where: { id_evenement: Number(id) },
  });
};

/**
 * Mettre à jour un événement
 */
export const updateEvenementService = async (id, data) => {
  return await prisma.evenement.update({
    where: { id_evenement: parseInt(id, 10) },
    data,
  });
};
  
/**
 * Supprimer un événement
 */
export const deleteEvenementService = async (id) => {
  return await prisma.evenement.delete({
    where: { id_evenement: parseInt(id)},
  });
};

/**
 * Rechercher un événement
 */
export const searchEvenementService = async (nom) => {
  if (!nom || nom.trim() === '') {
    throw new Error('Le nom de l\'événement est requis pour la recherche');
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
  const clause = {
    nom: nom,
    description: description,
    date_debut: date_debut,
    localisation: localisation
  };
  if (excludeId) {
    clause.id_evenement = {not : Number(excludeId)}
  }
  return await prisma.evenement.findFirst({
    where: clause
  });
};
