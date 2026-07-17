import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { PasswordModule } from 'primeng/password';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { Toast } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-register-prestataire',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    ReactiveFormsModule,
    FormsModule,
    PasswordModule,
    ButtonModule,
    FileUploadModule,
    InputTextModule,
    Toast,
    DatePickerModule,
    SelectModule,
  ],
  templateUrl: './register-prestataire.component.html',
  styleUrl: './register-prestataire.component.css',
  providers: [MessageService],
})
export class RegisterPrestataireComponent implements OnInit {

  form!: FormGroup;
  loading    = false;
  activeStep = 0;
  submitted  = false;
  today      = new Date();

  profileImagePreview: string | null = null;
  imagePreview:        string | null = null;

  profileImageFile: File | null = null;
  documentFile:     File | null = null;
  imageFile:        File | null = null;

  // Cohérent avec l'enum Prisma : Homme | Femme | Personnel
  readonly genres = [
    { value: 'Homme',     label: 'Homme' },
    { value: 'Femme',     label: 'Femme' },
    { value: 'Personnel', label: 'Autre / Ne pas préciser' },
  ];

  // Cohérent avec l'enum Prisma : guide | hotel | transport
  readonly activityTypes = [
    { value: 'guide',     label: 'Guide',    sub: 'Guide touristique', icon: '🧭' },
    { value: 'hotel',     label: 'Hôtel',    sub: 'Hébergement',       icon: '🏨' },
    { value: 'transport', label: 'Transport', sub: 'Transport',         icon: '🚗' },
  ];

  readonly steps = [
    {
      index: 0,
      title: 'Informations personnelles',
      desc: 'Nom, prénom, e-mail',
      subtitle: 'Commencez par renseigner vos informations de base pour créer votre compte.',
    },
    {
      index: 1,
      title: 'Coordonnées',
      desc: 'Genre, naissance, mot de passe',
      subtitle: 'Vos coordonnées nous permettent de vous contacter et de personnaliser votre profil.',
    },
    {
      index: 2,
      title: 'Activité professionnelle',
      desc: 'Type, ville, adresse',
      subtitle: 'Décrivez votre activité pour que les voyageurs puissent vous trouver facilement.',
    },
    {
      index: 3,
      title: 'Documents & finalisation',
      desc: 'Justificatif, CGU',
      subtitle: 'Ajoutez vos documents officiels pour valider votre dossier de prestataire.',
    },
  ];

  private readonly STEP_FIELDS: Record<number, string[]> = {
    0: ['nom', 'prenom', 'email', 'telephone'],
    1: ['password', 'genre', 'date_naissance'],
    2: ['type', 'ville', 'adresse', 'annee_experience'],
    3: ['document_justificatif', 'accept'],
  };

  constructor(
    private fb:             FormBuilder,
    private authService:    AuthService,
    public  router:         Router,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      // STEP 0
      nom:      ['', [Validators.required, Validators.minLength(2)]],
      prenom:   ['', [Validators.required, Validators.minLength(2)]],
      email:    ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-]{8,15}$/)]],

      // STEP 1
      password:       ['', [Validators.required, Validators.minLength(8)]],
      genre:          ['', Validators.required],
      date_naissance: [null, Validators.required],

      // STEP 2
      type:             ['', Validators.required],
      ville:            ['', Validators.required],
      adresse:          ['', Validators.required],
      annee_experience: [null, [Validators.required, Validators.min(0), Validators.max(60)]],

      // STEP 3
      document_justificatif: [null, Validators.required],
      accept:                [false, Validators.requiredTrue],
    });
  }

  // ── Progress ──────────────────────────────────────────
  get progress(): number {
    return ((this.activeStep + 1) / this.steps.length) * 100;
  }

  // ── Navigation ────────────────────────────────────────
  nextStep(): void {
    if (!this.isStepValid(this.activeStep)) {
      this.markStepTouched(this.activeStep);
      return;
    }
    if (this.activeStep < this.steps.length - 1) this.activeStep++;
  }

  prevStep(): void {
    if (this.activeStep > 0) this.activeStep--;
  }

  goToStep(index: number): void {
    if (index < this.activeStep) this.activeStep = index;
  }

  isStepValid(step: number): boolean {
    return (this.STEP_FIELDS[step] ?? []).every(f => this.form.get(f)?.valid);
  }

  private markStepTouched(step: number): void {
    (this.STEP_FIELDS[step] ?? []).forEach(f => this.form.get(f)?.markAsTouched());
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  toggleAccept(): void {
    const current = this.form.get('accept')?.value;
    this.form.patchValue({ accept: !current });
    this.form.get('accept')?.markAsTouched();
  }

  /**
   * Profile image upload.
   */
  onProfileImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;

    if (file.size > 2097152) {
      this.messageService.add({
        severity: 'error',
        summary:  'Fichier trop volumineux',
        detail:   'La photo ne doit pas dépasser 2 Mo.',
        life:     5000,
      });
      return;
    }

    this.profileImageFile = file;
    const reader = new FileReader();
    reader.onload = () => { this.profileImagePreview = reader.result as string; };
    reader.readAsDataURL(file);
  }

  removeProfileImage(): void {
    this.profileImagePreview = null;
    this.profileImageFile    = null;
  }

  /**
   * Document justificatif upload.
   */
  onDocumentUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;

    if (file.size > 5242880) {
      this.messageService.add({
        severity: 'error',
        summary:  'Fichier trop volumineux',
        detail:   'Le document ne doit pas dépasser 5 Mo.',
        life:     5000,
      });
      return;
    }

    this.documentFile = file;
    this.form.patchValue({ document_justificatif: file });
    this.form.get('document_justificatif')?.updateValueAndValidity();
  }

  removeDocument(): void {
    this.documentFile = null;
    this.form.patchValue({ document_justificatif: null });
    this.form.get('document_justificatif')?.updateValueAndValidity();
  }

  onImageUpload(event: any): void {
    const file: File | undefined = event.files?.[0];
    if (!file) return;
    this.imageFile = file;
    const reader = new FileReader();
    reader.onload = () => { this.imagePreview = reader.result as string; };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imagePreview = null;
    this.imageFile    = null;
  }

  // ── Build FormData ────────────────────────────────────
  private buildFormData(): FormData {
    const fd       = new FormData();
    const raw      = this.form.value;
    const excluded = new Set(['accept', 'document_justificatif', 'date_naissance']);

    Object.entries(raw).forEach(([key, value]) => {
      if (excluded.has(key)) return;
      if (value !== null && value !== undefined) {
        fd.append(key, String(value));
      }
    });

    const dateVal: Date | null = raw['date_naissance'];
    if (dateVal instanceof Date) {
      fd.append('date_naissance', dateVal.toISOString());
    }

    fd.append('statut_validation', 'en_attente');

    if (this.documentFile)     fd.append('document_justificatif', this.documentFile);
    if (this.profileImageFile) fd.append('profile_image',         this.profileImageFile);
    if (this.imageFile)        fd.append('activity_image',        this.imageFile);

    return fd;
  }

  /**
   * Demande de prestataire.
   */
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.authService.registerPrestataire(this.buildFormData()).subscribe({
      next: () => {
        this.loading   = false;
        this.submitted = true;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary:  'Erreur',
          detail:   err?.error?.message || 'Une erreur est survenue. Veuillez réessayer.',
          life:     6000,
        });
      },
    });
  }
}