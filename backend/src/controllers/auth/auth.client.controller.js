import { logoutService } from '../../services/auth/logout.service.js'; 
import {
    registerClientService,
    loginClientService,
} from '../../services/auth/auth.client.service.js';
import { ClientSchema, loginSchema } from '../../utils/validators.js';

/**
 * Inscription du client
 */
export const registerClientController = async (req, res) => {
    try {
      // Validation avec Zod
      const parsed = ClientSchema.safeParse(req.body);
  
      if (!parsed.success) {
        // Gestion robuste des erreurs Zod
        const validationErrors = Array.isArray(parsed.error?.issues)
          ? parsed.error.issues
          : Array.isArray(parsed.error?.errors)
          ? parsed.error.errors
          : [];
  
        return res.status(400).json({
          success: false,
          message: "Validation échouée",
          errors: validationErrors.length
            ? validationErrors.map(err => ({
                field: Array.isArray(err.path) ? err.path.join(".") : err.path,
                message: err.message,
              }))
            : [{ message: "Erreur de validation des données" }],
        });
      }
  
      const { nom, prenom, email, password } = parsed.data;
  
      const client = await registerClientService({ nom, prenom, email, password });
  
      return res.status(201).json({
        success: true,
        message: "Client inscrit avec succès",
        data: {
          id: client.id_user,
          nom: client.nom,
          prenom: client.prenom,
          email: client.email,
          role: client.role,
          statut: client.statut ?? undefined,
          firstLogin: client.firstLogin ?? undefined,
        },
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
};
  
  
/**
 * Connexion du client
 */
export const loginClientController = async (req, res) => {
  try {
    // Validation 
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      // Gestion robuste des erreurs de validation
      const errorDetails = parsed.error;
      
      // Vérification que l'erreur existe et a des détails
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
      } else {
        // Fallback si la structure d'erreur est inattendue
        return res.status(400).json({
          success: false,
          message: "Validation échouée",
          errors: [{ message: "Erreur de validation inconnue" }],
        });
      }
    }
  
    const { email, password } = parsed.data;
  
    const result = await loginClientService({ email, password });
  
    return res.status(200).json({
      success: true,
      message: "Connexion réussie",
      ...result,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * logout du client
 */
export const logoutClientController = async (req, res) => {
    try {
      const result = await logoutService(req.user); 
      return res.status(200).json({data: result});
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la déconnexion du client",
        error: error.message,
      });
    }
};