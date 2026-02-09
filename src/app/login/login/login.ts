import { Component } from '@angular/core';
import { DxTextBoxModule } from 'devextreme-angular';
import { DxButtonModule } from 'devextreme-angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [DxTextBoxModule, DxButtonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username: string = '';
  password: string = '';

  constructor(private router: Router) {}

  onLogin() {
    if (this.username === 'admin' && this.password === '1234') {
      alert('Login riuscito!');
      this.router.navigate(['/dashboard']); // naviga a dashboard
    } else {
      alert('Username o password errati');
    }
  }
}
