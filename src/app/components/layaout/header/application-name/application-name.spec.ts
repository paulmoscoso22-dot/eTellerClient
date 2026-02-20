import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationName } from './application-name';

describe('ApplicationName', () => {
  let component: ApplicationName;
  let fixture: ComponentFixture<ApplicationName>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationName]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationName);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
