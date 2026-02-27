import { Component, effect, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { config } from 'devextreme/common';
import { licenseKey } from './devextreme-lincense';
import { Theme } from './services/theme';

config({ licenseKey });

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {

  isDarkTheme = false;

  constructor(
    private themeService: Theme
  ) {
    // Effetto per reagire ai cambiamenti del tema
    effect(() => {
      this.isDarkTheme = this.themeService.currentTheme().includes('dark');
    });
  }

  async ngOnInit(): Promise<void> {
    // Inizializza il tema
    await this.initializeTheme();
  }

  private async initializeTheme(): Promise<void> {
    await this.themeService.initialize();
    this.isDarkTheme = this.themeService.isDarkTheme();
  }
}
