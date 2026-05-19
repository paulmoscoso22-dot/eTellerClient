import { Component, input, output, computed } from '@angular/core';

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

  view   = output<void>();
  edit   = output<void>();
  trace  = output<void>();
  delete = output<void>();

  protected readonly actionCount = computed(() =>
    (this.showView()   ? 1 : 0) +
    (this.showEdit()   ? 1 : 0) +
    (this.showTrace()  ? 1 : 0) +
    (this.showDelete() ? 1 : 0)
  );

  protected readonly useOverflow = computed(() => this.actionCount() > 3);
}
