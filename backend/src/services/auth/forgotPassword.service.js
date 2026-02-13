import prisma from '../../config/db.config.js';
import { sendResetPasswordEmail } from '../../utils/sendMail.js';
import crypto from 'crypto';

/**
 * Service pour initier la réinitialisation du mot de passe
 * Génère un token unique et envoie un email avec le lien
 */
export const forgotPasswordService = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Aucun utilisateur trouvé avec cet email');

  // Générer un token aléatoire sécurisé
  const token = crypto.randomBytes(32).toString('hex');

  // Date d'expiration (ici 1 heure après maintenant)
  const expiresAt = new Date(Date.now() + 3600 * 1000);

  // Sauvegarder le token avec l'email et la date d'expiration
  await prisma.passwordReset.create({
    data: {
      email,
      token,
      expiresAt,
    }
  });

  // Construire le lien de réinitialisation
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  // Envoyer l'email avec le lien
  await sendResetPasswordEmail(email, resetLink);

  return true;
};