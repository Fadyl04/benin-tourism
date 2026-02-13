import { resetPasswordService } from '../../services/auth/resetPassword.service.js';
import { newPasswordSchema } from '../../utils/validators.js';

/**
 * Contrôleur pour changer le mot de passe à partir d’un token
 */

export const resetPasswordController = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Le token est requis"
      });
    }

    // Validation avec Zod
    const parsed = newPasswordSchema.safeParse({ newPassword, confirmPassword });
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation échouée",
        errors: parsed.error.errors.map(err => ({
          field: err.path.join("."),
          message: err.message
        }))
      });
    }

    // Service pour reset le mot de passe
    await resetPasswordService({ token, newPassword });

    return res.status(200).json({
      success: true,
      message: "Mot de passe réinitialisé avec succès"
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erreur lors de la réinitialisation du mot de passe"
    });
  }
};