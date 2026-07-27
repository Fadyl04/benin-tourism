import { constants } from "node:buffer";
import prisma from "../config/db.config.js";

/**
 * Créer une visite
 */
export const createVisiteService = async (data) => {
  const {
    nom,
    description,
    prix_economique,
    prix_confort,
    prix_premium,
    nombre_places,
    date_debut,
    date_fin,
    id_guide,
    id_hotel,
    id_transport,
    siteIds,
    image,
    lieu_date_depart,
    parcours
  } = data;

  try {

    // Vérifier que le guide existe et est validé
    const guide = await prisma.prestataire.findUnique({ where: { id_prestataire: id_guide } });
    if (!guide || guide.statut_validation !== "valide" || guide.type !== "guide") {
      throw new Error("Le guide est introuvable ou non validé.");
    }
    
    // Vérifier l'hôtel si fourni
    if (id_hotel) {
      const hotel = await prisma.prestataire.findUnique({ where: { id_prestataire: id_hotel } });
      if (!hotel || hotel.statut_validation !== "valide" || hotel.type !== "hotel") {
        throw new Error("L'hôtel est introuvable ou non validé.");
      }
    }

    // Vérifier le transport si fourni
    if (id_transport) {
      const transport = await prisma.prestataire.findUnique({ where: { id_prestataire: id_transport } });
      if (!transport || transport.statut_validation !== "valide" || transport.type !== "transport") {
        throw new Error("Le transport est introuvable ou non validé.");
      }
    }

    // Vérifier les sites touristiques
    if (!Array.isArray(siteIds) || siteIds.length === 0) {
      throw new Error("Veuillez spécifier au moins un site touristique.");
    }
    const sites = await prisma.siteTouristique.findMany({ where: { id_site: { in: siteIds } } });
    if (sites.length !== siteIds.length) {
      throw new Error("Un ou plusieurs sites touristiques sont introuvables.");
    }

    // Création de la visite avec gestion propre des relations
    const visite = await prisma.visite.create({
      data: {
        nom,
        description,
        prix_economique,
        prix_confort,
        prix_premium,
        nombre_places,
        date_debut: new Date(date_debut),
        date_fin: new Date(date_fin),
        id_guide,
        id_hotel: id_hotel || null,
        id_transport: id_transport,
        lieu_date_depart,
        parcours: parcours || null,
        image: image || null,
        visiteSites: {
          create: siteIds.map(id_site => ({ site: { connect: { id_site } } }))
        }
      },
      include: {
        guide: true,
        hotel: true,
        transport: true,
        visiteSites: { include: { site: true } }
      }
    });

    return visite;

  } catch (error) {
    console.error('Error in createVisiteService:', error);
    
    // Gestion spécifique des erreurs Prisma
    if (error.code === 'P2002') {
      throw new Error("Une visite avec ces caractéristiques existe déjà.");
    }
    if (error.code === 'P2003') {
      throw new Error("Référence introuvable: un ID fourni n'existe pas.");
    }
    
    throw error;
  }
};

/**
 * Récupérer toutes les visites
 */
export const getAllVisiteService = async ({ page = 1, limit = 10, categorie, search } = {}) => {
  const skip = (page - 1) * limit;
  const where = {
    isDeleted: false,
    ...(search && {
      OR: [
        { nom: { constants: search } },
        { description:  { contains: search } },
        { date_debut: {contains : search} }
      ],
    }),
  };
  const [visites, total] = await prisma.$transaction([
    prisma.visite.findMany({
      where,
      skip,
      take: limit
    }),
    prisma.visite.count({ where })
  ]);
  const totalPages = Math.ceil(total / limit);
  return {
    data: visites,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    },
    include: {
      guide: true,
      hotel: true,
      transport: true,
      visiteSites: {
        include: { site: true }
      }
    }
  };
};

/**
 * Récupérer les visites par son ID
 */
export const getVisiteByIdService = async (id_visite) => {
  return prisma.visite.findUnique({
    where: { id_visite },
    include: {
      guide: true,
      hotel: true,
      transport: true,
      visiteSites: {
        include: { site: true }
      }
    }
  });
};



/**
 * Mettre à jour une visite
 */
export const updateVisiteService = async (id_visite, data) => {
  const {
    nom,
    description,
    prix_economique,
    prix_confort,
    prix_premium,
    nombre_places,
    date_debut,
    date_fin,
    id_guide,
    id_hotel,
    id_transport,
    image,
    siteIds,
    lieu_date_depart,
    parcours
  } = data;

  const updateData = {};

  if (nom !== undefined) updateData.nom = nom;
  if (description !== undefined) updateData.description = description;
  if (prix_economique !== undefined) updateData.prix_economique = prix_economique;
  if (prix_confort !== undefined) updateData.prix_confort = prix_confort;
  if (prix_premium !== undefined) updateData.prix_premium = prix_premium;
  if (nombre_places !== undefined) updateData.nombre_places = nombre_places;
  if (date_debut !== undefined) updateData.date_debut = new Date(date_debut);
  if (date_fin !== undefined) updateData.date_fin = new Date(date_fin);
  if (id_guide !== undefined) updateData.id_guide = id_guide;
  if (id_hotel !== undefined) updateData.id_hotel = id_hotel || null;
  if (id_transport !== undefined) updateData.id_transport = id_transport || null;
  if (image !== undefined) updateData.image = image || null;
  if (lieu_date_depart !== undefined) updateData.lieu_date_depart = lieu_date_depart;
  if (parcours !== undefined) updateData.parcours = parcours || null;

  if (Array.isArray(siteIds)) {
    updateData.visiteSites = {
      deleteMany: {},
      create: siteIds.map(id_site => ({ site: { connect: { id_site } } }))
    };
  }

  return prisma.visite.update({
    where: { id_visite },
    data: updateData,
    include: {
      guide: true,
      hotel: true,
      transport: true,
      visiteSites: { include: { site: true } }
    }
  });
};


/**
 * Vérifier si la visite existe déjà par nom, description, date et localisation
 */
export const findVisiteExistService = async ({nom, description, date_debut}, excludeId = null) => {
  const clause = {
    nom: nom,
    description: description,
    date_debut: new Date(date_debut),
  } 
  if (excludeId) {
   clause.id_visite = { not: excludeId };
  }
  return await prisma.visite.findFirst({where: clause})
};