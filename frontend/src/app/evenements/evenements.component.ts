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
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { FileUploadModule } from 'primeng/fileupload';
import { FormsModule, Validators, FormGroup, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AbilityService } from '../../service/ability.service';
import { AuthService } from '../../service/auth.service';
import { EventsService } from '../../service/events.service';

const TAG_SEVERITIES: Array<'info' | 'success' | 'warn' | 'secondary' | 'contrast'> =['info', 'success', 'warn', 'secondary', 'contrast'];


export interface Evenement {
  id_evenement: string;
  id_hotel: string | null;
  nom: string;
  image: string;
  description: string;
  localisation: string;
  categorie: string;
  date_debut: string;
  date_fin: string;
  nombre_place: string;
  prix_standard: string;
  prix_vip: string;
  prix_elite : string | null
  prix_premium: string;
  createdAt: string;
  updateAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
}

export interface EventsApi {
  success: boolean;
  message?: string;
  data: Evenement;
}

export interface PaginatedEvents {
  success: boolean;
  data: Evenement[];
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
  selector: 'app-evenements',
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
    FileUploadModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './evenements.component.html',
  styleUrl: './evenements.component.css',
})



export class EvenementsComponent implements OnInit {

  /* Permissions (CASL) */
  canCreateEvenement = false;
  canUpdateEvenement = false;
  canDeleteEvenement = false;
  canViewEvenement = false;

  /* Tableaux Evenements */
  events: Evenement[] = []
  totalRecords = 0;
  loading = false;
  page = 1;
  limit = 10;
  search = '';
  categorieFilter = '';

  private searchSubject = new Subject<string>();
  private categorieFilterSubject = new Subject<string>();

  /* Modal */
  viewModal = false;
  selectedEvent: Evenement | null  = null;
  modalForm = false;
  isEditMode = false;
  saving = false;
  currentEventId: string | null = null;

  imagePreview: string | null = null;
  imageFile: File | null = null;

  form!: FormGroup;

  constructor(
    fb: FormBuilder,
    eventsService:EventsService,
    messageService: MessageService,
    confirmationService: ConfirmationService,
    abilityService: AbilityService,
    authService: AuthService,

  ){}

  ngOnInit(): void {

    

  }

}
