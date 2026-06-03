import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { AuthService, LoginResponse, RegisterResponse } from '../../service/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    ReactiveFormsModule,
    RouterModule,
    DialogModule,
    CheckboxModule,
    InputTextModule,
    Toast,
    ButtonModule,
  ],
  providers: [MessageService],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {

  // ===== MODALS =====
  showLogin    = false;
  showRegister = false;

  // ===== PASSWORD TOGGLE =====
  showLoginPwd   = false;
  showRegPwd     = false;
  showRegConfirm = false;

  // ===== LOADING =====
  loginLoading    = false;
  registerLoading = false;

  // ===== FORMS =====
  loginForm!:    FormGroup;
  registerForm!: FormGroup;

  constructor(
    private fb:             FormBuilder,
    private router:         Router,
    private authService:    AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForms();
  }

  // ===== INIT FORMS =====
  initForms(): void {

    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      remember: [false]
    });

    this.registerForm = this.fb.group({
      nom:      ['', [Validators.required, Validators.minLength(2)]],
      prenom:   ['', [Validators.required, Validators.minLength(2)]],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm:  ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  // ===== PASSWORD MATCH VALIDATOR =====
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pwd     = group.get('password')?.value;
    const confirm = group.get('confirm')?.value;
    return pwd === confirm ? null : { passwordMismatch: true };
  }

  // ===== PASSWORD STRENGTH =====
  get passwordStrength(): string {
    const pwd = this.registerForm?.get('password')?.value || '';
    if (!pwd) return '';
    const score = [
      pwd.length >= 8,
      /[A-Z]/.test(pwd),
      /[0-9]/.test(pwd),
      /[^A-Za-z0-9]/.test(pwd)
    ].filter(Boolean).length;
    if (score <= 1) return 'weak';
    if (score <= 2) return 'medium';
    return 'strong';
  }

  get passwordStrengthLabel(): string {
    const map: Record<string, string> = {
      weak: 'Faible', medium: 'Moyen', strong: 'Fort'
    };
    return map[this.passwordStrength] || '';
  }

  // ===== OPEN / CLOSE =====
  openLogin(): void {
    this.showRegister = false;
    this.loginForm.markAsUntouched();
    this.loginForm.markAsPristine();
    this.showLogin = true;
  }

  openRegister(): void {
    this.showLogin = false;
    this.registerForm.markAsUntouched();
    this.registerForm.markAsPristine();
    this.showRegister = true;
  }

  switchToRegister(): void {
    this.showLogin = false;
    setTimeout(() => this.openRegister(), 200);
  }

  switchToLogin(): void {
    this.showRegister = false;
    setTimeout(() => this.openLogin(), 200);
  }

  onLoginClose(): void {
    this.loginForm.reset({ remember: false });
    this.loginForm.markAsUntouched();
    this.loginForm.markAsPristine();
    this.showLoginPwd = false;
  }

  onRegisterClose(): void {
    this.registerForm.reset();
    this.registerForm.markAsUntouched();
    this.registerForm.markAsPristine();
    this.showRegPwd     = false;
    this.showRegConfirm = false;
  }

  // ===== LOGIN =====
  onLogin(): void {
    if (this.loginLoading) return;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loginLoading = true;

    const email = this.loginForm.value.email.trim().toLowerCase();
    const password = this.loginForm.value.password;
    const remember = this.loginForm.value.remember;

    this.authService.login(email, password).subscribe({
      next: (response: LoginResponse) => {
        this.loginLoading = false;

        if (!response.success) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: response.message || 'Identifiants incorrects'
          });
          return;
        }

        const user = response.data;

        // remember me
        if (remember) {
          localStorage.setItem('remembered_email', email);
        } else {
          localStorage.removeItem('remembered_email');
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Connexion réussie',
          detail: `Bienvenue ${user.prenom} !`
        });

        this.showLogin = false;
        this.onLoginClose();

        /**
         * =========================
         * RÈGLE MÉTIER UNIQUE
         * =========================
         */

        // CAS 1 + CAS 2 : admin / prestataire
        if (user.role === 'admin' || user.role === 'prestataire') {

          if (user.firstLogin) {

            this.messageService.add({
              severity: 'info',
              summary: 'Sécurité',
              detail: 'Veuillez modifier votre mot de passe avant de continuer'
            });

            setTimeout(() => {
              this.router.navigate(['/change-password']);
            }, 800);

            return;
          }

          // second login
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 500);

          return;
        }

        // CAS 3 : client (jamais firstLogin)
        this.router.navigate(['/client']);
      },

      error: (err: any) => {
        this.loginLoading = false;

        this.messageService.add({
          severity: 'error',
          summary: 'Erreur de connexion',
          detail: err?.error?.message || 'Une erreur est survenue'
        });
      }
    });
  }

  // ===== REGISTER =====
  onRegister(): void {
    if (this.registerLoading) return;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.registerLoading = true;

    const payload = {
      nom:      this.registerForm.value.nom.trim(),
      prenom:   this.registerForm.value.prenom.trim(),
      email:    this.registerForm.value.email.trim().toLowerCase(),
      password: this.registerForm.value.password,
      // Ne pas envoyer 'role' si le backend le gère par défaut
      // Si le backend l'exige : décommentez la ligne suivante
      // role: 'client'
    };

    // console.log('Payload register :', payload); // ← diagnostic temporaire

    this.authService.registerClient(payload).subscribe({
      next: (response: RegisterResponse) => {
        this.registerLoading = false;

        if (!response.success) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: response.message || 'Erreur lors de la création du compte'
          });
          return;
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Compte créé !',
          detail: `Bienvenue ${payload.prenom} ! Connectez-vous maintenant.`
        });

        this.showRegister = false;
        this.onRegisterClose();
        setTimeout(() => this.openLogin(), 400);
      },

      error: (err: any) => {
        this.registerLoading = false;

        // Affiche le détail exact de l'erreur backend
        const detail = err?.error?.message
          || err?.error?.errors?.join(', ')
          || 'Une erreur est survenue';

        console.error('Erreur register :', err?.error); // ← diagnostic

        this.messageService.add({
          severity: 'error',
          summary: 'Erreur inscription',
          detail
        });
      }
    });
  }

  // ===== HELPERS =====
  isInvalid(form: FormGroup, field: string): boolean {
    const ctrl = form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  getError(form: FormGroup, field: string): string {
    const ctrl = form.get(field);
    if (!ctrl || !ctrl.errors || !ctrl.touched) return '';
    if (ctrl.errors['required'])  return 'Ce champ est obligatoire';
    if (ctrl.errors['email'])     return 'Adresse e-mail invalide';
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} caractères`;
    return '';
  }

  get passwordMismatch(): boolean {
    return !!(
      this.registerForm.errors?.['passwordMismatch'] &&
      this.registerForm.get('confirm')?.touched
    );
  }

  // ===== SE SOUVENIR DE MOI : pré-remplir l'email au chargement =====
  ngAfterViewInit(): void {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      this.loginForm.patchValue({ email: savedEmail, remember: true });
    }
  }
}