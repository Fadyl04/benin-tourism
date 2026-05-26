import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  try {

    const token = req.cookies?.accessToken; // SAFE ACCESS

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token manquant"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();

  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Token invalide ou expiré"
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Accès refusé : rôle requis (${roles.join(', ')})`
      });
    }

    next();
  };
};