import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TraceDetaillComponent } from './trace-detaill.component';

describe('TraceDetaillComponent', () => {
  let component: TraceDetaillComponent;
  let fixture: ComponentFixture<TraceDetaillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TraceDetaillComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TraceDetaillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
