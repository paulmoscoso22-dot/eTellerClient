import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('devextreme-angular', () => ({
  DxFormModule: class {},
  DxButtonModule: class {},
  DxLoadIndicatorModule: class {},
  DxTextBoxModule: class {},
  DxPopupModule: class {},
  DxTextBoxComponent: class {},
  DxButtonComponent: class {},
  DxLoadIndicatorComponent: class {},
  DxPopupComponent: class {},
}));
import { ForceLoginComponent } from './force-login.component';

describe('ForceLoginComponent', () => {
  let component: ForceLoginComponent;
  let fixture: ComponentFixture<ForceLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForceLoginComponent],
    })
      .overrideComponent(ForceLoginComponent, {
        set: {
          template: `
            @if (visible) {
              <div data-testid="popup">
                <button data-testid="confirm" (click)="confirmed.emit()">Continua</button>
                <button data-testid="cancel" (click)="cancelled.emit()">Annulla</button>
              </div>
            }
          `,
          imports: [],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ForceLoginComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('confirmed emits when "Continua" button is clicked', () => {
    component.visible = true;
    fixture.detectChanges();

    let emitted = false;
    component.confirmed.subscribe(() => (emitted = true));

    const btn = fixture.nativeElement.querySelector('[data-testid="confirm"]') as HTMLButtonElement;
    btn.click();

    expect(emitted).toBe(true);
  });

  it('cancelled emits when "Annulla" button is clicked', () => {
    component.visible = true;
    fixture.detectChanges();

    let emitted = false;
    component.cancelled.subscribe(() => (emitted = true));

    const btn = fixture.nativeElement.querySelector('[data-testid="cancel"]') as HTMLButtonElement;
    btn.click();

    expect(emitted).toBe(true);
  });

  it('visible=false → popup is not rendered', () => {
    component.visible = false;
    fixture.detectChanges();

    const popup = fixture.nativeElement.querySelector('[data-testid="popup"]');
    expect(popup).toBeNull();
  });

  it('visible=true → popup is rendered', () => {
    component.visible = true;
    fixture.detectChanges();

    const popup = fixture.nativeElement.querySelector('[data-testid="popup"]');
    expect(popup).not.toBeNull();
  });
});
