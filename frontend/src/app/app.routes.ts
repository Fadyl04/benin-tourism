import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
export const routes: Routes = [
    /* Home */
    { path: '', component: HomeComponent },

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
    { path: '**', redirectTo: '' }
];
