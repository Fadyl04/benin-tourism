import prisma from '../../config/db.config.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../../utils/jwt.js';

/**
 * Le register
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
 * Le login
 */
export const loginClientService = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email, role: 'client' }
  });

  if (!user || user.role !== 'client') {
    throw new Error('Utilisateur introuvable');
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Mot de passe incorrect');

  const token = generateToken({
    id_user: user.id_user,
    role: user.role
  });

  return {
    token,
    user: {
      id: user.id_user,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role
    }
  };
};

/**
 * Récupérer le user (client) via son ID
 */
export const getClientByIdService = async (id_user) => {
  const user = await prisma.user.findUnique({
    where: { id_user },
    select: {
      id_user: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true
    } 
  });
  if (!user) {
    throw new Error('Utilisateur introuvable');
  }

  return user;
};

