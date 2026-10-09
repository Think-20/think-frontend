import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

import { CadastroCedentesComponent } from './cadastro-cedentes.component';

describe('CadastroCedentesComponent', () => {
  let component: CadastroCedentesComponent;
  let roleId: number;
  let patchSpy: jasmine.Spy;

  function moverCardJuridicoPara(statusDestino: string): { cedente: any; origem: any[]; destino: any[] } {
    const cedente = { id: 10, status: 'inconsistencia_c', inconsistencia_juridica: true };
    const origem = [cedente];
    const destino: any[] = [];

    component.drop({
      previousContainer: { data: origem },
      container: { id: statusDestino, data: destino },
      previousIndex: 0,
      currentIndex: 0
    } as any);

    return { cedente, origem, destino };
  }

  beforeEach(() => {
    roleId = 2;
    patchSpy = jasmine.createSpy('patch').and.returnValue(of({}));
    component = new CadastroCedentesComponent(
      new FormBuilder(),
      { post: jasmine.createSpy('post').and.returnValue(of({})), get: jasmine.createSpy('get').and.returnValue(of({})), patch: patchSpy } as any,
      { snapshot: { paramMap: { get: () => '1' } } } as any,
      { getCurrentNavigation: () => null } as any,
      { open: jasmine.createSpy('open') } as any,
      { setFundId: jasmine.createSpy('setFundId') } as any,
      { resetarDados: jasmine.createSpy('resetarDados'), setFundId: jasmine.createSpy('setFundId'), setCedenteId: jasmine.createSpy('setCedenteId') } as any,
      { currentUser: () => ({ cedente_role: { id: roleId } }) } as any
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

  it('should route SERPRO inconsistency to C and Vadu restrictions to R', () => {
    component.cedentes = {
      data: [
        {
          id: 1,
          nome: 'Empresa SERPRO',
          status: 'inconsistente',
          inconsistencias: [{ valor_serpro: 'Nome na base oficial' }]
        },
        {
          id: 2,
          nome: 'Empresa Vadu',
          status: 'inconsistente',
          inconsistencia_juridica: true
        },
        { id: 3, nome: 'Empresa R', status: 'inconsistencia_c' }
      ]
    };

    component.organizarCedentes();

    const statusColumns = component.kanbanColumns.map(column => column.status);
    expect(statusColumns.indexOf('inconsistente')).toBe(statusColumns.indexOf('em_avaliacao') + 1);
    expect(component.kanbanColumns.find(column => column.status === 'inconsistente').label).toBe('Inconsistência Cadastral');
    expect(component.kanbanColumns.find(column => column.status === 'inconsistencia_c').label).toBe('Inconsistência Jurídica');
    expect(component.inconsistenciaC.length).toBe(1);
    expect(component.inconsistenciaC[0].id).toBe(1);
    expect(component.inconsistente.length).toBe(2);
    expect(component.inconsistente[0].id).toBe(2);
    expect(component.inconsistente[1].id).toBe(3);
  });

  it('should send the allow decision when an approver moves a juridical inconsistency to approved', () => {
    moverCardJuridicoPara('aprovado');

    expect(patchSpy).toHaveBeenCalled();
    expect(patchSpy.calls.mostRecent().args[1].status).toBe('permitir_inconsistencia_juridica');
  });

  it('should send the reject decision when an admin moves a juridical inconsistency to cancelled', () => {
    roleId = 3;
    moverCardJuridicoPara('cancelado');

    expect(patchSpy).toHaveBeenCalled();
    expect(patchSpy.calls.mostRecent().args[1].status).toBe('rejeitar_inconsistencia_juridica');
  });

  it('should block juridical decisions for roles other than approver and admin', () => {
    roleId = 1;
    const movement = moverCardJuridicoPara('aprovado');

    expect(component.isCedenteDragDisabled(movement.cedente)).toBeTrue();
    expect(patchSpy).not.toHaveBeenCalled();
    expect(movement.origem).toEqual([movement.cedente]);
    expect(movement.destino).toEqual([]);
  });

  it('should block juridical cards from destinations other than approved or cancelled', () => {
    const movement = moverCardJuridicoPara('pendente');

    expect(patchSpy).not.toHaveBeenCalled();
    expect(movement.origem).toEqual([movement.cedente]);
    expect(movement.destino).toEqual([]);
  });
});
