import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from '../environments/environment';
import { AbilityService, Role } from './ability.service';
import { StorageService } from './storage.service';

/**
 * USER
 */
export interface User {
  id_user: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  firstLogin: boolean;
}

/**
 * LOGIN RESPONSE
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  data: User;
  forcePasswordChange?: boolean;
}

/**
 * REGISTER RESPONSE
 */
export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private httpOptions = { withCredentials: true };
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: StorageService,
    private abilityService: AbilityService,

    @Inject(PLATFORM_ID)
    platformId: object
  ) {

    this.isBrowser = isPlatformBrowser(platformId);

    const user = this.storage.getObject<User>('currentUser');

    this.currentUserSubject = new BehaviorSubject<User | null>(user);

    this.currentUser$ = this.currentUserSubject.asObservable();

    this.loadAbility();
  }

  /**
   * CURRENT USER
   */
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * REGISTER CLIENT
   */
  registerClient(payload: {
    nom: string;
    prenom: string;
    email: string;
    password: string;
  }): Observable<RegisterResponse> {

    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/register/client`,
      payload
    );
  }

  /**
   * LOGIN
   */
  login(
    email: string,
    password: string
  ): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      { email, password },
      this.httpOptions
    ).pipe(
      tap((response) => {

        if (!response.success) return;

        const user = response.data;

        /**
         * SAVE USER
         */
        this.storage.setObject('currentUser', user);

        /**
         * UPDATE STATE
         */
        this.currentUserSubject.next(user);

        /**
         * UPDATE CASL
         */
        this.abilityService.updateAbility([], user.role);
      })
    );
  }

  /**
   * LOGOUT
   */
  logout(): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/logout`,
      {},
      this.httpOptions
    ).pipe(
      tap(() => {

        this.storage.removeItem('currentUser');
        this.storage.removeItem('permissions');

        this.currentUserSubject.next(null);

        this.abilityService.clearAbility();

        this.router.navigate(['/']);
      })
    );
  }

  /**
   * AUTH CHECK
   */
  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  /**
   * ROLE
   */
  getUserRole(): Role | null {
    return this.currentUserValue?.role || null;
  }

  /**
   * FIRST LOGIN
   */
  changeFirstLoginPassword(payload: {
    newPassword: string;
    confirmPassword: string;
  }): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/first-login/change-password`,
      payload,
      this.httpOptions
    );
  }

  /**
   * FORGOT PASSWORD
   */
  forgotPassword(email: string): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/forgot-password`,
      { email }, this.httpOptions
    );
  }

  /**
   * RESET PASSWORD
   */
  resetPassword(payload: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/reset-password`,
      payload, this.httpOptions
    );
  }

  /**
   * LOAD ABILITY
   */
  private loadAbility(): void {

    if (!this.isBrowser) return;

    const user = this.storage.getObject<User>('currentUser');

    if (!user) return;

    this.abilityService.updateAbility([], user.role);
  }

  /**
   * REGISTER PRESTATAIRE (Demande)
   */
  registerPrestataire() {}

 
}