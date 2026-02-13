import jwt from 'jsonwebtoken';

/**
 * Middleware pour vérifier que l'utilisateur est connecté et est client
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Token manquant" });
  }
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token manquant" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contient id_user
    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalide" });
  }
};

/**
 * Middleware pour vérifier que l'utilisateur est connecté et est admin
 */
export const adminRole = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Token admin manquant" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token admin manquant" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé : rôle admin requis" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token admin invalide" });
  }
};

/**
 * Middleware pour vérifier que l'utilisateur est connecté et est prestataire
 */
export const prestataireRole = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Token prestataire manquant" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token prestataire manquant" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    if (req.user.role !== "prestataire") {
      return res.status(403).json({ message: "Accès refusé : rôle prestataire requis" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token prestataire invalide" });
  }
};