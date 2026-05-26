import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { AuthService } from '../../../service/auth.service';
import { DialogModule } from 'primeng/dialog';


@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    Toast,
    DialogModule,
  ],
  providers: [MessageService],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  form: FormGroup;

  token = '';

  loading = false;

  // ===== PASSWORD TOGGLE =====
  showNewPassword = false;
showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
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

  ngOnInit(): void {

    this.token =
      this.route.snapshot.paramMap.get('token') || '';

    if (!this.token) {

      this.messageService.add({
        severity: 'error',
        summary: 'Lien invalide',
        detail: 'Token de réinitialisation manquant'
      });

      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1500);
    }
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
   * RESET PASSWORD
   */
  submit(): void {

    if (this.loading) {
      return;
    }

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }

    const {
      newPassword,
      confirmPassword
    } = this.form.value;

    this.loading = true;

    this.authService.resetPassword({

      token: this.token,
      newPassword,
      confirmPassword

    })
    .pipe(
      finalize(() => {
        this.loading = false;
      })
    )
    .subscribe({

      next: (response: any) => {

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail:
            response.message ||
            'Mot de passe modifié avec succès'
        });

        this.form.reset();

        setTimeout(() => {

          this.router.navigate(
            ['/'],
            {
              queryParams: {
                login: true
              }
            }
          );

        }, 1000);
      },

      error: (err: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail:
            err?.error?.message ||
            'Erreur serveur'
        });
      }
    });
  }

  /**
   * FIELD INVALID
   */
  isInvalid(field: string): boolean {

    const ctrl = this.form.get(field);
    return !!(
      ctrl && ctrl.invalid && ctrl.touched
    );
  }

  /**
   * FIELD ERROR
   */
  getError(field: string): string {

    const ctrl = this.form.get(field);
    if (!ctrl || !ctrl.errors || !ctrl.touched ) {
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