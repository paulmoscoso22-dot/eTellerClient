import { Component, input, output, computed, signal, HostListener } from '@angular/core';

@Component({
  selector: 'app-sempione-row-actions',
  standalone: true,
  imports: [],
  templateUrl: './sempione-row-actions.component.html',
  styleUrls: ['./sempione-row-actions.component.css'],
})
export class SempioneRowActionsComponent {
  showView   = input(false);
  showEdit   = input(false);
  showTrace  = input(false);
  showDelete = input(false);
  showForce  = input(false);

  view   = output<void>();
  edit   = output<void>();
  trace  = output<void>();
  delete = output<void>();
  force  = output<void>();

  protected readonly actionCount = computed(() =>
    (this.showView()   ? 1 : 0) +
    (this.showEdit()   ? 1 : 0) +
    (this.showTrace()  ? 1 : 0) +
    (this.showDelete() ? 1 : 0) +
    (this.showForce()  ? 1 : 0)
  );

  protected readonly useOverflow = computed(() => this.actionCount() > 3);

  protected menuOpen = signal(false);
  protected menuTop  = signal(0);
  protected menuLeft = signal(0);

  protected openMenu(event: MouseEvent): void {
    event.stopPropagation();
    if (this.menuOpen()) {
      this.menuOpen.set(false);
      return;
    }
    const trigger = event.currentTarget as HTMLElement;
    const rect = trigger.getBoundingClientRect();
    this.menuTop.set(rect.bottom + 4);
    this.menuLeft.set(Math.max(0, rect.right - 155));
    this.menuOpen.set(true);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  @HostListener('document:click')
  protected onDocumentClick(): void {
    if (this.menuOpen()) {
      this.menuOpen.set(false);
    }
  }
}
