import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DxTextBoxModule, DxButtonModule, DxFormModule } from 'devextreme-angular';
import { AuthFacade } from '../auth.facade';
import { Router } from '@angular/router';
import { LoginCommand } from '../domain/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DxTextBoxModule, DxButtonModule, DxFormModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authFacade: AuthFacade,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;

    // Build LoginCommand with form values and defaults
    const loginCommand: LoginCommand = {
      userId: username,
      password: password,
      ipAddress: this.getClientIpAddress(),
      isCashDesk: false,
      cashDeskId: null,
      branchId: null,
      macAddress: null,
      forceLogin: false,
      isNewSession: true
    };

    // Call auth facade to perform login
    this.authFacade.login(loginCommand).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Token is already stored by the facade
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
      },
    });
  }

  private getClientIpAddress(): string {
    // In a browser environment, the actual IP address is typically obtained from the server
    // For now, return a placeholder. The backend should extract the real IP from the request.
    return 'client-ip';
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
