import prisma from "../config/db.config.js";

/**
 * Créer un événement
 */
export const createSiteService = async (data) => {
  return await prisma.siteTouristique.create({data});
};

/**
 * Récupérer tous les sites touristiques actifs par pargination
 */
export const getAllSiteService = async ({ page = 1, limit = 10, categorie } = {}) => {

  const skip = (page - 1) * limit;
  const where = { 
    isDeleted: false, ...(categorie && {  categorie})
  };
  const [sites, total] = await prisma.$transaction([
    prisma.siteTouristique.findMany({ 
      where,
      include: { visiteSites: true},
      orderBy: {  createdAt: "desc"},
      skip,
      take: limit
    }),
    prisma.siteTouristique.count({
      where
    })
  ]);
  const totalPages = Math.ceil(total / limit);
  return {
    data: sites,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }

  };

};

/**
 * Récupérer un site touristique par ID
 */
export const getSiteByIdService = async (id) => {
  return await prisma.siteTouristique.findUnique({
    where: { id_site: id, isDeleted: false },
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
 * Vérifier si un site touristique existe déjà par nom, description, date et localisation
 */
export const findSiteExistService = async ({ nom, description, localisation }, excludeId = null) => {
    const whereClause = {
      nom,
      description,
      localisation,
      isDeleted: false
    };
  
    if (excludeId) {
      whereClause.id_site = { not: excludeId }; 
    }
    return await prisma.siteTouristique.findFirst({
      where: whereClause
    });
};