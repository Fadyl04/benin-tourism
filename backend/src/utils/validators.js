import { z } from "zod";

const beninTelephoneRegex = /^\+229\d{10}$/;

/**
 * prestataireSchema (validation de prestataire)
 */
export const PrestataireSchema = z.object({
  nom: z.string()
    .min(2, "Nom trop court")
    .max(50, "Nom trop long")
    .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/, "Nom invalide"),

  prenom: z.string()
    .min(2, "Prénom trop court")
    .max(50, "Prénom trop long")
    .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/, "Prénom invalide"),

  email: z.string().email("Email invalide"),

  password: z.string()
    .min(8, "Min 8 caractères")
    .regex(/[a-z]/, "Doit contenir une minuscule")
    .regex(/[A-Z]/, "Doit contenir une majuscule")
    .regex(/\d/, "Doit contenir un chiffre")
    .regex(/[@$!%*?&_]/, "Doit contenir un caractère spécial"),

  telephone: z.string().refine((tel) => beninTelephoneRegex.test(tel), {
    message: "Le numéro de téléphone doit être au format +229XXXXXXXXXX (10 chiffres après +229)",
  }),
  
  date_naissance: z.string()
  .refine((val) => {
    // Vérifie le format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(val)) {
      return false;
    }
    
    const dob = new Date(val);
    return !isNaN(dob.getTime());
  }, "Format de date invalide. Utilisez YYYY-MM-DD")
  .refine((val) => {
    const dob = new Date(val);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    
    // Vérifie l'âge exact (prend en compte le mois et le jour)
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  }, "Vous devez avoir au moins 18 ans"),


  type: z.enum(["guide", "hotel", "transport"]),
  genre: z.enum(["Homme", "Femme","Personnel"]),
  adresse: z.string().min(3, "Adresse trop courte"),
  ville: z.string().min(2, "Ville trop courte"),
  annee_experience: z.preprocess(val => Number(val), z.number().min(0, "Doit être ≥ 0")),
  document_justificatif: z.string().optional(),
  image: z.string().nullable().optional() 
});

/**
 * ClientSchema (validation de client)
 */
export const ClientSchema = z.object({
  nom: z.string()
  .min(2, "Nom trop court")
  .max(50, "Nom trop long")
  .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/, "Nom invalide"),

  prenom: z.string()
    .min(2, "Prénom trop court")
    .max(50, "Prénom trop long")
    .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/, "Prénom invalide"),

  email: z.string().email("Email invalide"),

  password: z.string()
    .min(8, "Min 8 caractères")
    .regex(/[a-z]/, "Doit contenir une minuscule")
    .regex(/[A-Z]/, "Doit contenir une majuscule")
    .regex(/\d/, "Doit contenir un chiffre")
    .regex(/[@$!%*?&_]/, "Doit contenir un caractère spécial"),
});

/**
 * evenementSchema (validation de evenement)
 */
export const evenementSchema = z.object({
  nom: z.string().min(2, "Le nom doit avoir au moins 2 caractères"),
  image: z.string().min(1, "L'image est requise"),
  description: z.string().min(10, "La description doit avoir au moins 20 caractères"),
  localisation: z.string().min(2, "La localisation doit avoir au moins 2 caractères"),
  date_debut: z.coerce.date({ message: "Date de début invalide" }),
  date_fin: z.coerce.date({ message: "Date de fin invalide" }),
  nombre_place: z.coerce.number() 
    .int("Le nombre de places doit être un entier")
    .positive("Le nombre de places doit être positif"),
  prix_standard: z.coerce.number().positive("Le prix standard doit être positif"),
  prix_vip: z.coerce.number().positive("Le prix VIP doit être positif"),
  prix_elite: z.union([
    z.coerce.number().positive("Le prix élite doit être positif"),
    z.null()
  ]).optional().default(null),
  prix_premium: z.coerce.number().positive("Le prix premium doit être positif"),
  categorie: z.string().min(2, "La catégorie doit avoir au moins 2 caractères"),
});

/**
 * visiteSchema (validation de visite)
 */
export const visiteSchema = z.object({
  id_guide: z.coerce.number().int().positive("L'ID guide doit être un nombre positif"),
  id_hotel: z.coerce.number().int().positive("L'ID hotel doit être un nombre positif").nullable().optional(),
  id_transport: z.coerce.number().int().positive("L'ID transport doit être un nombre positif").nullable().optional(),
  nom: z.string().min(2, "Le nom doit avoir au moins 2 caractères"),
  image: z.string().nullable().optional(),
  description: z.string().min(10, "La description doit avoir au moins 10 caractères"),
  prix_economique: z.coerce.number().positive("Le prix économique doit être positif"),
  prix_confort: z.coerce.number().positive("Le prix confort doit être positif"),
  prix_premium: z.coerce.number().positive("Le prix premium doit être positif"),
  nombre_places: z.coerce.number().int().positive("Le nombre de places doit être un entier positif"),
  date_debut: z.coerce.date({ message: "Date de début invalide" }),
  date_fin: z.coerce.date({ message: "Date de fin invalide" }),
  siteIds: z.union([
    z.string().transform(str => {
      try {
        return JSON.parse(str);
      } catch {
        return str.split(',').map(id => Number(id.trim()));
      }
    }),
    z.array(z.number())
  ]).refine(arr => Array.isArray(arr) && arr.every(id => Number.isInteger(id) && id > 0), {
    message: "siteIds doit être un tableau d'IDs valides"
  }).optional()
});

/**
 * reservationSchema (validation de reservation)
 */
export const reservationSchema = z.object({
  id_user: z.coerce.number().int().positive(),
  id_evenement: z.coerce.number().int().positive().nullable().optional(),
  id_visite: z.coerce.number().int().positive().nullable().optional(),
  nombre_personnes: z.string()
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, { message: "Le nombre de personnes doit être supérieur à 0" }),
  ticket_evenement: z.string().optional(),  
  ticket_visite: z.string().optional(), 
  statut: z.enum(["en_attente", "confirmee", "annulee"]).default("en_attente"),
});

/**
 * paiementSchema (validation de paiement)
 */
export const paiementSchema = z.object({
  id_reservation: z.number().int().positive(),
  id_user: z.number().int().positive(),
  montant: z.coerce.number().positive(),
  methode: z.enum(["mobile_money", "carte_bancaire"]).default("mobile_money"),
  statut: z.enum(["en_attente", "reussi", "echec"]).default("en_attente"),
  transaction: z.string().min(5, "Transaction invalide"),
});
/**
 * loginSchema (validation de login)
 */
export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string()
  .min(8, "Min 8 caractères")
  .regex(/[a-z]/, "Doit contenir une minuscule")
  .regex(/[A-Z]/, "Doit contenir une majuscule")
  .regex(/\d/, "Doit contenir un chiffre")
  .regex(/[@$!%*?&_#$@?.]/, "Doit contenir un caractère spécial"),
});

/**
 * siteTouristiqueSchema (validation de site touristique)
 */
export const siteTouristiqueSchema = z.object({
  nom: z.string().min(2, "Le nom du site doit contenir au moins 2 caractères"),
  image: z.string().optional(),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"), 
  localisation: z.string().min(2, "La localisation est obligatoire"),
  horaire: z.string().min(2, "L'horaire est obligatoire"),
  categorie: z.string().min(2, "La catégorie est obligatoire"),
})

/**
 * newPasswordSchema (validation de new password)
 */
export const newPasswordSchema = z.object({
  newPassword: z.string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[a-z]/, "Doit contenir une minuscule")
  .regex(/[A-Z]/, "Doit contenir une majuscule")
  .regex(/\d/, "Doit contenir un chiffre")
  .regex(/[@$!%*?&_]/, "Doit contenir un caractère spécial"),
  confirmPassword: z.string()
  }).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]

});

