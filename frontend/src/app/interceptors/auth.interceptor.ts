import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);

  const token = localStorage.getItem('accessToken');

  let clonedReq = req;

  // Ajouter le token JWT
  if (token) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true
    });
  }

  return next(clonedReq).pipe(

    catchError((error: HttpErrorResponse) => {

      // Session expirée
      if (error.status === 401) {

        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');

        router.navigate(['/auth/login']);
      }

      return throwError(() => error);
    })
  );
};