import {
  Component,
  ContentChildren,
  QueryList,
  AfterContentInit,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { SempioneTabDirective } from './sempione-tab.directive';

@Component({
  selector: 'app-sempione-tab-panel',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './sempione-tab-panel.component.html',
  styleUrls: ['./sempione-tab-panel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SempioneTabPanelComponent implements AfterContentInit {
  @ContentChildren(SempioneTabDirective) tabs!: QueryList<SempioneTabDirective>;

  activeIndex = signal(0);

  ngAfterContentInit(): void {}

  activate(i: number): void {
    this.activeIndex.set(i);
  }
}
