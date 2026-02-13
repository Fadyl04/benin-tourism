import { forgotPasswordService } from '../../services/auth/forgotPassword.service.js';

/**
 * Contrôleur pour initier la réinitialisation du mot de passe
 */
export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    await forgotPasswordService(email);
    res.status(200).json({ message: 'Un email de réinitialisation a été envoyé' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || 'Erreur' });
  }
};

