import prisma from "../config/db.config.js";

/**
 * Créer un événement
 */
export const createEvenementService = async (data) => {
  return await prisma.evenement.create({ data });
};

/**
 * Récupérer tous les événements actifs par pargination
 */
export const getAllEvenementService = async ({ page = 1, limit = 10, categorie } = {}) => {
  const skip = (page - 1) * limit;
  const where = {
    isDeleted: false, ...(categorie && {categorie})
  };
  const [events, total] = await prisma.$transaction([
    prisma.evenement.findMany({
      where,
      orderBy: {  createdAt: "desc"},
      skip,
      take: limit
    }),
    prisma.evenement.count({
      where
    })
  ])
  const totalPages = Math.ceil(total / limit);
  return {
    data: events,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
    
  }
};

/**
 * Récupérer un événement par ID
 */
export const getEvenementByIdService = async (id) => {
  return await prisma.evenement.findUnique({
    where: { id_evenement: id, isDeleted: false },
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
 * Vérifier si un événement existe déjà par nom, description, date et localisation
 */
export const findEvenementExistService = async ({ nom, description, date_debut, localisation }, excludeId = null) => {
  const whereClause = {
    nom,
    description,
    date_debut,
    localisation,
    isDeleted: false
  };

  if (excludeId) {
    whereClause.id_evenement = { not: excludeId }; 
  }

  return await prisma.evenement.findFirst({
    where: whereClause
  });
};