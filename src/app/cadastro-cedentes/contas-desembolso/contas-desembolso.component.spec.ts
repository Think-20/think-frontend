import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { ContasDesembolsoComponent } from './contas-desembolso.component';
import { CedenteDataService } from '../novo-cedente/cedente-data.service';

class CedenteDataServiceMock {
  contas: any[] = [];

  obterContasDesembolso() {
    return [...this.contas];
  }

  adicionarContaDesembolso(conta: any) {
    this.contas.push(conta);
    return this.contas.length - 1;
  }

  atualizarContaDesembolso(index: number, conta: any) {
    this.contas[index] = conta;
    return true;
  }
}

describe('ContasDesembolsoComponent', () => {
  let component: ContasDesembolsoComponent;
  let fixture: ComponentFixture<ContasDesembolsoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ ContasDesembolsoComponent ],
      providers: [
        { provide: CedenteDataService, useClass: CedenteDataServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContasDesembolsoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve hidratar os dados recebidos no formulario', () => {
    component.data = {
      tipo_conta: 'conta_poupanca',
      codigo_banco: '001',
      agencia: '1234',
      numero_conta: '98765',
      digito_conta: '0',
      descricao: 'Conta principal'
    };

    component.ngOnChanges({
      data: {
        currentValue: component.data,
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.formularioDesembolso.get('codigo_banco')!.value).toBe('001');
    expect(component.formularioDesembolso.get('descricao')!.value).toBe('Conta principal');
  });

  it('deve permitir um número de conta com mais de 7 dígitos', () => {
    const input = fixture.nativeElement.querySelector('input[formcontrolname="numero_conta"]');

    expect(input.maxLength).toBe(20);
  });
});
