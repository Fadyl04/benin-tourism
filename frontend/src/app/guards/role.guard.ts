import { inject } from '@angular/core';

import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router
} from '@angular/router';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {

    const router = inject(Router);
     const userString = localStorage.getItem('user');
    if (!userString) {
        router.navigate(['/auth/login']);
    return false;
    }
    const user = JSON.parse(userString);
    const allowedRoles = route.data['roles'];

    if (!allowedRoles.includes(user.role)) {
        router.navigate(['/unauthorized']);
    return false;
    }

    return true;
};