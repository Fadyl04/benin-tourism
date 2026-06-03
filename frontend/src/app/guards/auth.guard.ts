import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

export const authGuard: CanActivateFn = (route) => {

  const router = inject(Router);

  console.log('[AUTH GUARD] START');

  /**
   * GET USER
   */
  const userString =
    sessionStorage.getItem('currentUser');

  /**
   * NOT CONNECTED
   */
  if (!userString) {

    console.log('[AUTH GUARD] No currentUser');

    return router.createUrlTree(['/']);
  }

  let user: any;

  /**
   * INVALID JSON
   */
  try {

    user = JSON.parse(userString);

    console.log('[AUTH GUARD] USER =', user);

  } catch (e) {

    console.error(
      '[AUTH GUARD] Invalid JSON',
      e
    );

    sessionStorage.removeItem('currentUser');

    return router.createUrlTree(['/']);
  }

  /**
   * FORCE FIRST LOGIN
   * ONLY admin + prestataire
   */
  const mustChangePassword =
    (
      user.role === 'admin' ||
      user.role === 'prestataire'
    ) &&
    user.firstLogin === true;

  if (
    mustChangePassword &&
    route.routeConfig?.path !== 'change-password'
  ) {

    console.warn(
      '[AUTH GUARD] FORCE CHANGE PASSWORD'
    );

    return router.createUrlTree([
      '/change-password'
    ]);
  }

  /**
   * BLOCK ACCESS TO CHANGE PASSWORD
   * WHEN firstLogin = false
   */
  if (
    !mustChangePassword &&
    route.routeConfig?.path === 'change-password'
  ) {

    console.warn(
      '[AUTH GUARD] change-password blocked'
    );

    /**
     * ADMIN / PRESTATAIRE
     */
    if (
      user.role === 'admin' ||
      user.role === 'prestataire'
    ) {
      return router.createUrlTree([
        '/dashboard'
      ]);
    }

    /**
     * CLIENT
     */
    return router.createUrlTree([
      '/client'
    ]);
  }

/**
 * ROLE CHECK
 */
const allowedRoles =
  route.data?.['roles'] as string[] | undefined;

if (
  allowedRoles &&
  !allowedRoles.includes(user.role)
) {

  console.warn(
    '[AUTH GUARD] Unauthorized role',
    user.role
  );

  return router.createUrlTree([
    '/unauthorized'
  ]);
}

  console.log('[AUTH GUARD] ACCESS GRANTED');

  return true;
};