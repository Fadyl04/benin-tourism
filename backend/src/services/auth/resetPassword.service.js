import prisma from '../../config/db.config.js';
import bcrypt from 'bcrypt';

/**
 * Service pour mettre à jour le mot de passe après vérification du token
 */
export const resetPasswordService = async ({ token, newPassword, confirmPassword }) => {
  // Vérifier la correspondance des mots de passe
  if (newPassword !== confirmPassword) {
    throw new Error('Les mots de passe ne correspondent pas');
  }

  // Rechercher le token
  const record = await prisma.passwordReset.findUnique({ where: { token } });
  if (!record) {
    throw new Error('Lien invalide ou inexistant');
  }

  // Vérifier si le token est expiré
  if (record.expiresAt < new Date()) {
    throw new Error('Le lien de réinitialisation a expiré');
  }

  // Hacher le nouveau mot de passe
  const hashed = await bcrypt.hash(newPassword, 10);

  // Mettre à jour le mot de passe utilisateur
  await prisma.user.update({
    where: { email: record.email },
    data: { password: hashed, firstLogin: false }
  });

  // Supprimer le token utilisé
  await prisma.passwordReset.delete({ where: { token } });

  return true;
};
