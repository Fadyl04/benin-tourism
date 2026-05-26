import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { Toast} from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import {finalize} from 'rxjs/operators';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    DialogModule,
    InputTextModule,
    Toast,
    ButtonModule,

  ],
  providers: [MessageService],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  loading = false;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService
  ) {

    this.form = this.fb.group({

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ]
    });
  }

  submit(): void {

    // Anti double submit
    if (this.loading) {
      return;
    }

    // Validation
    if (this.form.invalid) {

      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const email =
      this.form.value.email
        .trim()
        .toLowerCase();

    this.authService
      .forgotPassword(email)
      .pipe(

        finalize(() => {
          this.loading = false;
        })

      )
      .subscribe({

        next: (response) => {

          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail:
              response.message ||
              'Email envoyé'
          });

          this.form.reset();
        },

        error: (err) => {

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

    const ctrl =
      this.form.get(field);

    return !!(
      ctrl &&
      ctrl.invalid &&
      ctrl.touched
    );
  }

  /**
   * FIELD ERROR
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

    if (ctrl.errors['email']) {
      return 'Adresse e-mail invalide';
    }

    return '';
  }
}