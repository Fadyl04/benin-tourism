import prisma from "../config/db.config.js";

/**
 * Créer un événement
 */
export const createSiteService = async (data) => {
  return await prisma.siteTouristique.create({data});
};

/**
 * Récupérer tous les sites touristiques
 */
export const getAllSiteService = async () => {
  return await prisma.siteTouristique.findMany({
    include: {
      visiteSites: true
    }
  });
};

/**
 * Récupérer un site touristique par ID
 */
export const getSiteByIdService = async (id) => {
  return await prisma.siteTouristique.findUnique({
    where: { id_site: id },
    include: { visiteSites: true }
  });
};

/**
 * Mettre à jour un site touristique
 */
export const updateSiteService = async (id, data) => {
    return await prisma.siteTouristique.update({
        where: { id_site: id },
        data
    });
};
  
/**
 * Supprimer un site touristique
 */
export const deleteSiteService = async (id) => {
  try {
    // Supprimer le site
    return await prisma.siteTouristique.delete({
      where: { id_site: id }
    });

  } catch (error) {
    console.error('Error in deleteSiteService:', error);
    
    if (error.code === 'P2025') {
      return null; // Site non trouvé
    }
    
    throw error;
  }
};

/**
 * Rechercher un événement
 */
export const searchSiteService = async (nom) => {
    return await prisma.siteTouristique.findMany({
        where: {
          nom: {
            contains: nom,
            mode: 'insensitive' 
          }
        }
    });
};

/**
 * Vérifier si un site touristique existe déjà par nom, description, date et localisation
 */
export const findSiteExistService = async ({ nom, description, localisation }, excludeId = null) => {
    const whereClause = {
      nom,
      description,
      localisation
    };
  
    if (excludeId) {
      whereClause.id_site = { not: excludeId }; 
    }
    return await prisma.siteTouristique.findFirst({
      where: whereClause
    });
};