import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [
    CommonModule,

    // PrimeNG
    CardModule,
    TableModule,
    TagModule,
    AvatarModule,
    ChartModule,
    ButtonModule,
    TooltipModule
  ],
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {

  // =====================================================
  // KPI
  // =====================================================

  kpis = [
    {
      label: 'Utilisateurs actifs',
      value: '2 847',
      delta: '+12%',
      deltaUp: true,
      icon: 'pi pi-users',
      color: 'blue'
    },
    {
      label: 'Sites publiés',
      value: '134',
      delta: '+5',
      deltaUp: true,
      icon: 'pi pi-map-marker',
      color: 'green'
    },
    {
      label: 'Événements ce mois',
      value: '28',
      delta: '-2',
      deltaUp: false,
      icon: 'pi pi-calendar',
      color: 'gold'
    },
    {
      label: 'Partenaires actifs',
      value: '63',
      delta: '+8%',
      deltaUp: true,
      icon: 'pi pi-briefcase',
      color: 'navy'
    }
  ];


  // =====================================================
  // UTILISATEURS RÉCENTS
  // =====================================================

  recentUsers = [
    {
      name: 'Koffi Mensah',
      email: 'k.mensah@example.com',
      role: 'Utilisateur',
      status: 'Actif',
      avatar: 'KM',
      date: '27/05/2026'
    },
    {
      name: 'Aïcha Traoré',
      email: 'a.traore@example.com',
      role: 'Guide',
      status: 'Actif',
      avatar: 'AT',
      date: '26/05/2026'
    },
    {
      name: 'Jean Dossou',
      email: 'j.dossou@example.com',
      role: 'Partenaire',
      status: 'Suspendu',
      avatar: 'JD',
      date: '25/05/2026'
    },
    {
      name: 'Fatou Diallo',
      email: 'f.diallo@example.com',
      role: 'Utilisateur',
      status: 'Actif',
      avatar: 'FD',
      date: '24/05/2026'
    },
    {
      name: 'Marc Agbokou',
      email: 'm.agbokou@example.com',
      role: 'Admin',
      status: 'Actif',
      avatar: 'MA',
      date: '23/05/2026'
    }
  ];


  // =====================================================
  // ÉVÉNEMENTS RÉCENTS
  // =====================================================

  recentEvents = [
    {
      name: 'Festival Vodoun',
      lieu: 'Ouidah',
      date: '10/01/2027',
      status: 'Publié',
      visits: 1240
    },
    {
      name: 'Marché des Artisans',
      lieu: 'Cotonou',
      date: '15/02/2027',
      status: 'En attente',
      visits: 340
    },
    {
      name: 'Nuit du Patrimoine',
      lieu: 'Abomey',
      date: '20/03/2027',
      status: 'Publié',
      visits: 880
    },
    {
      name: 'Rallye des Lacs',
      lieu: 'Ganvié',
      date: '05/04/2027',
      status: 'Brouillon',
      visits: 0
    }
  ];


  // =====================================================
  // GRAPHIQUE DES VISITES
  // =====================================================

  visitsChartData: any;

  visitsChartOptions: any;


  // =====================================================
  // GRAPHIQUE DONUT
  // =====================================================

  categoryChartData: any;

  categoryChartOptions: any;


  // =====================================================
  // INITIALISATION
  // =====================================================

  ngOnInit(): void {
    this.initCharts();
  }


  // =====================================================
  // INITIALISATION DES GRAPHIQUES
  // =====================================================

  initCharts(): void {

    // -------------------------------------------------
    // Graphique des visites
    // -------------------------------------------------

    this.visitsChartData = {

      labels: [
        'Jan',
        'Fév',
        'Mar',
        'Avr',
        'Mai',
        'Juin',
        'Juil',
        'Août',
        'Sep',
        'Oct',
        'Nov',
        'Déc'
      ],

      datasets: [

        {
          label: 'Visites 2026',

          data: [
            1200,
            1900,
            1400,
            2200,
            2800,
            3100,
            2700,
            3400,
            2900,
            3600,
            3200,
            4100
          ],

          fill: true,

          backgroundColor: 'rgba(10, 55, 100, 0.08)',

          borderColor: '#0a3764',

          borderWidth: 2,

          tension: 0.4,

          pointBackgroundColor: '#0a3764',

          pointBorderColor: '#ffffff',

          pointBorderWidth: 2,

          pointRadius: 4,

          pointHoverRadius: 6
        },


        {
          label: 'Visites 2025',

          data: [
            800,
            1100,
            900,
            1500,
            1800,
            2100,
            1900,
            2300,
            2000,
            2500,
            2200,
            2900
          ],

          fill: false,

          borderColor: '#FFBE00',

          borderWidth: 2,

          borderDash: [5, 5],

          tension: 0.4,

          pointBackgroundColor: '#FFBE00',

          pointRadius: 3
        }

      ]

    };


    this.visitsChartOptions = {

      responsive: true,

      maintainAspectRatio: false,

      interaction: {
        intersect: false,
        mode: 'index'
      },

      plugins: {

        legend: {

          display: true,

          position: 'top',

          align: 'end',

          labels: {

            color: '#4a4a4a',

            font: {
              family: 'Montserrat',
              size: 12
            },

            usePointStyle: true,

            padding: 20
          }

        },

        tooltip: {

          backgroundColor: '#ffffff',

          titleColor: '#0a3764',

          bodyColor: '#4a4a4a',

          borderColor: '#e5e7eb',

          borderWidth: 1,

          padding: 12,

          displayColors: true
        }

      },

      scales: {

        x: {

          ticks: {

            color: '#9a9a9a',

            font: {
              family: 'Montserrat',
              size: 11
            }

          },

          grid: {

            display: false

          }

        },

        y: {

          beginAtZero: true,

          ticks: {

            color: '#9a9a9a',

            font: {
              family: 'Montserrat',
              size: 11
            },

            callback: (value: number) => {

              return value >= 1000
                ? `${value / 1000}k`
                : value;

            }

          },

          grid: {

            color: 'rgba(0, 0, 0, 0.05)'

          }

        }

      }

    };


    // -------------------------------------------------
    // Graphique donut
    // -------------------------------------------------

    this.categoryChartData = {

      labels: [

        'Sites culturels',

        'Hôtels',

        'Guides',

        'Événements',

        'Transports'

      ],

      datasets: [

        {

          data: [
            35,
            25,
            18,
            14,
            8
          ],

          backgroundColor: [

            '#0a3764',

            '#008559',

            '#FFBE00',

            '#1a6fa8',

            '#4db88c'

          ],

          borderWidth: 0,

          hoverOffset: 6

        }

      ]

    };


    this.categoryChartOptions = {

      responsive: true,

      maintainAspectRatio: false,

      cutout: '68%',

      plugins: {

        legend: {

          position: 'bottom',

          labels: {

            color: '#4a4a4a',

            font: {

              family: 'Montserrat',

              size: 11

            },

            padding: 16,

            usePointStyle: true

          }

        },

        tooltip: {

          callbacks: {

            label: (context: any) => {

              return ` ${context.label}: ${context.raw}%`;

            }

          }

        }

      }

    };

  }


  // =====================================================
  // STATUS
  // =====================================================

  getStatusSeverity(
    status: string
  ):
    'success'
    | 'warn'
    | 'danger'
    | 'info'
    | 'secondary'
    | 'contrast'
    | undefined {

    switch (status) {

      case 'Actif':
        return 'success';

      case 'Publié':
        return 'success';

      case 'Suspendu':
        return 'danger';

      case 'En attente':
        return 'warn';

      case 'Brouillon':
        return 'secondary';

      default:
        return 'info';

    }

  }


  // =====================================================
  // INITIALES UTILISATEUR
  // =====================================================

  getUserInitials(
    name: string
  ): string {

    return name

      .split(' ')

      .map(
        word => word.charAt(0)
      )

      .join('')

      .toUpperCase()

      .slice(0, 2);

  }

}