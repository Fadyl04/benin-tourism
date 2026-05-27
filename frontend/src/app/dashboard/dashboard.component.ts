import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TableModule,
    TagModule,
    BadgeModule,
    AvatarModule,
    TooltipModule,
    ChartModule,
    ProgressBarModule,
    MenuModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  sidebarCollapsed = signal(false);
  activeSection = signal('dashboard');

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  setSection(section: string): void {
    this.activeSection.set(section);
  }

  // ── Navigation items ──
  navItems = [
    {
      group: 'Principal',
      items: [
        { id: 'dashboard', label: 'Tableau de bord', icon: 'pi pi-th-large' },
        { id: 'stats',     label: 'Statistiques',    icon: 'pi pi-chart-line' },
      ]
    },
    {
      group: 'Contenu',
      items: [
        { id: 'users',      label: 'Utilisateurs',     icon: 'pi pi-users',       badge: '24' },
        { id: 'sites',      label: 'Sites touristiques',icon: 'pi pi-map-marker',  badge: '8' },
        { id: 'evenements', label: 'Événements',        icon: 'pi pi-calendar',    badge: '3' },
        { id: 'partenaires',label: 'Partenaires',       icon: 'pi pi-briefcase' },
      ]
    },
    {
      group: 'Administration',
      items: [
        { id: 'moderation', label: 'Modération',   icon: 'pi pi-shield' },
        { id: 'settings',   label: 'Paramètres',   icon: 'pi pi-cog' },
        { id: 'logs',       label: 'Journaux',      icon: 'pi pi-list' },
      ]
    }
  ];

  // ── KPI Cards ──
  kpis = [
    { label: 'Utilisateurs actifs', value: '2 847', delta: '+12%', deltaUp: true,  icon: 'pi pi-users',      color: 'blue' },
    { label: 'Sites publiés',       value: '134',   delta: '+5',   deltaUp: true,  icon: 'pi pi-map-marker', color: 'green' },
    { label: 'Événements ce mois',  value: '28',    delta: '-2',   deltaUp: false, icon: 'pi pi-calendar',   color: 'gold' },
    { label: 'Partenaires actifs',  value: '63',    delta: '+8%',  deltaUp: true,  icon: 'pi pi-briefcase',  color: 'navy' },
  ];

  // ── Recent users table ──
  recentUsers = [
    { name: 'Koffi Mensah',   email: 'k.mensah@example.com',   role: 'Utilisateur', status: 'Actif',    avatar: 'KM', date: '27/05/2026' },
    { name: 'Aïcha Traoré',   email: 'a.traore@example.com',   role: 'Guide',       status: 'Actif',    avatar: 'AT', date: '26/05/2026' },
    { name: 'Jean Dossou',    email: 'j.dossou@example.com',   role: 'Partenaire',  status: 'Suspendu', avatar: 'JD', date: '25/05/2026' },
    { name: 'Fatou Diallo',   email: 'f.diallo@example.com',   role: 'Utilisateur', status: 'Actif',    avatar: 'FD', date: '24/05/2026' },
    { name: 'Marc Agbokou',   email: 'm.agbokou@example.com',  role: 'Admin',       status: 'Actif',    avatar: 'MA', date: '23/05/2026' },
  ];

  // ── Recent events ──
  recentEvents = [
    { name: 'Festival Vodoun',       lieu: 'Ouidah',    date: '10/01/2027', status: 'Publié',   visits: 1240 },
    { name: 'Marché des Artisans',   lieu: 'Cotonou',   date: '15/02/2027', status: 'En attente',visits: 340 },
    { name: 'Nuit du Patrimoine',    lieu: 'Abomey',    date: '20/03/2027', status: 'Publié',   visits: 880 },
    { name: 'Rallye des Lacs',       lieu: 'Ganvié',    date: '05/04/2027', status: 'Brouillon', visits: 0 },
  ];

  // ── Chart data ──
  visitsChartData: any;
  visitsChartOptions: any;
  categoryChartData: any;
  categoryChartOptions: any;

  ngOnInit(): void {
    this.initCharts();
  }

  initCharts(): void {
    const docStyle = getComputedStyle(document.documentElement);

    this.visitsChartData = {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
      datasets: [
        {
          label: 'Visites 2026',
          data: [1200, 1900, 1400, 2200, 2800, 3100, 2700, 3400, 2900, 3600, 3200, 4100],
          fill: true,
          backgroundColor: 'rgba(10, 55, 100, 0.08)',
          borderColor: '#0a3764',
          tension: 0.4,
          pointBackgroundColor: '#0a3764',
          pointRadius: 4,
        },
        {
          label: 'Visites 2025',
          data: [800, 1100, 900, 1500, 1800, 2100, 1900, 2300, 2000, 2500, 2200, 2900],
          fill: false,
          borderColor: '#FFBE00',
          borderDash: [5, 5],
          tension: 0.4,
          pointBackgroundColor: '#FFBE00',
          pointRadius: 3,
        }
      ]
    };

    this.visitsChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#4a4a4a', font: { family: 'Montserrat', size: 12 } } }
      },
      scales: {
        x: { ticks: { color: '#9a9a9a', font: { family: 'Montserrat' } }, grid: { color: 'rgba(0,0,0,0.04)' } },
        y: { ticks: { color: '#9a9a9a', font: { family: 'Montserrat' } }, grid: { color: 'rgba(0,0,0,0.04)' } }
      }
    };

    this.categoryChartData = {
      labels: ['Sites culturels', 'Hôtels', 'Guides', 'Événements', 'Transports'],
      datasets: [{
        data: [35, 25, 18, 14, 8],
        backgroundColor: ['#0a3764', '#008559', '#FFBE00', '#1a6fa8', '#4db88c'],
        borderWidth: 0,
      }]
    };

    this.categoryChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#4a4a4a', font: { family: 'Montserrat', size: 11 }, padding: 16 }
        }
      },
      cutout: '68%'
    };
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' | undefined {
    switch (status) {
      case 'Actif':      return 'success';
      case 'Suspendu':   return 'danger';
      case 'Publié':     return 'success';
      case 'En attente': return 'warn';
      case 'Brouillon':  return 'secondary';
      default:           return 'info';
    }
  }

  getUserInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}