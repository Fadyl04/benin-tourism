import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../environments/environment";
import { SiteTouristique, SitesApi, PaginatedSites} from '../app/sites/sites.component'

@Injectable({
  providedIn: 'root'
})

export class SitesService {
  private apiUrl = `${environment.apiUrl}/site`;
  private httpOptions = { withCredentials: true };
  constructor(private http: HttpClient) {}

  /**
   * Créer un site touristique
   */
  createSite(site: FormData): Observable<SitesApi> {
    return this.http.post<SitesApi>(`${this.apiUrl}/create`, site, this.httpOptions);
  }

  /** 
   * Récupérer les sites touristiques actifs
   */
  getSites(page: number = 1, limit: number = 10, search: string = '', categorie?: string): Observable<PaginatedSites> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }
    if (categorie && categorie.trim() !== '') {
      params = params.set('categorie', categorie.trim());
    }
    return this.http.get<PaginatedSites>(`${this.apiUrl}/show`, { params, ...this.httpOptions });
  }

  /**
   * Récupérer un site touristique par son ID
   */
  getSiteById(id: string): Observable<SitesApi> {
    return this.http.get<SitesApi>(`${this.apiUrl}/show/${id}`, this.httpOptions);
  }

  /**
   * Modifier un site touristique
   */
  updateSite(id: string, site: FormData): Observable<SitesApi> {
    return this.http.put<SitesApi>(`${this.apiUrl}/update/${id}`, site, this.httpOptions);
  }

  /**
   * Supprimer un site
   */
  deleteSite(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/delete/${id}`, this.httpOptions);
  }


  /**
   * Récupérer les sites dans la corbeille
   */
  getDeletedSites(page: number = 1, limit: number = 10): Observable<PaginatedSites> {
    const params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    return this.http.get<PaginatedSites>(`${this.apiUrl}/trash`, { params, ...this.httpOptions });
  }


  /**
   * Restaurer un site touristique
   */
  restoreSite(id: string): Observable<SitesApi> {
    return this.http.patch<SitesApi>(`${this.apiUrl}/restore/${id}`, {}, this.httpOptions);
  }

}