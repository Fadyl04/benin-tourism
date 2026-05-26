import prisma from '../config/db.config.js';


/**
 * Récupérer le user (client) via son ID
 */
export const getClientByIdService = async (id_user) => {
  const user = await prisma.user.findUnique({
    where: { id_user },
    select: {
      id_user: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true
    } 
  });
  if (!user) {
    throw new Error('Utilisateur introuvable');
  }

  return user;
};
