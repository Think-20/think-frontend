import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

import { CadastroCedentesComponent } from './cadastro-cedentes.component';

describe('CadastroCedentesComponent', () => {
  let component: CadastroCedentesComponent;

  beforeEach(() => {
    component = new CadastroCedentesComponent(
      new FormBuilder(),
      { post: jasmine.createSpy('post').and.returnValue(of({})), get: jasmine.createSpy('get').and.returnValue(of({})) } as any,
      { snapshot: { paramMap: { get: () => '1' } } } as any,
      { getCurrentNavigation: () => null } as any,
      { setFundId: jasmine.createSpy('setFundId') } as any,
      { resetarDados: jasmine.createSpy('resetarDados'), setFundId: jasmine.createSpy('setFundId'), setCedenteId: jasmine.createSpy('setCedenteId') } as any
    );

    component.formBusca = new FormBuilder().group({
      pesquisa: [''],
      consultoria: [''],
      responsavel: ['']
    });
    component.formFiltroSla = new FormBuilder().group({
      SLAVencido: [false]
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should keep only the matching cedente in kanban columns when a filter is active', () => {
    component.cedentes = {
      data: [
        { id: 1, nome: 'Empresa Alpha', status: 'pendente', documento: '11111111111', consultoria: 'Consultoria A', responsavel_nome: 'Maria' },
        { id: 2, nome: 'Empresa Beta', status: 'aprovado', documento: '22222222222', consultoria: 'Consultoria B', responsavel_nome: 'João' }
      ]
    };

    component.formBusca.patchValue({ pesquisa: 'alpha' });
    component.organizarCedentes();

    expect(component.pendentes.length).toBe(1);
    expect(component.aprovados.length).toBe(0);
    expect(component.totalCadastrosFiltrados).toBe(1);
    expect(component.kanbanColumns.some(column => column.status === 'pendente' && column.items.length === 1)).toBeTrue();
  });
});
