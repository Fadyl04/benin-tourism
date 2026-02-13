import prisma from "../../config/db.config.js";

export const logoutService = async (user) => {
    // Ici user vient de req.user (grâce au middleware jwt)
  return {
    success: true,
    message: `Déconnexion réussie pour ${user.role}`,
  };
};
  