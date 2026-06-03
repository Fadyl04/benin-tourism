import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPrestataireComponent } from './register-prestataire.component';

describe('RegisterPrestataireComponent', () => {
  let component: RegisterPrestataireComponent;
  let fixture: ComponentFixture<RegisterPrestataireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPrestataireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterPrestataireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
