export const getCookieOptions = (durationInMs = 15 * 60 * 1000) => ({
  httpOnly: true,
  // Secure est true seulement en production (nécessite HTTPS)
  secure: process.env.NODE_ENV === 'production',
  // Protege contre le CSRF
  sameSite: 'strict',
  // Durée de vie
  maxAge: durationInMs,
  path: '/',
});

// Exemples de durées prédéfinies
export const COOKIE_DURATIONS = {
  ACCESS_TOKEN: 15 * 60 * 1000,      // 15 minutes
  REFRESH_TOKEN: 7 * 24 * 60 * 60 * 1000, // 7 jours
  ADMIN_SESSION: 30 * 60 * 1000      // 30 minutes
};