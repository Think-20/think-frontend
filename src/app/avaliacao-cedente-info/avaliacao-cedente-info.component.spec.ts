import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

import { AvaliacaoCedenteInfoComponent } from './avaliacao-cedente-info.component';

describe('AvaliacaoCedenteInfoComponent', () => {
  let component: AvaliacaoCedenteInfoComponent;
  let patchSpy: jasmine.Spy;

  beforeEach(() => {
    patchSpy = jasmine.createSpy('patch').and.returnValue(of({}));
  });

  function criarComponente(cedente: any): AvaliacaoCedenteInfoComponent {
    component = new AvaliacaoCedenteInfoComponent(
      new FormBuilder(),
      { patch: patchSpy } as any,
      { snapshot: { paramMap: { get: () => '1' }, parent: null } } as any,
      { currentFundId: 1 } as any,
      { currentUser: () => ({ cedente_role: { id: 2 } }) } as any,
      { open: jasmine.createSpy('open') } as any
    );
    component.cedente = cedente;
    component.ngOnInit();
    expect(component).toBeTruthy();
    return component;
  }

  it('should send the juridical approval payload without approval fields', () => {
    const avaliacao = criarComponente({ id: 42, fund_id: 1, inconsistencia_juridica: true });

    avaliacao.enviarAprovacao();

    expect(patchSpy.calls.mostRecent().args[1]).toEqual({
      fund_id: 1,
      id: 42,
      resultado: 'permitir_inconsistencia_juridica',
      observacao: 'Restrição Vadu analisada e liberada pelo avalista'
    });
  });

  it('should send the juridical rejection payload without requiring a form observation', () => {
    const avaliacao = criarComponente({ id: 42, fund_id: 1, inconsistencia_juridica: true });

    avaliacao.enviarRejeicao();

    expect(patchSpy.calls.mostRecent().args[1]).toEqual({
      fund_id: 1,
      id: 42,
      resultado: 'rejeitar_inconsistencia_juridica',
      observacao: 'Restrição Vadu incompatível com a política do fundo'
    });
  });

  it('should keep the regular approval payload for other cedentes', () => {
    const avaliacao = criarComponente({ id: 42, fund_id: 1 });
    avaliacao.formAprovacao.patchValue({ limiteAprovado: '1000', prazoAtualizacao: '12' });

    avaliacao.enviarAprovacao();

    expect(patchSpy.calls.mostRecent().args[1].resultado).toBe('aprovado');
    expect(patchSpy.calls.mostRecent().args[1].prazo_atualizacao_cadastral).toBe(12);
  });
});
