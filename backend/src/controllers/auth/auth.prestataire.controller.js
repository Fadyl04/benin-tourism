import { date, success } from 'zod';
import {
  registerPrestataireService,
  loginPrestataireService,
  changePasswordService,
  deletePrestataireService,
  updatePrestataireService,
  showInfoPrestataireService
} from '../../services/auth/auth.prestataire.service.js';
import { PrestataireSchema, loginSchema, newPasswordSchema } from '../../utils/validators.js';
  
/**
 * Inscription d’un prestataire (demande de validation)
 */
export const registerPrestataireController = async (req, res) => {
  try {
    console.log("BODY REÇU:", req.body);
    console.log("FILES REÇUS:", req.files);

    // Récupération des fichiers
    const docFile = req.files?.document_justificatif?.[0] || null;
    const imageFile = req.files?.image?.[0] || null;

    // Vérification fichier justificatif obligatoire
    if (!docFile) {
      return res.status(400).json({
        success: false,
        message: "Le document justificatif est obligatoire"
      });
    }

    // Validation des données avec Zod
    const parsed = PrestataireSchema.safeParse(req.body);
    if (!parsed.success) {
      console.log("Validation errors:", parsed.error);

      // Messages d’erreur détaillés
      const errorDetails = parsed.error.errors.map(err => ({
        field: err.path.join("."),
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: errorDetails
      });
    }

    // Appel du service
    const user = await registerPrestataireService({
      ...parsed.data,
      document_justificatif: docFile.filename,
      image: imageFile ? imageFile.filename : null
    });

    return res.status(201).json({
      success: true,
      message: "Demande envoyée avec succès",
      data: {
        id: user.id_user,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Controller error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Erreur serveur"
    });
  }
};


  
/**
 * Connexion du prestataire
 */
export const loginPrestataireController = async (req, res) => {
  
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      const errorDetails = parsed.error;

      if (errorDetails && errorDetails.errors) {
        const validationErrors = errorDetails.errors.map(err => ({
          field: err.path?.join ? err.path.join(".") : err.path,
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Validation échouée",
          errors: validationErrors
        });
      }else {
        return res.status(400).json({
          success: false,
          message: "Validation échouée",
          errors: [{mesaage: "Erreur de validation"}]
        });
      }
    }

    const { email, password } = parsed.data;
    const result = await loginPrestataireService({ email, password });
    return res.status(200).json({success: true, message: 'Connexion réussie', ...result });
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};
  
/**
 * Changement de mot de passe après la première connexion (première connexion ou réinitialisation)
 */
export const changePasswordPrestataireController = async (req, res) => {
  try {
    const { id_user } = req.user; 
    const parsed = newPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation échouée",
        errors: parsed.error.errors.map(e => e.message)
      });
    }
    
    const { newPassword } = req.body;

    await changePasswordService({ id_user, newPassword });
    return res.status(200).json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Suppression d’un prestataire
 */
export const deletePrestataireController = async (req, res) => {
  try {
    const { id } = req.params;
    const prestataireId = Number(id);

    if (!id || isNaN(prestataireId)) {
      return res.status(400).json({
        success: false,
        message: "Identifiant de prestataire invalide."
      });
    }

    const deleted = await deletePrestataireService(prestataireId);

    return res.status(200).json({
      success: true,
      message: "Prestataire supprimé avec succès",
      data: deleted
    });

  } catch (error) {
    console.error("Erreur deletePrestataire :", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Prestataire non trouvé."
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de la suppression du prestataire."
    });
  }
}

/**
 * update d’un prestataire
 */
/**
 * Mise à jour d'un prestataire
 */
export const updatePrestataireController = async (req, res) => {
  try {
    const prestataireId = Number(req.params.id);
    if (!prestataireId) {
      return res.status(400).json({
        success: false,
        message: "Identifiant de prestataire invalide"
      });
    }

    // Fichiers uploadés
    const docFile = req.files?.document_justificatif?.[0];
    const imageFile = req.files?.image?.[0];

    // Fusion des données
    const updateData = {
      ...req.body,
      document_justificatif: docFile ? `/uploads/${docFile.filename}` : undefined,
      image: imageFile ? `/uploads/${imageFile.filename}` : undefined
    };

    // Conversion de type
    if (updateData.annee_experience) {
      updateData.annee_experience = parseInt(updateData.annee_experience);
    }

    // Validation avec Zod
    const validation = PrestataireSchema.partial().safeParse(updateData);
    if (!validation.success) {
      const errors = validation.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      return res.status(400).json({
        success: false,
        message: "Erreur de validation",
        errors
      });
    }

    // Vérification téléphone unique
    if (updateData.telephone) {
      const existingPhone = await prisma.prestataire.findFirst({
        where: {
          telephone: updateData.telephone,
          id_prestataire: { not: prestataireId }
        }
      });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "Ce numéro de téléphone est déjà utilisé"
        });
      }
    }

    // Vérification email unique
    if (updateData.email) {
      const current = await prisma.prestataire.findUnique({
        where: { id_prestataire: prestataireId },
        include: { user: true }
      });
      const emailExists = await prisma.user.findFirst({
        where: {
          email: updateData.email,
          id_user: { not: current.user.id_user }
        }
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Cet email est déjà utilisé"
        });
      }
    }

    // Mise à jour
    const prestataire = await updatePrestataireService(prestataireId, validation.data);
    if (!prestataire) {
      return res.status(404).json({
        success: false,
        message: "Prestataire non trouvé"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Prestataire mis à jour avec succès",
      data: prestataire
    });
  } catch (error) {
    console.error("Erreur updatePrestataireController:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Erreur serveur"
    });
  }
};


/**
 * Afficher les infos d'un prestataire
 */
export const showMePrestataireController = async (req, res) => {
  try {
    const { id_user } = req.user;

    const prestataire = await showInfoPrestataireService(id_user);

    if (!prestataire) {
      return res.status(404).json({
        success: false,
        message: "Prestataire non trouvé"
      });
    }

    return res.status(200).json({
      success: true,
      data: prestataire
    });

  } catch (error) {
    console.error("Error in showMePrestataireController:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Erreur serveur"
    });
  }
}   