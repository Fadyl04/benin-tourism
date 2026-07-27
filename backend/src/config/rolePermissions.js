/**
 * Permissions par rôle — dérivées statiquement, pas de table DB
 * (le schéma Prisma actuel n'a qu'un enum Role sur User)
 */
export const ROLE_PERMISSIONS = {
  admin: ['*'], // accès total, géré via bypass dans can.middleware

  prestataire: [
    'create_site', 'read_site', 'update_site',
    'create_event', 'read_event', 'update_event', 'delete_event',
    'create_visite', 'read_visite', 'update_visite', 'delete_visite',
    'read_reservation',
    'read_paiement',
  ],

  client: [
    'read_site',
    'read_event',
    'read_visite',
    'create_reservation', 'read_reservation',
    'create_paiement',
  ],
};

export function getPermissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || [];
}