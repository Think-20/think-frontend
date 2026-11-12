import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { LoginCotistaComponent } from './login-cotista.component';

describe('LoginCotistaComponent', () => {
  let component: LoginCotistaComponent;
  let fixture: ComponentFixture<LoginCotistaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginCotistaComponent ],
      imports: [ReactiveFormsModule, RouterModule.forRoot([])],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginCotistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate email and require matching passwords', () => {
    component.cadastroForm.setValue({
      nomeCompleto: 'Nome Cotista',
      email: 'email-invalido',
      senha: 'senha',
      confirmarSenha: 'outra-senha'
    });

    expect(component.cadastroForm.invalid).toBeTruthy();

    component.cadastroForm.patchValue({
      email: 'cotista@example.com',
      confirmarSenha: 'senha'
    });

    expect(component.cadastroForm.valid).toBeTruthy();
  });
});
