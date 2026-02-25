import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcquistoTravelersComponent } from './acquisto.component';

describe('AcquistoTravelersComponent', () => {
  let component: AcquistoTravelersComponent;
  let fixture: ComponentFixture<AcquistoTravelersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcquistoTravelersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcquistoTravelersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
