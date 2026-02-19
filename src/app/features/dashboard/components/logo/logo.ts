import { Component } from '@angular/core';

@Component({
  selector: 'app-logo',
  imports: [],
  templateUrl: './logo.html',
  styleUrl: './logo.css',
})
export class Logo {
  // fillColor = computed(() => {
  //   return this.themeService.isDarkTheme() ? '#ffffff' : '#1e293b';
  // });
  fillColor = '#1e293b';
}
