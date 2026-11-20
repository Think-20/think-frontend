import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { LoginCotistaComponent } from './login-cotista.component';
import { API } from '../../app.api';

describe('LoginCotistaComponent', () => {
  let component: LoginCotistaComponent;
  let fixture: ComponentFixture<LoginCotistaComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginCotistaComponent ],
      imports: [ReactiveFormsModule, RouterModule.forRoot([]), HttpClientTestingModule],
      providers: [{
        provide: MatSnackBar,
        useValue: { open: jasmine.createSpy('open') }
      }],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    httpTestingController = TestBed.get(HttpTestingController);
    fixture = TestBed.createComponent(LoginCotistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
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

  it('should submit the employee payload without the password confirmation', () => {
    component.cadastroForm.setValue({
      nomeCompleto: 'João Pereira',
      email: 'joao.pereira@empresa.com',
      senha: 'SenhaForte1',
      confirmarSenha: 'SenhaForte1'
    });

    component.cadastrar();

    const request = httpTestingController.expectOne(`${API}/employee/save`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      name: 'João Pereira',
      email: 'joao.pereira@empresa.com',
      password: 'SenhaForte1',
      cedente_role_id: 2,
      all_funds: true
    });
    request.flush({ status: true, message: 'Cadastro realizado' });
  });
});
