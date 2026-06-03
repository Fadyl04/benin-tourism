import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FirstLoginComponent } from './first-login/first-login.component';
import { RegisterPrestataireComponent } from './register-prestataire/register-prestataire.component';
import {authGuard} from './guards/auth.guard';

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
        }
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
