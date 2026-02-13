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
        where: { id_site: Number(id) },
        include: { visiteSites: true }
      });
};

/**
 * Mettre à jour un événement
 */
export const updateSiteService = async (id, data) => {
    return await prisma.siteTouristique.update({
        where: { id_site: parseInt(id) },
        data
    });
};
  
/**
 * Supprimer un événement
 */
export const deleteSiteService = async (id) => {
  try {
    const siteId = parseInt(id);
    
    // Vérifier d'abord si le site existe
    const existingSite = await prisma.siteTouristique.findUnique({
      where: { id_site: siteId }
    });

    if (!existingSite) {
      return null;
    }

    // Supprimer le site
    return await prisma.siteTouristique.delete({
      where: { id_site: siteId }
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
      nom: nom,
      description: description,
      localisation: localisation
    };
  
    if (excludeId) {
      whereClause.id_site = { not: Number(excludeId) }; 
    }
    return await prisma.siteTouristique.findFirst({
      where: whereClause
    });
};