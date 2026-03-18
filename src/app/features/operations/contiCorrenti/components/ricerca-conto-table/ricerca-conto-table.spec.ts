import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RicercaContoTable } from './ricerca-conto-table';

describe('RicercaContoTable', () => {
  let component: RicercaContoTable;
  let fixture: ComponentFixture<RicercaContoTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RicercaContoTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RicercaContoTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
