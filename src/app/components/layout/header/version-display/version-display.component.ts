import { Component } from '@angular/core';

@Component({
  selector: 'app-version-display',
  imports: [],
  templateUrl: './version-display.component.html',
  styleUrl: './version-display.component.css',
})
export class VersionDisplay {
  version: string = '1.0.0';
  buildDate: string = '';

  ngOnInit() {
    // TODO: Get version info from version service or environment
    this.buildDate = new Date().toLocaleDateString();
  }
}
