import rateLimit from 'express-rate-limit';


/**
 * GLOBAL LIMIT (léger)
 * protège toute l'API contre spam basique
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard.'
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: 'Trop de tentatives de connexion, réessayez plus tard.'
  }
});

/**
 * Protection forgot password
 */
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  // très important : limiter spam email
  max: 3,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      'Trop de demandes de réinitialisation. Attendez 15 minutes.'
  }
});

export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 5,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      'Trop de tentatives de réinitialisation.'
  }
});