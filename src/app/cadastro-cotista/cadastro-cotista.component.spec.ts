import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';

import { CadastroCotistaComponent } from './cadastro-cotista.component';

describe('CadastroCotistaComponent', () => {
  let component: CadastroCotistaComponent;
  let fixture: ComponentFixture<CadastroCotistaComponent>;
  let httpTestingController: HttpTestingController;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async(() => {
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    TestBed.configureTestingModule({
      declarations: [ CadastroCotistaComponent ],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: MatSnackBar, useValue: snackBar }],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    httpTestingController = TestBed.get(HttpTestingController);
    fixture = TestBed.createComponent(CadastroCotistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the cadastral form after receiving a valid identification', () => {
    component.iniciarCadastro();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('cb-identificacao-inicial')).not.toBeNull();

    component.receberIdentificacao({
      tipoInvestidor: 'PESSOA_FISICA',
      documento: '52998224725'
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('cb-identificacao-inicial')).toBeNull();
    expect(fixture.nativeElement.querySelector('cb-ficha-cadastral')).not.toBeNull();
  });

  it('should hide, but preserve, the cadastral form while showing suitability', () => {
    component.receberIdentificacao({
      tipoInvestidor: 'PESSOA_FISICA',
      documento: '52998224725'
    });
    fixture.detectChanges();
    const cadastralForm = fixture.nativeElement.querySelector('cb-ficha-cadastral');

    component.continuarParaSuitability();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('cb-ficha-cadastral')).toBe(cadastralForm);
    expect(cadastralForm.parentElement.hidden).toBe(true);
    expect(fixture.nativeElement.querySelector('cb-questionario-suitability')).not.toBeNull();

    component.voltarParaFichaCadastral();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('cb-ficha-cadastral')).toBe(cadastralForm);
    expect(cadastralForm.parentElement.hidden).toBe(false);
    expect(fixture.nativeElement.querySelector('cb-questionario-suitability')).toBeNull();
  });

  it('should post the complete payload and open the cotista kanban after a successful response', () => {
    const router = TestBed.get(Router);
    const navigateSpy = spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));
    component.cadastroPayload = {
      nome_completo: 'Cotista Teste',
      email: 'cotista@example.com',
      documento: '52998224725'
    };
    component.receberSuitability({ 1: 'a' });

    const request = httpTestingController.expectOne(`${environment.api}/cotista/save`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      nome_completo: 'Cotista Teste',
      email: 'cotista@example.com',
      documento: '52998224725',
      suitability: {
        perfil: null,
        respostas: [{ pergunta: 1, opcao: 1 }]
      }
    });
    expect(navigateSpy).not.toHaveBeenCalled();

    const cotistaRetornado = {
      id: 25,
      nome_completo: 'Cotista Teste',
      sexo: 'Feminino',
      documento: '52998224725',
      suitability: {
        perfil: 'Moderado',
        respostas: [{ pergunta: 1, opcao: 1 }]
      },
      status: 'pendente'
    };
    request.flush({ error: 'false', message: 'Cadastro salvo', data: cotistaRetornado });

    expect(navigateSpy).toHaveBeenCalledWith('/kanban-cotista', {
      state: { cotistas: [cotistaRetornado] }
    });
    expect(component.salvandoPerfil).toBe(false);
  });
});
