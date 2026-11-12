import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

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

  constructor(private fb: FormBuilder) { }

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
  }

}
