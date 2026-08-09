import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { AvalistaComponent } from './avalista.component';
import { CedenteDataService } from '../novo-cedente/cedente-data.service';

class CedenteDataServiceMock {
  avalistas: any[] = [];

  obterAvalistas() {
    return [...this.avalistas];
  }

  adicionarAvalista(avalista: any) {
    this.avalistas.push(avalista);
    return this.avalistas.length - 1;
  }

  atualizarAvalista(index: number, avalista: any) {
    this.avalistas[index] = avalista;
    return true;
  }
}

describe('AvalistaComponent', () => {
  let component: AvalistaComponent;
  let fixture: ComponentFixture<AvalistaComponent>;
  let cedenteDataService: CedenteDataServiceMock;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      declarations: [ AvalistaComponent ],
      providers: [
        { provide: CedenteDataService, useClass: CedenteDataServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvalistaComponent);
    component = fixture.componentInstance;
    cedenteDataService = TestBed.get(CedenteDataService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve hidratar os dados recebidos no formulario', () => {
    component.data = {
      nome: 'Maria',
      email: 'maria@teste.com',
      cpf: '12345678901',
      telefone: '11999999999',
      nacionalidade: 'Brasileira',
      estado_civil: 'Solteira',
      profissao: 'Analista',
      beneficiario_final: true,
      endereco: {
        cep: '01001000',
        logradouro: 'Rua A',
        numero: '10',
        bairro: 'Centro',
        cidade: 'Sao Paulo',
        estado: 'SP',
        pais: 'Brasil'
      }
    };

    component.ngOnChanges({
      data: {
        currentValue: component.data,
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.formDadosCadastraisAvalista.get('nome')!.value).toBe('Maria');
    expect(component.formEnderecoAvalista.get('logradouro')!.value).toBe('Rua A');
    expect(component.formCheck.get('beneficiario_final')!.value).toBe(true);
  });

  it('deve adicionar avalista novo ao salvar automaticamente quando indice nao existir', () => {
    component.formDadosCadastraisAvalista.patchValue({ nome: 'Joao', cpf: '12345678901' });
    component.salvarAutomatico();

    expect(cedenteDataService.avalistas.length).toBe(1);
    expect(cedenteDataService.avalistas[0].nome).toBe('Joao');
  });
});
