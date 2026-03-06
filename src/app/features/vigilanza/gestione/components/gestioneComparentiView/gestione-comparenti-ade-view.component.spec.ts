import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestioneComparentiAdeViewComponent } from './gestione-comparenti-ade-view.component';

describe('GestioneComparentiAdeViewComponent', () => {
  let component: GestioneComparentiAdeViewComponent;
  let fixture: ComponentFixture<GestioneComparentiAdeViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestioneComparentiAdeViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestioneComparentiAdeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
