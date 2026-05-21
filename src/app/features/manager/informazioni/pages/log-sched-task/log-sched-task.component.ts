import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SempionePageHeaderComponent, SempioneCardComponent, SempioneCardHeaderComponent,
} from '../../../../../components/General';

@Component({
  selector: 'app-log-sched-task',
  standalone: true,
  imports: [CommonModule, SempionePageHeaderComponent, SempioneCardComponent, SempioneCardHeaderComponent],
  templateUrl: './log-sched-task.component.html',
  styleUrls: ['./log-sched-task.component.css'],
})
export class LogSchedTaskComponent {}
