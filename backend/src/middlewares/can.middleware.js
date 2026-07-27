export const can = (action, subject) => {
  return (req, res, next) => {
    if (req.user?.role === 'admin') {
      return next();
    }

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