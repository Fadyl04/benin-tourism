export const can = (action, subject) => {
  return (req, res, next) => {
    // req.user est injecté par le middleware authenticate
    const permissions = req.user?.permissions || [];

    const required = `${action}_${subject.toLowerCase()}`;

    if (!permissions.includes(required)) {
      return res.status(403).json({
        success: false,
        message: `Permission refusée : vous n'avez pas le droit de ${action} sur ${subject}`
      });
    }

    next();
  };
};