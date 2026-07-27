import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FirstLoginComponent } from './first-login/first-login.component';
import { RegisterPrestataireComponent } from './register-prestataire/register-prestataire.component';
import { SitesComponent } from './sites/sites.component';
import {authGuard} from './guards/auth.guard';
import { GraphComponent } from './dashboard/graph/graph.component';
import { EvenementsComponent } from './evenements/evenements.component';

export const routes: Routes = [

    /* Home */
    { 
        path: '', 
        component: HomeComponent
    },


    /* First Login */
    {
        path: 'change-password',
        component: FirstLoginComponent,
        canActivate: [authGuard]
    },

    /* Register Prestataire */
    {
        path: 'register-prestataire',
        component: RegisterPrestataireComponent
    },

    /* Dashboard */
    { 
        path: 'dashboard', 
        component: DashboardComponent,
        canActivate: [
            authGuard,
        ],
        data: {
            roles: [
                'admin', 
                'prestataire'
            ]
        },
        children: [
            { 
                path: '', 
                redirectTo: 'graph', 
                pathMatch: 'full'
            },
            {
                path: 'graph',
                component: GraphComponent
            },
            { 
                path: 'sites', 
                component: SitesComponent 
            },
            {
                path: 'evenements',
                component: EvenementsComponent
            }

        ]
    },

    // AUTH PASSWORD FLOW
    {
        path: 'forgot-password',
        component: ForgotPasswordComponent
    },
    {
        path: 'reset-password/:token',
        component: ResetPasswordComponent
    },
    
    /* fallback */
    { 
        path: '**', 
        redirectTo: ''
    }
];
