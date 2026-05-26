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
    .min(8)
    .regex(/[a-zA-Z]/),

  telephone: z.string().refine((tel) => beninTelephoneRegex.test(tel), {
    message: "Le numéro de téléphone doit être au format +229XXXXXXXXXX (10 chiffres après +229)",
  }),
  
  date_naissance: z.coerce.date().refine((dob) => {
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
    return age >= 18;
  }, "Vous devez avoir au moins 18 ans"),


  type: z.enum(["guide", "hotel", "transport"]),
  genre: z.enum(["Homme", "Femme","Personnel"]),
  adresse: z.string(),
  ville: z.string(),
  annee_experience: z
  .preprocess(val => val === undefined ? undefined : Number(val),
    z.number().min(0, "Doit être ≥ 0")
  ),

  document_justificatif: z.string().optional(),
  image: z.string().nullable().optional(),
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
    .min(8)
    .regex(/[a-zA-Z]/),
});

/**
 * evenementSchema (validation de evenement)
 */
export const evenementSchema = z.object({
  id_hotel: z.preprocess(
  (val) => {
    if (val === '' || val === 'null') return null;
    return val;
  },
  z.string()
    .uuid({ message: "L'ID hôtel doit être un UUID valide" })
    .nullable()
    .optional()
),
  nom: z.string(),
  image: z.string().min(1, "L'image est requise"),
  description: z.string(),
  localisation: z.string(),
  date_debut: z.coerce.date({ message: "Date de début invalide" }),
  date_fin: z.coerce.date({ message: "Date de fin invalide" }),
  nombre_place: z.coerce.number()
    .int("Le nombre de places doit être un entier")
    .positive("Le nombre de places doit être positif"),

  prix_standard: z.coerce.number().positive("Le prix standard doit être positif"),
  prix_vip: z.coerce.number().positive("Le prix VIP doit être positif"),
  prix_elite: z.coerce.number()
    .positive("Le prix élite doit être positif")
    .nullable()
    .optional(),
  prix_premium: z.coerce.number().positive("Le prix premium doit être positif"),

  categorie: z.string().min(2, "La catégorie doit avoir au moins 2 caractères"),
})
.superRefine((data, ctx) => {
  // Ne valider la relation entre dates que si les deux dates sont présentes
  if (data.date_debut && data.date_fin) {
    if (data.date_fin <= data.date_debut) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La date de fin doit être après la date de début",
        path: ["date_fin"]
      });
    }
  }
});

/**
 * visiteSchema (validation de visite)
 */
export const visiteSchema = z.object({
  id_guide: z.string().uuid({ message: "L'ID guide doit être un UUID valide" }),
  id_hotel: z.string().uuid({ message: "L'ID hôtel doit être un UUID valide" }).nullable().optional(),
  id_transport: z.string().uuid({ message: "L'ID transport doit être un UUID valide" }),

  nom: z.string("Le nom est obligatoire"),
  image: z.string().nullable().optional(),
  description: z.string("La description est obligatoire"),

  prix_economique: z.coerce.number().positive("Le prix économique doit être positif"),
  prix_confort: z.coerce.number().positive("Le prix confort doit être positif"),
  prix_premium: z.coerce.number().positive("Le prix premium doit être positif"),

  nombre_places: z.coerce.number().int().positive("Le nombre de places doit être un entier positif"),

  date_debut: z.coerce.date({ message: "Date de début invalide" }),
  date_fin: z.coerce.date({ message: "Date de fin invalide" }),

  lieu_date_depart: z.string({ message: "Le lieu de départ est obligatoire" }),
  parcours: z.string().optional().nullable(),

  // Tableau d'IDs de sites touristiques (UUIDs)
  siteIds: z.union([
    z.string().transform(str => {
      try {
        const parsed = JSON.parse(str);
        if (!Array.isArray(parsed)) throw new Error();
        return parsed.map(id => String(id).trim());
      } catch {
        return str.split(',').map(id => String(id).trim());
      }
    }),
    z.array(z.string().uuid({ message: "Chaque ID de site doit être un UUID valide" }))
  ]).optional()
})
.refine(data => data.date_fin > data.date_debut, {
  message: "La date de fin doit être après la date de début",
  path: ["date_fin"]
});

/**
 * reservationSchema (validation de reservation)
 */
export const reservationSchema = z.object({
  id_user: z.string().uuid({ message: "L'ID utilisateur doit être un UUID valide" }),
  id_evenement: z.string().uuid({ message: "L'ID événement doit être un UUID valide" }).nullable().optional(),
  id_visite: z.string().uuid({ message: "L'ID visite doit être un UUID valide" }).nullable().optional(),

  nombre_personnes: z.coerce.number().int().positive("Le nombre de personnes doit être supérieur à 0"),

  ticket_evenement: z.string().optional(),  
  ticket_visite: z.string().optional(), 
  statut: z.enum(["en_attente", "confirmee", "annulee"]).default("en_attente"),
});

/**
 * paiementSchema (validation de paiement)
 */
export const paiementSchema = z.object({
  id_reservation: z.string().uuid({ message: "L'ID réservation doit être un UUID valide" }),
  id_user: z.string().uuid({ message: "L'ID utilisateur doit être un UUID valide" }),
  montant: z.coerce.number().positive("Le montant doit être positif"),
  methode: z.enum(["mobile_money", "carte_bancaire"]).default("mobile_money"),
  statut: z.enum(["en_attente", "reussi", "echec"]).default("en_attente"),
  transaction: z.string().min(5, "Transaction invalide"),
});
/**
 * loginSchema (validation de login)
 */
export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

/**
 * siteTouristiqueSchema (validation de site touristique)
 */
export const siteTouristiqueSchema = z.object({
  nom: z.string(),
  image: z.string().trim().min(1, "L'image est obligatoire"),
  description: z.string(), 
  localisation: z.string(),
  horaire: z.string("L'horaire est obligatoire"),
  categorie: z.string(),
})

/**
 * newPasswordSchema (validation de new password)
 */
export const newPasswordSchema = z.object({
  newPassword: z.string()
    .min(8)
    .regex(/[a-zA-Z]/), // au moins une lettre (simple, pas séparé maj/min)
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Les mots de passe ne correspondent pas"
});

