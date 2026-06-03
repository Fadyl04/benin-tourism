import {
    loginUserService,
    registerClientService,
    registerPrestataireService,
    firstLoginChangePassword,
    requestPasswordReset,
    resetPassword,
    logoutUserService
} from '../../services/auth/auth.service.js';

import {
    getCookieOptions, 
    COOKIE_DURATIONS 
} from '../../config/cookie.config.js';
import { 
    loginSchema, 
    ClientSchema, 
    PrestataireSchema, 
    newPasswordSchema 
} from '../../utils/validators.js';


/**
 * Login (admin, client, prestataire)
 */
export const loginUserController = async (req, res) => {
    try {
        // Validaton des données entrées par zod
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Validation échouée",
                errors: parsed.error.issues.map(err => ({
                    field: err.path.join("."),
                    message: err.message,
                })),
            });
        }
        const { email, password } = parsed.data;
        const result = await loginUserService(email, password);

        const accessToken = result.token || result.accessToken;
        const refreshToken = result.refreshToken;

        if (!accessToken) {
            return res.status(500).json({ success: false, message: "Erreur lors de la génération des accès." });
        }

        res.setHeader('Vary', 'Cookie');

        res.cookie('accessToken', accessToken, getCookieOptions(COOKIE_DURATIONS.ACCESS_TOKEN));

        if (refreshToken) {
            res.cookie('refreshToken', refreshToken, getCookieOptions(COOKIE_DURATIONS.REFRESH_TOKEN));
        }

        return res.status(200).json({
            success: true,
            message: "Connexion réussie",
            data: result.user,
            forcePasswordChange: result.forcePasswordChange
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message || "Identifiants incorrects"
        });
    }
}

/**
 *  Register client
 */
export const registerClientController = async (req, res) => {
    try {
        const parsed = ClientSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Validation échouée",
                errors: parsed.error.issues.map(err => ({
                    field: err.path.join("."),
                    message: err.message,
                })),
            });
        }

        const { nom, prenom, email, password } = parsed.data;
        const client  = await registerClientService(parsed.data);
        return res.status(201).json({
            success: true,
            message: "Client inscrit avec succès",
            data: {
                id: client.id_user,
                nom: client.nom,
                prenom: client.prenom,
                email: client.email,
                role: client.role,
            },
        })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}


/**
 *  register prestataire
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
}

/**
 * FIRST LOGIN PASSWORD CHANGE
  */ 
export const firstLoginChangePasswordController = async (req, res) => {
    try {
        const { id_user } = req.user;

        const parsed = newPasswordSchema.safeParse(req.body);

        if (!parsed.success) {
        return res.status(400).json({
            success: false,
            message: "Validation échouée",
            errors: parsed.error.errors
        });
        }

        const result = await firstLoginChangePassword(
        id_user,
        parsed.data.newPassword
        );

        return res.status(200).json(result);

    } catch (error) {
        console.error('[CHANGE PASSWORD ERROR]', error);

        return res.status(500).json({
        success: false,
        message: error.message
        });
    }
};


/**
 * PASSWORD RESET REQUEST
 */
export const requestPasswordResetController = async (req, res) => {
    try {
        const { email } = req.body;

        await requestPasswordReset(email);

        return res.status(200).json({
            success: true,
            message: "Email de réinitialisation envoyé"
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


/** 
 * RESET PASSWORD
*/
export const resetPasswordController = async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;

        await resetPassword({ token, newPassword, confirmPassword });

        return res.status(200).json({
            success: true,
            message: "Mot de passe réinitialisé avec succès"
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


/**
 * Logout 
 */
export const logoutUserController = async (req, res) => {

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(200).json({
        success: true,
        message: "Déconnexion réussie"
    });
};