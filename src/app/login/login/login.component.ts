import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { state, style, trigger, animate, transition } from '@angular/animations';

import { AuthService } from '../auth.service'

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/timer'
import { API } from 'app/app.api';
import { MemoriesService } from 'app/memories/memories.service';
import { AlertService } from 'app/alerts/alerts.service';

@Component({
  selector: 'cb-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('alert-message', [
      state('loading', style({
        color: 'rgb(255,255,255)',
        "background-color" : 'rgb(230,230,230)',
        'border-color' : 'rgb(230,230,230)'
      })),
      state('standard', style({
        color: '#aaa',
        "background-color" : 'transparent',
        'border-color' : '#dcdcdc'
      })),
      state('error', style({
        color: 'white',
        "background-color" : '#ff3e3e',
        'border-color' : '#de2c2c'
      })),
      state('success', style({
        color: '#00aff2',
        "background-color" : 'transparent',
        'border-color': '#00aff2'
      })),
      transition('* => *', animate('500ms 0s ease-in'))
    ])
  ]
})
export class LoginComponent implements OnInit {

  state: string = 'standard';
  message: string = 'VAMOS COMEÇAR';
  showAlert: boolean = false;
  loginForm!: FormGroup;
  API = API;
  readonly FRIDAY_DAY = 5;

  showPassword: boolean = false;
  redirectUrl: string = '/cedente'; // ajuste esta rota conforme necessário
  returnUrl: string ='';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private memoryService: MemoriesService,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
    
    this.auth.logout();

    this.loginForm = this.fb.group({
      email: this.fb.control('', [Validators.required, Validators.minLength(5)]),
      password: this.fb.control('', [Validators.required])
    })
  }
  
  
  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.state = 'error';
      this.message = 'Preencha usuário e senha corretamente.';
      this.showAlert = true;
      return;
    }

    const payload = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.message = 'AGUARDE...';
    this.state = 'loading';

    this.auth.login(payload).subscribe(
      response => {
        if (response && response.status === 200 && response.body && response.body.user) {
          this.auth.setValidToken(true);
          this.auth.setData(response.body);

          this.state = 'success';
          this.message = 'OK';

          Observable.timer(1000).subscribe(() => {
            if (this.returnUrl && this.returnUrl !== '/login') {
              this.router.navigateByUrl(this.returnUrl);
            } else {
              this.router.navigateByUrl(this.redirectUrl);
            }
          });
          return;
        }

        this.state = 'error';
        this.message = 'Email ou senha incorretos. Verifique suas credenciais.';
        this.showAlert = true;
        Observable.timer(3000).subscribe(() => {
          this.state = 'standard';
          this.message = 'VAMOS COMEÇAR';
          this.showAlert = false;
        });
      },
      () => {
        this.state = 'error';
        this.message = 'Erro na conexão. Tente novamente.';
        this.showAlert = true;
        Observable.timer(3000).subscribe(() => {
          this.state = 'standard';
          this.message = 'VAMOS COMEÇAR';
          this.showAlert = false;
        });
      }
    );
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
