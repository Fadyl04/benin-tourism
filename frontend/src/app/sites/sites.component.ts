import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { ImageModule } from 'primeng/image';
import { FileUploadModule } from 'primeng/fileupload';
import { FormsModule, Validators, FormGroup, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { SitesService } from '../../service/sites.service';
import { AbilityService } from '../../service/ability.service';
import { AuthService } from '../../service/auth.service';
import { environment } from '../../environments/environment';

const TAG_SEVERITIES: Array<'info' | 'success' | 'warn' | 'secondary' | 'contrast'> =['info', 'success', 'warn', 'secondary', 'contrast'];

export interface SiteTouristique {
  id_site: string;
  nom: string;
  image: string;
  description: string;
  localisation: string;
  horaire: string;
  categorie: string;
  createdAt: string;
  updateAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
}

export interface SitesApi {
  success: boolean;
  message?: string;
  data: SiteTouristique;
}

export interface PaginatedSites {
  success: boolean;
  data: SiteTouristique[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    nextPage: boolean;
    previousPage: boolean;
  };
}

@Component({
  selector: 'app-sites',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    TagModule,
    SelectModule,
    MessageModule,
    DialogModule,
    AvatarModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    FileUploadModule,
    ImageModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './sites.component.html',
  styleUrl: './sites.component.css',
})
export class SitesComponent implements OnInit {

  // ── Permissions (CASL) ──
  canCreateSite = false;
  canUpdateSite = false;
  canDeleteSite = false;
  canViewSite = false;

  // ── State tableau ──
  sites: SiteTouristique[] = [];
  totalRecords = 0;
  loading = false;
  page = 1;
  limit = 10;
  search = '';
  categorieFilter = '';

  private searchSubject = new Subject<string>();
  private categorieFilterSubject = new Subject<string>();

  // ── Dialog ──
  viewDialogVisible = false;
  selectedSite: SiteTouristique | null = null;
  dialogVisible = false;
  isEditMode = false;
  saving = false;
  currentSiteId: string | null = null;

  imagePreview: string | null = null;
  imageFile: File | null = null;

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private sitesService: SitesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private abilityService: AbilityService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {

  // ── 1. Recharge les abilities depuis le storage (fix timing) ──
  const user = this.authService.currentUserValue;
  if (user) {
    this.abilityService.updateAbility(user.permissions ?? [], user.role);
  }

  // ── 2. Permissions ──
  this.canCreateSite = this.abilityService.can('create', 'SiteTouristique');
  this.canUpdateSite = this.abilityService.can('update', 'SiteTouristique');
  this.canDeleteSite = this.abilityService.can('delete', 'SiteTouristique');
  this.canViewSite = this.abilityService.can('read','SiteTouristique');

  // ── 3. Form ──
  this.form = this.fb.group({
    nom:          ['', [Validators.required, Validators.minLength(3)]],
    description:  ['', [Validators.required, Validators.minLength(10)]],
    localisation: ['', Validators.required],
    horaire:      ['', Validators.required],
    categorie:    ['', [Validators.required, Validators.minLength(2)]],
  });

  // ── 4. Search debounce ──
  this.searchSubject.pipe(
    debounceTime(400),
    distinctUntilChanged(),
  ).subscribe((value) => {
    this.search = value;
    this.page = 1;
    this.loadSites();
  });

  this.categorieFilterSubject.pipe(
    debounceTime(400),
    distinctUntilChanged(),
  ).subscribe((value) => {
    this.categorieFilter = value;
    this.page = 1;
    this.loadSites();
  });

  // ── 5. Chargement initial ──
  this.loadSites();
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const first = event.first ?? 0;
    const rows  = event.rows  ?? this.limit;
    this.page  = Math.floor(first / rows) + 1;
    this.limit = rows;
    this.loadSites();
  }

  loadSites(): void {
    this.loading = true;
    this.sitesService.getSites(this.page, this.limit, this.search, this.categorieFilter)
      .subscribe({
        next: (res) => {
          this.sites = res.data;
          this.totalRecords = res.pagination.total;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary:  'Erreur',
            detail:   'Impossible de charger les sites touristiques.',
            life:     5000,
          });
        },
      });
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  onCategorieFilterInput(value: string): void {
    this.categorieFilterSubject.next(value);
  }

  // ── Dialog création / édition ──
  openCreateDialog(): void {
    this.isEditMode = false;
    this.currentSiteId = null;
    this.form.reset();
    this.imagePreview = null;
    this.imageFile = null;
    this.dialogVisible = true;
  }

  openEditDialog(site: SiteTouristique): void {
    this.isEditMode = true;
    this.currentSiteId = site.id_site;
    this.form.patchValue({
      nom:          site.nom,
      description:  site.description,
      localisation: site.localisation,
      horaire:      site.horaire,
      categorie:    site.categorie,
    });
    this.imagePreview = this.resolveImageUrl(site.image);
    this.imageFile = null;
    this.dialogVisible = true;
  }

  // ── Résout un chemin d'image relatif renvoyé par l'API en URL absolue ──
  private resolveImageUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const origin = environment.uploadUrl.replace('/uploads', '');
    return `${origin}${path}`;
  }

  closeDialog(): void {
    this.dialogVisible = false;
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
    this.imageFile = null;
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  private buildFormData(): FormData {
    const fd = new FormData();
    Object.entries(this.form.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        fd.append(key, String(value));
      }
    });
    if (this.imageFile) {
      fd.append('image', this.imageFile);
    }
    return fd;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const fd = this.buildFormData();

    const request$ = this.isEditMode && this.currentSiteId
      ? this.sitesService.updateSite(this.currentSiteId, fd)
      : this.sitesService.createSite(fd);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.dialogVisible = false;
        this.messageService.add({
          severity: 'success',
          summary:  'Succès',
          detail:   this.isEditMode ? 'Site modifié avec succès.' : 'Site créé avec succès.',
          life:     4000,
        });
        this.loadSites();
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary:  'Erreur',
          detail:   err?.error?.message || 'Une erreur est survenue.',
          life:     5000,
        });
      },
    });
  }

  confirmDelete(site: SiteTouristique): void {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment supprimer "${site.nom}" ? Cette action peut être annulée depuis la corbeille.`,
      header: 'Confirmer la suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      closable: true,
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteSite(site),
    });
  }

  private deleteSite(site: SiteTouristique): void {
    this.sitesService.deleteSite(site.id_site).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary:  'Supprimé',
          detail:   `"${site.nom}" a été déplacé vers la corbeille.`,
          life:     4000,
        });
        this.loadSites();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary:  'Erreur',
          detail:   'Impossible de supprimer ce site.',
          life:     5000,
        });
      },
    });
  }

  getCategorieSeverity(value: string): 'info' | 'success' | 'warn' | 'secondary' | 'contrast' {
    if (!value) return 'contrast';
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }
    return TAG_SEVERITIES[Math.abs(hash) % TAG_SEVERITIES.length];
  }

  // ── Voir les détails d'un site touristique ──
  openViewDetail(site: SiteTouristique): void {
    this.selectedSite = {
      ...site,
      image: this.resolveImageUrl(site.image) ?? '',
    };
    this.viewDialogVisible = true;
  }

  closeViewDialog(): void {
    this.viewDialogVisible = false;
    this.selectedSite = null;
  }
}