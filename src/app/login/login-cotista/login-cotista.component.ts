import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { API } from '../../app.api';

function senhasConferem(control: AbstractControl): ValidationErrors | null {
  const senha = control.get('senha');
  const confirmarSenha = control.get('confirmarSenha');

  if (!senha || !confirmarSenha || !confirmarSenha.value) {
    return null;
  }

  return senha.value === confirmarSenha.value ? null : { senhasDiferentes: true };
}

@Component({
  selector: 'cb-login-cotista',
  templateUrl: './login-cotista.component.html',
  styleUrls: ['./login-cotista.component.css']
})
export class LoginCotistaComponent implements OnInit {
  cadastroForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.cadastroForm = this.fb.group({
      nomeCompleto: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required],
      confirmarSenha: ['', Validators.required]
    }, { validator: senhasConferem });
  }

  cadastrar() {
    this.cadastroForm.markAllAsTouched();
    if (this.cadastroForm.invalid) {
      return;
    }

    const formValue = this.cadastroForm.value;
    const payload = {
      name: formValue.nomeCompleto,
      email: formValue.email,
      password: formValue.senha,
      cedente_role_id: 2,
      all_funds: true
    };

    console.log('Objeto de cadastro enviado:', {
      ...payload,
      password: '[REDACTED]'
    });

    this.http.post<{ status?: boolean; message?: string }>(
      `${API}/employee/save`,
      payload
    ).subscribe({
      next: (response) => {
        const message = response && response.message
          ? response.message
          : response && response.status
            ? 'Cadastro realizado com sucesso.'
            : 'Não foi possível confirmar o cadastro.';
        this.snackBar.open(message, '', { duration: 5000 });
      },
      error: (error) => {
        console.error('Erro ao cadastrar usuário cotista:', error);
        const message = error && error.error && error.error.message
          ? error.error.message
          : 'Não foi possível cadastrar o usuário.';
        this.snackBar.open(message, '', { duration: 5000 });
      }
    });
  }

}
