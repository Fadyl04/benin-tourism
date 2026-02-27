import prisma from '../../config/db.config.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../../utils/jwt.js';
import {validerPrestataireMail, refuserPrestataireMail, entretienPrestataireMail, demandeEnAttenteMail} from '../../utils/sendMail.js';   

// Génération d'un mot de passe aléatoire
export const generatePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
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



/**
 * Connexion prestataire
 */
export const loginPrestataireService = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { prestataire: true } 
  });
  if (!user || user.role !== 'prestataire') throw new Error('Prestataire introuvable');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Mot de passe incorrect');

  // Vérification validation admin
  if (!user.prestataire || user.prestataire.statut_validation !== 'valide') {
    throw new Error("Compte non validé par l'administrateur");
  }

  const token = generateToken({
    id_user: user.id_user,
    role: user.role,
    firstLogin: user.firstLogin
  });

  return {
    token,
    user: {
      id: user.id_user,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      firstLogin: user.firstLogin
    }
  };
};

/**
 * Changement de mot de passe (première connexion ou réinitialisation)
 */
export const changePasswordService = async ({ id_user, newPassword }) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id_user },
    data: {
      password: hashedPassword,
      firstLogin: false
    }
  });

  return true;
};

/**
 * Validation prestataire par admin (envoi mail avec identifiants)
 */
export const validerPrestataireService = async (user) => {
  const password = generatePassword();
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id_user: user.id_user },
    data: {
      password: hashedPassword,
      firstLogin: true,
      prestataire: {
        update: {
          statut_validation: 'valide',
          statut: 'inactif'
        } 
      }
    }   
  });

  await validerPrestataireMail(user.email, user.nom, user.prenom, password);

  return true;
};

/**
 * Refus prestataire par admin (envoi mail de refus)
 */
export const refuserPrestataireService = async (user, raison) => {
  await prisma.user.update({
    where: { id_user: user.id_user },
    data: {
      prestataire: { 
        update: {
         statut_validation: 'refuse',
          statut: 'refuse'
        } 
      }
    }
  });

  await refuserPrestataireMail(user.email, user.nom, user.prenom, raison);

  return true;
};

/**
 * Convocation prestataire à un entretien (admin définit la date & heure)
 */
export const entretienPrestataireService = async (user, dateEntretien, heureEntretien) => {
  await prisma.user.update({
    where: { id_user: user.id_user },
    data: {
      prestataire: { update: { statut_validation: 'en_attente' } }
    }
  });

  await entretienPrestataireMail(user.email, user.nom, user.prenom, dateEntretien, heureEntretien);

  return true;
};

/**
 * Récupérer un prestataire par ID
 */
export const getPrestataireByIdService = async (id) => {
  const prestataire = await prisma.prestataire.findUnique({
    where: { id_prestataire: id },
    include: { user: true },
  });

  if (!prestataire) throw new Error("Prestataire introuvable");
  return prestataire;
};

/**
 * Suppression d’un prestataire
 */
export const deletePrestataireService = async (id) => {
  return prisma.prestataire.delete({
    where: { id_prestataire: id },
  });
};


/**
 * Mise à jour d'un prestataire
 */
export const updatePrestataireService = async (id, data) => {
  try {
    const prestataire = await prisma.prestataire.findUnique({
      where: { id_prestataire: id }
    });
    if (!prestataire) return null;
   
    return prisma.prestataire.update({
      where: { id_prestataire: id },
      data,
      include: { user: true }
    });

  } catch (error) {
    console.error('Error in updatePrestataireService:', error);
    
    if (error.code === 'P2025') {
      return null; // Prestataire non trouvé
    }
    
    throw error;
  }
};


/**
 * Afficher les infos d'un prestataire
 */
export const showInfoPrestataireService = async (id_user) => {
  const prestataire = await prisma.prestataire.findFirst({
    where: { idUser: id_user },
    include: { user: true }
  });

  if (!prestataire) throw new Error("Prestataire introuvable");
  return prestataire;
}

export const checkPrestataireValidation = async (id, expectedType = null) => {
  const prestataire = await prisma.prestataire.findUnique({
    where: { id_prestataire: id },
    select: {
      id_prestataire: true,
      type: true,
      statut_validation: true  // Notez le underscore
    }
  });

  /* console.log("Prestataire trouvé:", prestataire);
  console.log("statut_validation:", prestataire?.statut_validation); */
  
  if (!prestataire) {
    throw new Error("PRESTATAIRE_NOT_FOUND");
  }

  if (expectedType && prestataire.type !== expectedType) {
    throw new Error("PRESTATAIRE_INVALID_TYPE");
  }

  // Comparaison avec la valeur de l'enum
  if (prestataire.statut_validation !== 'valide') {
    throw new Error("PRESTATAIRE_NOT_VALIDATED");
  }

  return prestataire;
};

export const handlePrestataireError = (error, res, label = "Prestataire") => {
  const messages = {
    PRESTATAIRE_NOT_FOUND: `${label} non trouvé`,
    PRESTATAIRE_INVALID_TYPE: `Le prestataire n'est pas un ${label.toLowerCase()}`,
    PRESTATAIRE_NOT_VALIDATED_GUIDE: `${label} non validé`,
    PRESTATAIRE_NOT_VALIDATED_HOTEL: `${label} non validé`,
    PRESTATAIRE_NOT_VALIDATED_TRANSPORT: `${label} non validé`,
    PRESTATAIRE_PENDING: `${label} en attente de validation`,
    PRESTATAIRE_REJECTED: `${label} a été refusé`
  };

  return res.status(400).json({
    success: false,
    message: messages[error.message] || "Erreur liée aux prestatairex (Seul les prestataires dont le statut_validation est 'validé' peuvent etre associés à une visite ou un événement)"
  });
};