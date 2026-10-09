import { CedenteDataService } from './cedente-data.service';

describe('CedenteDataService', () => {
  let service: CedenteDataService;

  beforeEach(() => {
    service = new CedenteDataService();
  });

  it('should preserve related parties and guarantors when loading cedente aliases', () => {
    const parteRelacionada = { nome: 'Parte relacionada' };
    const avalista = { nome: 'Avalista' };

    service.carregarCedenteExistente({
      pessoas_vinculadas: [parteRelacionada],
      guarantistas: [avalista]
    });

    expect(service.obterPartesRelacionadas()[0].nome).toBe('Parte relacionada');
    expect(service.obterAvalistas()[0].nome).toBe('Avalista');
  });

  it('should preserve null values in the final payload', () => {
    service.carregarCedenteExistente({ endereco: { complemento: 'Bloco A' } });
    service.atualizarEndereco({ complemento: null });

    expect(service.consolidarPayloadFinal().endereco.complemento).toBeNull();
    expect(service.consolidarPayloadFinal().complemento).toBeNull();
  });
});