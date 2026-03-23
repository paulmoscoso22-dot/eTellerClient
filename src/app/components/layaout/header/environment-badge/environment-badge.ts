import { Component } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-environment-badge',
  standalone: true,
  imports: [],
  templateUrl: './environment-badge.html',
  styleUrl: './environment-badge.scss',
})
export class EnvironmentBadge {
  environment = environment;
  isProduction = environment.production;
  showEnvironment= true;
}
