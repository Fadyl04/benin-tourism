import { Injectable  } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../environments/environment";
import { Evenement, EventsApi, PaginatedEvents } from "../app/evenements/evenements.component";

@Injectable({
  providedIn: 'root'
})

export class EventsService {
    private apiUrl = `${environment.apiUrl}/evenement`;
    private httpOptions = { withCredentials: true };
    constructor(private http: HttpClient) {}

    /**
     * Créer un evenement
     */
    createEvent(event: FormData): Observable<EventsApi>{
        return this.http.post<EventsApi>(`${this.apiUrl}/create`, event , this.httpOptions);
    }

    /** 
     * Récupérer les évenements actifs
     */
    getEvents(page:number = 1, limit: number = 10, search: string = '', categorie?: string): Observable<PaginatedEvents> {
        let params = new HttpParams().set( 'page', page.toString()).set('limit', limit.toString());
        if ( search && search.trim() !== ''){
            params = params.set('search',  search.trim());
        }
        if ( categorie && categorie.trim() !== '') {
            params = params.set('categorie',categorie.trim());
        }
        return this.http.get<PaginatedEvents>(`${this.apiUrl}/show`, {params, ...this.httpOptions})
    }

    /**
     * Récupérer un évenement par son ID
     */
    getEventById(id: string):Observable<EventsApi>{
        return this.http.get<EventsApi>(`${this.apiUrl}/show/${id}`, this.httpOptions);
    }

    /**
      * Modifier un évenement
     */
    updateEvent(id: string, event: FormData):Observable<EventsApi>{
        return this.http.put<EventsApi>(`${this.apiUrl}/update/${id}`, event, this.httpOptions);
    }
    
    /**
     * Supprimer un évenement
     */
    deleteEvent( id: string ): Observable<{success: boolean;message: string;}> {
     return this.http.delete<{success: boolean;message: string;}>(`${this.apiUrl}/delete/${id}`, this.httpOptions);
    }

    
    /**
     * Récupérer les évenements dans la corbeille
     */
    getDeletedEvents( page: number = 1, limit: number = 10): Observable<PaginatedEvents> {
        const params = new HttpParams().set('page', page.toString()) .set( 'limit',limit.toString());
        return this.http.get<PaginatedEvents>( `${this.apiUrl}/trash`, { params, ...this.httpOptions });
    }
    
    
    /**
     * Restaurer un évenement
     */
    restoreEvent(id: string): Observable<EventsApi> {
        return this.http.patch<EventsApi>( `${this.apiUrl}/restore/${id}`,{}, this.httpOptions);
    }


}