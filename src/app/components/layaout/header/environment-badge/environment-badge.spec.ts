import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnvironmentBadge } from './environment-badge';

describe('EnvironmentBadge', () => {
  let component: EnvironmentBadge;
  let fixture: ComponentFixture<EnvironmentBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnvironmentBadge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnvironmentBadge);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
