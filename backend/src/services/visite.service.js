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
    image
  } = data;

  try {
    // Vérifier que le guide existe et est validé
    const guide = await prisma.prestataire.findUnique({ 
      where: { id_prestataire: id_guide } 
    });
    
    if (!guide || guide.statut_validation !== "valide" || guide.type !== "guide") {
      throw new Error("Le guide est introuvable ou non validé.");
    }

    // Vérifier l'hôtel si fourni
    if (id_hotel) {
      const hotelRecord = await prisma.prestataire.findUnique({ 
        where: { id_prestataire: id_hotel } 
      });
      
      if (!hotelRecord || hotelRecord.statut_validation !== "valide" || hotelRecord.type !== "hotel") {
        throw new Error("L'hôtel est introuvable ou non validé.");
      }
    }

    // Vérifier le transport si fourni
    if (id_transport) {
      const transportRecord = await prisma.prestataire.findUnique({ 
        where: { id_prestataire: id_transport } 
      });
      
      if (!transportRecord || transportRecord.statut_validation !== "valide" || transportRecord.type !== "transport") {
        throw new Error("Le transport est introuvable ou non validé.");
      }
    }

    // Vérifier les sites touristiques
    if (!Array.isArray(siteIds) || siteIds.length === 0) {
      throw new Error("Veuillez spécifier au moins un site touristique.");
    }

    // Vérifier que tous les sites existent
    const sites = await prisma.siteTouristique.findMany({
      where: {
        id_site: { in: siteIds }
      }
    });

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
        id_transport: id_transport || null,
        image: image || null,
        visiteSites: {
          create: siteIds.map((id_site) => ({
            site: {
              connect: { id_site: id_site }
            }
          }))
        }
      },
      include: { 
        visiteSites: {
          include: {
            site: true
          }
        },
        guide: true,
        hotel: true,
        transport: true
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
export const getAllVisiteService = async () => {
  return prisma.visite.findMany({
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
 * Récupérer les visites par son ID
 */
export const getVisiteByIdService = async (id_visite) => {
  const vid = Number(id_visite);
  if (!vid || isNaN(vid)) {
    throw new Error("Identifiant de visite invalide.");
  }

  return prisma.visite.findUnique({
    where: { id_visite: vid },
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
 * Supprimer une visite
 */
export const deleteVisiteService = async (id_visite) => {
  await prisma.visiteSite.deleteMany({ where: { id_visite: Number(id_visite) } });
  return prisma.visite.delete({ where: { id_visite: Number(id_visite) } });
};


/**
 * Mettre à jour une visite
 */
export const updateVisiteService = async (id_visite, data) => {
  const vid = Number(id_visite);
  if (isNaN(vid)) {
    throw new Error("Identifiant de visite invalide.");
  }

  // Extraire champs possibles
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
    siteIds
  } = data;

  // Vérification des prestataires
  const toCheck = [];
  if (id_guide !== undefined) toCheck.push({ id: Number(id_guide), type: "guide", name: "guide" });
  if (id_hotel !== undefined && id_hotel !== null) toCheck.push({ id: Number(id_hotel), type: "hotel", name: "hotel" });
  if (id_transport !== undefined && id_transport !== null) toCheck.push({ id: Number(id_transport), type: "transport", name: "transport" });

  if (toCheck.length > 0) {
    const checks = await Promise.all(
      toCheck.map(t => prisma.prestataire.findUnique({ where: { id_prestataire: t.id } }))
    );

    for (let i = 0; i < checks.length; i++) {
      const found = checks[i];
      const expected = toCheck[i];
      if (!found) throw new Error(`Le ${expected.name} avec id ${expected.id} est introuvable.`);
      if (found.type !== expected.type) throw new Error(`Le prestataire id ${expected.id} n'est pas de type ${expected.type}.`);
      if (found.statut_validation !== "valide") throw new Error(`Le ${expected.name} id ${expected.id} n'est pas validé.`);
    }
  }

  // Préparer l'objet updateData
  const updateData = {};

  if (nom !== undefined) updateData.nom = nom;
  if (description !== undefined) updateData.description = description;

  if (prix_economique !== undefined) updateData.prix_economique = parseFloat(prix_economique);
  if (prix_confort !== undefined) updateData.prix_confort = parseFloat(prix_confort);
  if (prix_premium !== undefined) updateData.prix_premium = parseFloat(prix_premium);

  if (nombre_places !== undefined) updateData.nombre_places = parseInt(nombre_places, 10);

  if (date_debut !== undefined) updateData.date_debut = new Date(date_debut);
  if (date_fin !== undefined) updateData.date_fin = new Date(date_fin);

  // id_guide toujours défini
  if (id_guide !== undefined) updateData.id_guide = Number(id_guide);

  // id_hotel et id_transport peuvent être null
  if (id_hotel !== undefined) updateData.id_hotel = id_hotel !== null ? Number(id_hotel) : null;
  if (id_transport !== undefined) updateData.id_transport = id_transport !== null ? Number(id_transport) : null;

  // image peut être null
  if (image !== undefined) updateData.image = image ?? null;

  // Mettre à jour les sites touristiques si fournis
  if (Array.isArray(siteIds)) {
    updateData.visiteSites = {
      deleteMany: {},
      create: siteIds.map(id_site => ({ id_site: Number(id_site) }))
    };
  }

  // Effectuer la mise à jour et renvoyer l'objet mis à jour (avec relations)
  const updated = await prisma.visite.update({
    where: { id_visite: vid },
    data: updateData,
    include: {
      guide: true,
      hotel: true,
      transport: true,
      visiteSites: { include: { site: true } }
    }
  });

  return updated;
};

/**
 * Rechercher une visite par nom
 */
export const searchVisiteService = async (nom) => {
  return prisma.visite.findMany({
    where: {
      nom: {
        contains: nom,
        mode: "insensitive"
      }
    },
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
 * Vérifier si la visite existe déjà par nom, description, date et localisation
 */
export const findVisiteExistService = async ({nom, description, date_debut}, excludeId = null) => {
  const clause = {
    nom: nom,
    description: description,
    date_debut: new Date(date_debut),
  } 
  if (excludeId) {
    clause.id_visite = {not: Number(excludeId)};
  }
  return await prisma.visite.findFirst({where: clause})
};