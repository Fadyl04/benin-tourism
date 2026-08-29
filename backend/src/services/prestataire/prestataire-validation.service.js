import prisma from "../../config/db.config.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

/**
 * Générer un mot de passe temporaire aléatoire
 */
export const generateTempPassword = () => {
  return crypto.randomBytes(6).toString("base64url"); // ex: "aB3xK9mQ"
};

/**
 * Liste paginée des demandes prestataires
 */
export const getPendingPrestataires = async ({ page = 1, limit = 10, search, statut } = {}) => {
  const skip = (page - 1) * limit;

  const where = {
    isDeleted: false,
    ...(statut && { statut_validation: statut }),
    ...(search && {
      OR: [
        { ville:        { contains: search } },
        { user: { nom:    { contains: search } } },
        { user: { prenom: { contains: search } } },
        { user: { email:  { contains: search } } },
      ],
    }),
  };

  const [prestataires, total] = await prisma.$transaction([
    prisma.prestataire.findMany({
      where,
      include: {
        user: {
          select: { id_user: true, nom: true, prenom: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.prestataire.count({ where })
  ]);

  return {
    data: prestataires,
    pagination: {
      page, limit, total,
      totalPages: Math.ceil(total / limit),
      nextPage: page < Math.ceil(total / limit),
      previousPage: page > 1
    }
  };
};

/**
 * Récupérer un prestataire par ID
 */
export const getPrestataireById = async (id_prestataire) => {
  return await prisma.prestataire.findUnique({
    where: { id_prestataire },
    include: { user: true }
  });
};

/**
 * Passer en entretien
 */
export const schedulePrestataireInterview = async (id_prestataire) => {
  return await prisma.prestataire.update({
    where: { id_prestataire },
    data:  { statut_validation: "entretien" },
    include: { user: true }
  });
};

/**
 * Valider le prestataire — génère un mot de passe temporaire
 */
export const validatePrestataire = async (id_prestataire) => {
  const tempPassword   = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 12);

  const prestataire = await prisma.prestataire.update({
    where: { id_prestataire },
    data:  { statut_validation: "valide", statut: "actif" },
    include: { user: true }
  });

  // Mettre à jour le mot de passe dans User
  await prisma.user.update({
    where: { id_user: prestataire.user.id_user },
    data:  { password: hashedPassword, firstLogin: true }
  });

  return { prestataire, tempPassword };
};

/**
 * Refuser le prestataire
 */
export const rejectPrestataire = async (id_prestataire) => {
  return await prisma.prestataire.update({
    where: { id_prestataire },
    data:  { statut_validation: "refuse", statut: "inactif" },
    include: { user: true }
  });
};