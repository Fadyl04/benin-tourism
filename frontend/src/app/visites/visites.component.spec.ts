import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitesComponent } from './visites.component';

describe('VisitesComponent', () => {
  let component: VisitesComponent;
  let fixture: ComponentFixture<VisitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
