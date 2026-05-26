import prisma from '../../config/db.config.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../../utils/jwt.js';
import crypto from "crypto";
import { sendResetPasswordEmail } from '../../utils/sendMail.js';


// Génération d'un mot de passe aléatoire
export const generatePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

/* Login user */
export const loginUserService = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { prestataire: true }
  });

  if (!user) {
    throw new Error("Utilisateur introuvable");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Mot de passe incorrect");
  }

  // Blocage prestataire non validé
  if (
    user.role === "prestataire" &&
    user.prestataire?.statut_validation !== "valide"
  ) {
    throw new Error("Compte prestataire en attente de validation");
  }

  const token = generateToken({
    id_user: user.id_user,
    email: user.email,
    role: user.role
  });

  // règle FIRST LOGIN
  const forcePasswordChange =
    (user.role === "admin" || user.role === "prestataire") &&
    user.firstLogin === true;

  return {
    user: {
      id_user: user.id_user,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      firstLogin: user.firstLogin
    },
    token,
    forcePasswordChange
  };
};


/**
 * Le register client
 */
export const registerClientService = async ({ nom, prenom, email, password }) => {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error('Email déjà utilisé');

  const hashedPassword = await bcrypt.hash(password, 10);

  return await prisma.user.create({
    data: {
      nom,
      prenom,
      email,
      password: hashedPassword,
      role: 'client',
      firstLogin: false
    }
  });
};


/**
 * Inscription / demande prestataire
 */
export const registerPrestataireService = async (data) => {
  const {
    nom, prenom, email, password,
    type, genre, date_naissance,
    adresse, ville, telephone,
    annee_experience, document_justificatif, image
  } = data;

  try {
    // Vérification de l'unicité de l'email
    const existingUser = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (existingUser) {
      throw new Error('Email déjà utilisé');
    }

    // Vérification de l'unicité du téléphone
    const existingPhone = await prisma.prestataire.findFirst({
      where: { telephone }
    });

    if (existingPhone) {
      throw new Error('Numéro de téléphone déjà utilisé');
    }

    if (!date_naissance) {
     throw new Error("Date de naissance obligatoire");
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Création de l'utilisateur et du prestataire
    const newUser = await prisma.user.create({
      data: {
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'prestataire',
        firstLogin: true,
        prestataire: {
          create: {
            type,
            genre,
            date_naissance: new Date(date_naissance),
            adresse: adresse?.trim(),
            ville: ville?.trim(),
            telephone: telephone.trim(),
            annee_experience: parseInt(annee_experience),
            document_justificatif: document_justificatif || null,
            statut_validation: 'en_attente',
            image: image || null,
            statut: 'inactif'
          }
        }
      },
      include: { 
        prestataire: true 
      }
    });

    // Envoi d'email de confirmation (non bloquant)
    try {
      await demandeEnAttenteMail(
        newUser,
        "Votre inscription a été reçue et est en attente de validation par l'administrateur."
      );
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
    }

    // Retourner les données sans le mot de passe
    const { password: _, ...userWithoutPassword } = newUser;
    
    return userWithoutPassword;

  } catch (error) {
    console.error('Error in registerPrestataireService:', error);
    
    // Gestion spécifique des erreurs Prisma
    if (error.code === 'P2002') {
      const target = error.meta?.target?.[0];
      const message = target === 'email' 
        ? 'Email déjà utilisé' 
        : 'Une entrée avec ces informations existe déjà';
      throw new Error(message);
    }
    
    throw error;
  }
};

/* LogoutUser */
export const logoutUserService = async (user) => {
    // Ici user vient de req.user (grâce au middleware jwt)
  return {
    success: true,
    message: `Déconnexion réussie pour ${user.role}`,
  };
};

/* Changement du mot de passe pour le premier login */
export const firstLoginChangePassword = async (id_user, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id_user },
    data: {
      password: hashedPassword,
      firstLogin: false
    }
  });

  return {
    success: true,
    message: "Mot de passe mis à jour avec succès"
  };
};

/**
 * Service pour initier la réinitialisation du mot de passe
 * Génère un token unique et envoie un email avec le lien
 */
export const requestPasswordReset = async (email) => {

  const user = await prisma.user.findUnique({
    where: { email }
  });

  /**
   * IMPORTANT
   * Ne jamais révéler si email existe
   */
  if (!user) {
    return {
      success: true
    };
  }

  /**
   * Supprimer anciens tokens
   */
  await prisma.passwordReset.deleteMany({
    where: { email }
  });

  /**
   * TOKEN BRUT
   * envoyé par email
   */
  const rawToken =crypto.randomBytes(32).toString('hex');

  /**
   * TOKEN HASHÉ
   * stocké en base
   */
  const hashedToken =
    crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

  /**
   * Expiration
   * 15 minutes recommandé
   */
  const expiresAt =
    new Date(Date.now() + 15 * 60 * 1000);

  /**
   * STORE HASH ONLY
   */
  await prisma.passwordReset.create({
    data: {
      email,
      token: hashedToken,
      expiresAt
    }
  });

  /**
   * LINK EMAIL
   * contient token brut
   */
  const resetLink =
    `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

  /**
   * SEND EMAIL
   */
  await sendResetPasswordEmail(
    email,
    resetLink
  );

  return {
    success: true
  };
};

/* Service pour mettre à jour le mot de passe après vérification du token */
export const resetPassword = async ({
  token,
  newPassword,
  confirmPassword
}) => {

  /**
   * Validation mots de passe
   */
  if (newPassword !== confirmPassword) {
    throw new Error(
      'Les mots de passe ne correspondent pas'
    );
  }

  /**
   * HASH TOKEN REÇU
   * IMPORTANT
   */
  const hashedToken =
    crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

  /**
   * Recherche token hashé
   */
  const record =
    await prisma.passwordReset.findUnique({
      where: {
        token: hashedToken
      }
    });

  /**
   * Vérification existence
   */
  if (!record) {
    throw new Error('Lien invalide');
  }

  /**
   * Vérification expiration
   */
  if (record.expiresAt < new Date()) {

    /**
     * Nettoyage
     */
    await prisma.passwordReset.delete({
      where: {
        token: hashedToken
      }
    });

    throw new Error('Lien expiré');
  }

  /**
   * Hash password
   */
  const hashedPassword =
    await bcrypt.hash(newPassword, 12);

  /**
   * Update user password
   */
  await prisma.user.update({
    where: {
      email: record.email
    },
    data: {
      password: hashedPassword,
      firstLogin: false
    }
  });

  /**
   * Supprimer token utilisé
   */
  await prisma.passwordReset.delete({
    where: {
      token: hashedToken
    }
  });

  return {
    success: true,
    message:
      'Mot de passe réinitialisé avec succès'
  };
};
