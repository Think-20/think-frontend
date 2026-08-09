import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { PartesRelacionadasComponent } from './partes-relacionadas.component';
import { CedenteDataService } from '../novo-cedente/cedente-data.service';

class CedenteDataServiceMock {
  partes: any[] = [];

  obterPartesRelacionadas() {
    return [...this.partes];
  }

  adicionarParteRelacionada(parte: any) {
    this.partes.push(parte);
    return this.partes.length - 1;
  }

  atualizarParteRelacionada(index: number, parte: any) {
    this.partes[index] = parte;
    return true;
  }
}

describe('PartesRelacionadasComponent', () => {
  let component: PartesRelacionadasComponent;
  let fixture: ComponentFixture<PartesRelacionadasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      declarations: [ PartesRelacionadasComponent ],
      providers: [
        { provide: CedenteDataService, useClass: CedenteDataServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartesRelacionadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve hidratar os dados recebidos no formulario', () => {
    component.data = {
      nome: 'Carlos',
      tipo_parte_relacionada: 2,
      nacionalidade: 'Brasileira',
      email: 'carlos@teste.com',
      cpf: '12345678901',
      telefone: '11999999999',
      estado_civil: 'Casado',
      profissao: 'Diretor',
      beneficiario_final: true,
      endereco: {
        cep: '01001000',
        logradouro: 'Rua B',
        numero: '20',
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

    expect(component.formParteRelacionadas.get('nome')!.value).toBe('Carlos');
    expect(component.formEndereco.get('logradouro')!.value).toBe('Rua B');
    expect(component.formCheck.get('beneficiario_final')!.value).toBe(true);
  });
});
