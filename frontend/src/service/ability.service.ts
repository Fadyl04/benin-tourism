import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  PureAbility
} from '@casl/ability';

/**
 * ROLES
 */
export type Role =
  | 'admin'
  | 'client'
  | 'prestataire';

/**
 * ACTIONS
 */
export type Actions =
  | 'manage'
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'validate'
  | 'view';

/**
 * SUBJECTS
 */
export type Subjects =
  | 'Dashboard'
  | 'User'
  | 'Prestataire'
  | 'SiteTouristique'
  | 'Evenement'
  | 'Visite'
  | 'Reservation'
  | 'Paiement'
  | 'all';

/**
 * APP ABILITY
 */
export type AppAbility =
  PureAbility<[Actions, Subjects]>;

/**
 * MAPPING PERMISSIONS
 */
const PERMISSION_MAP: Record<string,[Actions, Subjects]> = {

  // SITES
  create_site: ['create', 'SiteTouristique'],
  read_site: ['read', 'SiteTouristique'],
  update_site: ['update', 'SiteTouristique'],
  delete_site: ['delete', 'SiteTouristique'],

  // EVENEMENTS
  create_event: ['create', 'Evenement'],
  read_event: ['read', 'Evenement'],
  update_event: ['update', 'Evenement'],
  delete_event: ['delete', 'Evenement'],

  // VISITES
  create_visite: ['create', 'Visite'],
  read_visite: ['read', 'Visite'],
  update_visite: ['update', 'Visite'],
  delete_visite: ['delete', 'Visite'],

  // RESERVATIONS
  create_reservation: ['create', 'Reservation'],
  read_reservation: ['read', 'Reservation'],
  update_reservation: ['update', 'Reservation'],
  delete_reservation: ['delete', 'Reservation'],

  // PAIEMENTS
  create_paiement: ['create', 'Paiement'],
  read_paiement: ['read', 'Paiement'],

  // USERS
  manage_user: ['manage', 'User'],

  // PRESTATAIRES
  manage_prestataire: ['manage', 'Prestataire'],
  validate_prestataire: ['validate', 'Prestataire'],

  // DASHBOARD
  view_dashboard: ['view', 'Dashboard']
};

@Injectable({
  providedIn: 'root'
})
export class AbilityService {

  public ability: AppAbility;
  private abilityReady = new BehaviorSubject<boolean>(false);
  public abilityReady$ = this.abilityReady.asObservable();

  constructor() {
    this.ability = new Ability([]) as AppAbility;
  }

  /**
   * UPDATE ABILITY
   */
  updateAbility( permissions: string[] = [],role?: Role): void {

    const AppAbilityClass = Ability as AbilityClass<AppAbility>;
    const { can, rules} = new AbilityBuilder<AppAbility>(AppAbilityClass);
    /**
     * ADMIN
     */
    if (role === 'admin') {
      can('manage', 'all');
      this.ability.update(rules);
      this.abilityReady.next(true);
      return;
    }

    /**
     * PERMISSIONS
     */
    permissions.forEach((permission) => {

      const mapped = PERMISSION_MAP[permission];
      if (!mapped) return;
      const [action, subject] = mapped;
      can(action, subject);
    });

    /**
     * ACCESS DASHBOARD
     */
    can('view', 'Dashboard');

    this.ability.update(rules);
    this.abilityReady.next(true);
  }

  /**
   * CHECK PERMISSION
   */
  can(action: Actions,subject: Subjects): boolean {
    return this.ability.can(
      action,
      subject
    );
  }

  /**
   * CLEAR
   */
  clearAbility(): void {
    this.ability.update([]);
    this.abilityReady.next(false);
  }
}