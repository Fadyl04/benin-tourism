import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../service/auth.service';
import { StorageService } from '../../service/storage.service';

@Component({
  selector: 'app-first-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    Toast
  ],
  providers: [MessageService],
  templateUrl: './first-login.component.html',
  styleUrls: ['./first-login.component.css']
})
export class FirstLoginComponent {

  form: FormGroup;

  loading = false;

  // PASSWORD TOGGLE
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private storage: StorageService,
    private router: Router,
    private messageService: MessageService
  ) {

    this.form = this.fb.group({

      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8)
        ]
      ],

      confirmPassword: [
        '',
        Validators.required
      ]

    }, {
      validators: this.passwordMatchValidator
    });
  }

  /**
   * PASSWORD MATCH VALIDATOR
   */
  passwordMatchValidator(
    group: AbstractControl
  ): ValidationErrors | null {

    const pwd =
      group.get('newPassword')?.value;

    const confirm =
      group.get('confirmPassword')?.value;

    return pwd === confirm
      ? null
      : { passwordMismatch: true };
  }

  /**
   * SUBMIT
   */
  submit(): void {

    if (this.loading) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const { newPassword, confirmPassword } = this.form.value;

    this.authService.changeFirstLoginPassword({
      newPassword,
      confirmPassword
    })
    .pipe(finalize(() => this.loading = false))
    .subscribe({

      next: (response: any) => {

        const currentUser: any =
          this.storage.getObject('currentUser');

        if (currentUser) {
          currentUser.firstLogin = false;
          this.storage.setObject('currentUser', currentUser);
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: response.message || 'Mot de passe modifié avec succès'
        });

        /**
         * =========================
         * REDIRECTION UNIQUE
         * =========================
         */

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 800);
      },

      error: (err: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err?.error?.message || 'Erreur serveur'
        });
      }
    });
  }

  /**
   * INVALID FIELD
   */
  isInvalid(field: string): boolean {

    const ctrl =
      this.form.get(field);

    return !!(
      ctrl &&
      ctrl.invalid &&
      ctrl.touched
    );
  }

  /**
   * GET ERROR
   */
  getError(field: string): string {

    const ctrl =
      this.form.get(field);

    if (
      !ctrl ||
      !ctrl.errors ||
      !ctrl.touched
    ) {
      return '';
    }

    if (ctrl.errors['required']) {
      return 'Ce champ est obligatoire';
    }

    if (ctrl.errors['minlength']) {

      return `Minimum ${ctrl.errors['minlength'].requiredLength} caractères`;
    }

    return '';
  }

  /**
   * PASSWORD MISMATCH
   */
  get passwordMismatch(): boolean {

    return !!(
      this.form.errors?.['passwordMismatch'] &&
      this.form.get('confirmPassword')?.touched
    );
  }
}