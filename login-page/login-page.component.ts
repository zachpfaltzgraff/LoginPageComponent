import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { signUp } from 'aws-amplify/auth';
import { InputNumberModule } from 'primeng/inputnumber';
import { confirmSignUp, type ConfirmSignUpInput } from 'aws-amplify/auth';
import { Router } from '@angular/router';
import { signIn, type SignInInput } from 'aws-amplify/auth';
import { CredentailsService } from '../../../credentials.service';

type SignUpParameters = {
  username: string;
  password: string;
  email: string;
};

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, 
    ButtonModule, 
    FloatLabelModule, 
    InputTextModule, 
    PasswordModule,
    ToastModule,
    CommonModule,
    InputNumberModule
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  constructor(private messageService: MessageService, 
    private router: Router,
    private credentialService: CredentailsService) {}

  showCode: boolean = false;
  
  async onSignUp() {
    let length = this.signupForm.value.password?.length ?? 0;
    if (this.signupForm.valid && length >= 8) {
      console.log("valid form");
      const formData = {
        username: this.signupForm.value.username ?? '',
        email: this.signupForm.value.email ?? '',
        password: this.signupForm.value.password ?? '',
      }
      this.credentialService.setUsername(formData.username);
      await handleSignUp({ username: formData.username, password: formData.password, email: formData.email});
      this.showCode = true;

    } 
    else if (length <= 0){
      this.messageService.add({ key: 'bc', severity: 'error', summary: 'Error', detail: 'invalid Form' });
    }
    else if (length < 8){
      this.messageService.add({ key: 'bc', severity: 'error', summary: 'Error', detail: 'Password Must be 8 Characters' });
    } 
  }

  async onLogin() {
    if (this.loginForm.valid) {
      console.log("valid form")
      const formData = {
        username: this.loginForm.value.username ?? '',
        password: this.loginForm.value.password ?? '',
      }

      await handleSignIn({username: formData.username, password: formData.password})

      this.credentialService.setLogin(true);

      this.messageService.add({ key: 'bc', severity: 'success', summary: 'Signed In', detail: 'Page will redirect in 1 second'});
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.router.navigate(['']);
      
    } else {
      this.messageService.add({ key: 'bc', severity: 'error', summary: 'Error', detail: 'Invalid Form' });
    }
  }

  async onConfirm() {
    if (this.confirmCodeForm.valid) {
      const formData = {
        username: this.signupForm.value.username ?? '',
        code: String(this.confirmCodeForm.value.code) ?? '',
      }

      await handleSignUpConfirmation({username: formData.username, confirmationCode: formData.code});
      console.log("Confirmation complete")
      console.log(formData.username + ' ' + this.signupForm.value.password)
      await handleSignIn({username: formData.username, password: this.signupForm.value.password ?? ''})
      this.credentialService.setLogin(true);
      this.credentialService.setUsername(formData.username);
      this.messageService.add({ key: 'bc', severity: 'success', summary: 'Signed Up', detail: 'Will redirect in 1 second' });
      await new Promise(resolve => setTimeout(resolve, 1500));
      this.router.navigate(['']);
      
    } else {
      this.messageService.add({ key: 'bc', severity: 'error', summary: 'Error', detail: 'Invalid Form' });
      this.credentialService.setLogin(false);
    }
  }

  signupForm = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', Validators.required)
  });

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', Validators.required)
  });

  confirmCodeForm = new FormGroup({
    code: new FormControl(null, Validators.required),
  })
}

async function handleSignUp(this: any, {
  username,
  password,
  email,
}: SignUpParameters) {
  try {
    const userId = await signUp({
      username,
      password,
      options: {
        userAttributes: {
          email,
        },
      }
    });

    console.log(userId);
  } catch (error) {
    alert(error);
    console.log('error signing up:', error);
    window.location.reload();
  }
}

async function handleSignUpConfirmation({
  username,
  confirmationCode
}: ConfirmSignUpInput) {
  try {
    const userConfirmed = await confirmSignUp({
      username,
      confirmationCode
    });

    if (userConfirmed) {
      console.log('Sign up confirmed successfully.');
    } else {
      console.log('Sign up confirmation failed.');
    }
  } catch (error) {
    alert(error);
    console.log('error confirming sign up', error);
  }
}

async function handleSignIn({ username, password }: SignInInput) {
  try {
    const user = await signIn({ username, password });
    
    if (user) {
      console.log('User signed in successfully.');
    } else {
      console.log('Sign in failed.');
    }
  } catch (error) {
    alert(error);
    console.log('error signing in', error);
    window.location.reload();
  }
}