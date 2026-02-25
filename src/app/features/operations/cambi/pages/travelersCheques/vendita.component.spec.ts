import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenditaTravelersComponent } from './vendita.component';

describe('VenditaTravelersComponent', () => {
  let component: VenditaTravelersComponent;
  let fixture: ComponentFixture<VenditaTravelersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenditaTravelersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenditaTravelersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
