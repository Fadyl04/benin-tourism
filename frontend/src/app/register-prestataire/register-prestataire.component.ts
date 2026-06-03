import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PasswordModule } from 'primeng/password';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { Toast } from 'primeng/toast';
import { AvatarModule } from 'primeng/avatar';
import { DatePickerModule } from 'primeng/datepicker';
import { InputMaskModule } from 'primeng/inputmask';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-register-prestataire',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    PasswordModule,
    ToggleButtonModule,
    CardModule,
    ButtonModule,
    FileUploadModule,
    InputTextModule,
    TextareaModule,
    Toast,
    CheckboxModule,
    AvatarModule,
    DatePickerModule,
    InputMaskModule,
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
  today      = new Date(); // utilisé par [maxDate] du p-datePicker

  profileImagePreview: string | null = null;
  imagePreview:        string | null = null;

  profileImageFile: File | null = null;
  documentFile:     File | null = null;
  imageFile:        File | null = null;

  // ── Cohérent avec l'enum Prisma : Homme | Femme | Personnel ──
  readonly genres = [
    { value: 'Homme',     label: 'Homme' },
    { value: 'Femme',     label: 'Femme' },
    { value: 'Personnel', label: 'Autre / Ne pas préciser' },
  ];

  // ── Cohérent avec l'enum Prisma : guide | hotel | transport ──
  readonly activityTypes = [
    { value: 'guide',     label: 'Guide',     sub: 'Guide touristique', icon: '🧭' },
    { value: 'hotel',     label: 'Hôtel',     sub: 'Hébergement',       icon: '🏨' },
    { value: 'transport', label: 'Transport',  sub: 'Transport',         icon: '🚗' },
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
      desc: 'Téléphone, genre, naissance',
      subtitle: 'Vos coordonnées nous permettent de vous contacter et de personnaliser votre profil.',
    },
    {
      index: 2,
      title: 'Activité professionnelle',
      desc: 'Type, ville, description',
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
    public  router:         Router,           // public : utilisé dans le template
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      // STEP 0
      nom:      ['', [Validators.required, Validators.minLength(2)]],
      prenom:   ['', [Validators.required, Validators.minLength(2)]],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],

      // STEP 1
      telephone:      ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-]{8,15}$/)]],
      genre:          ['', Validators.required],       // valeurs : Homme | Femme | Personnel
      date_naissance: [null, Validators.required],     // Date JS → sérialisé en ISO

      // STEP 2
      type:             ['', Validators.required],     // valeurs : guide | hotel | transport
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

  // ── File uploads ──────────────────────────────────────
  onProfileImageUpload(event: any): void {
    const file: File | undefined = event.files?.[0];
    if (!file) return;
    this.profileImageFile = file;
    const reader = new FileReader();
    reader.onload = () => { this.profileImagePreview = reader.result as string; };
    reader.readAsDataURL(file);
  }

  removeProfileImage(): void {
    this.profileImagePreview = null;
    this.profileImageFile    = null;
  }

  onDocumentUpload(event: any): void {
    const file: File | undefined = event.files?.[0];
    if (!file) return;
    this.documentFile = file;
    this.form.patchValue({ document_justificatif: file });
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

    // Champs scalaires simples
    Object.entries(raw).forEach(([key, value]) => {
      if (excluded.has(key)) return;
      if (value !== null && value !== undefined) {
        fd.append(key, String(value));
      }
    });

    // date_naissance : Date JS → ISO string (backend reçoit une date parseable)
    const dateVal: Date | null = raw['date_naissance'];
    if (dateVal instanceof Date) {
      fd.append('date_naissance', dateVal.toISOString());
    }

    // statut_validation requis par Prisma — valeur initiale toujours "en_attente"
    fd.append('statut_validation', 'en_attente');

    // Fichiers
    if (this.documentFile)     fd.append('document_justificatif', this.documentFile);
    if (this.profileImageFile) fd.append('profile_image',         this.profileImageFile);
    
    return fd;
  }

  // ── Submit ────────────────────────────────────────────
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