import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[sempione-tab]',
  standalone: true,
})
export class SempioneTabDirective {
  @Input({ required: true, alias: 'sempione-tab' }) label!: string;

  constructor(public readonly tpl: TemplateRef<void>) {}
}
