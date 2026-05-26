import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../service/auth.service';
import { AuthComponent } from '../auth/auth.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MenubarModule,
    ButtonModule,
    RouterLink,
    CardModule,
    AuthComponent,
    
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  /* Modal */
  @ViewChild(AuthComponent) authModal!: AuthComponent;

  constructor(
    private route: ActivatedRoute
  ) {}

  openLogin(): void {
    this.authModal.openLogin(); 
  }
  openRegister(): void { 
    this.authModal.openRegister(); 
  }

  

  /* Navbar Items */
  itemsNavbar: MenuItem[] = [
    { label: 'Accueil', routerLink: '/' },
    { label: 'Fonctionalités', routerLink: '/', fragment: 'features' },
    {
      label: 'Explorer',
      items: [
        { label: 'Sites touristiques', routerLink: '/sites' },
        { label: 'Visites touristiques', routerLink: '/visites' },
        { label: 'Événements culturels', routerLink: '/evenements' }
      ]
    },
    {
      label: 'Partenaires',
      items: [
        { label: 'Hôtels', routerLink: '/hotels' },
        { label: 'Guides touristiques', routerLink: '/guides' },
        { label: 'Transports', routerLink: '/transports' }
      ]
    },
    { label: 'Contact', routerLink: '/contact' },
    {
      label: 'Langue',
      items: [
        { label: 'FR', command: () => this.changeLanguage('fr') },
        { label: 'EN', command: () => this.changeLanguage('en') }
      ]
    },

    { separator: true, styleClass: 'mobile-only-item' },

    {
      label: 'Se connecter',
      icon: 'pi pi-user',
      routerLink: '/login',
      styleClass: 'mobile-only-item',
      command: () => this.openLogin()
    },

    {
      label: 'Créer un compte',
      routerLink: '/register',
      styleClass: 'mobile-only-item mobile-register-item',
      command: () => this.openRegister()
    }

  ];

  changeLanguage(lang: string): void { }

  // ===== HERO SLIDESHOW =====
  heroSlides = [
    'assets/img/hero/hero1.jpg',
    'assets/img/hero/hero2.jpg',
    'assets/img/hero/hero3.jpg',
    'assets/img/hero/hero4.jpg',
    'assets/img/hero/hero5.webp',
    'assets/img/hero/hero8.jpg',

  ];

  currentSlide = 0;
  private slideInterval: any;

  ngOnInit(): void {

    this.startSlideshow();

    /**
     * OPEN LOGIN MODAL AFTER RESET PASSWORD
     */
    this.route.queryParams.subscribe(params => {
      if (params['login']) {
        setTimeout(() => {
          this.openLogin();
        }, 300);
      }
    });

  }

  ngOnDestroy(): void {
    clearInterval(this.slideInterval);
  }

  startSlideshow(): void {
    this.slideInterval = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
    }, 5000);
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

}