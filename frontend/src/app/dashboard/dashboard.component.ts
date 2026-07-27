import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

// PrimeNG
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-dashboard',

  standalone: true,

  imports: [
    CommonModule,

    // Angular Router
    RouterLink,
    RouterLinkActive,
    RouterOutlet,

    // PrimeNG
    AvatarModule,
    TooltipModule
  ],

  templateUrl: './dashboard.component.html',

  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  // =====================================================
  // SIDEBAR
  // =====================================================

  sidebarCollapsed = signal(false);
  mobileMenuOpen   = signal(false);
  isMobile         = signal(this.checkIsMobile());

  private checkIsMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= 960;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(this.checkIsMobile());
    if (!this.isMobile()) {
      this.mobileMenuOpen.set(false);
    }
  }

  toggleSidebar(): void {
    if (this.isMobile()) {
      this.toggleMobileMenu();
    } else {
      this.sidebarCollapsed.update(collapsed => !collapsed);
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(open => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  // =====================================================
  // NAVIGATION
  // =====================================================

  navItems = [

    {
      group: 'Principal',

      items: [

        {
          id: 'dashboard',
          label: 'Tableau de bord',
          icon: 'pi pi-th-large',
          route: '/dashboard'
        },

        {
          id: 'stats',
          label: 'Statistiques',
          icon: 'pi pi-chart-line',
          route: '/dashboard/statistiques'
        }

      ]

    },

    {
      group: 'Contenu',

      items: [

        {
          id: 'users',
          label: 'Utilisateurs',
          icon: 'pi pi-users',
          badge: '24',
          route: '/dashboard/utilisateurs'
        },

        {
          id: 'sites',
          label: 'Sites touristiques',
          icon: 'pi pi-map-marker',
          badge: '8',
          route: '/dashboard/sites'
        },

        {
          id: 'evenements',
          label: 'Événements',
          icon: 'pi pi-calendar',
          badge: '3',
          route: '/dashboard/evenements'
        },

        {
          id: 'partenaires',
          label: 'Partenaires',
          icon: 'pi pi-briefcase',
          route: '/dashboard/partenaires'
        }

      ]

    },

    {
      group: 'Administration',

      items: [

        {
          id: 'moderation',
          label: 'Modération',
          icon: 'pi pi-shield',
          route: '/dashboard/moderation'
        },

        {
          id: 'settings',
          label: 'Paramètres',
          icon: 'pi pi-cog',
          route: '/dashboard/parametres'
        },

        {
          id: 'logs',
          label: 'Journaux',
          icon: 'pi pi-list',
          route: '/dashboard/journaux'
        }

      ]

    }

  ];
}