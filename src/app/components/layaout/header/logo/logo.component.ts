import { Component, computed } from '@angular/core';
import { Theme } from '../../../../services/theme';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.css',
})
export class Logo {

   constructor(private themeService: Theme) {}

  fillColor = computed(() => {
    return this.themeService.isDarkTheme() ? '#ffffff' : '#1e293b';
  });

}
