import { Injectable, Inject, PLATFORM_ID  } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { Router } from '@angular/router';
import { environment } from "../environments/environment";
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})

export class SitesService {
    private apiUrl = `${environment.apiUrl}`;
}