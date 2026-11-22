import { combinarDadosCedenteXml, parseCedenteXml } from './cedente-xml-parser';

describe('parseCedenteXml', () => {
  it('uses issuer data from a namespaced NF-e XML', () => {
    const xml = `
      <nfeProc xmlns="http://www.portalfiscal.inf.br/nfe">
        <NFe>
          <infNFe>
            <emit>
              <CNPJ>12345678000195</CNPJ>
              <xNome>Empresa Emissora</xNome>
              <enderEmit>
                <xLgr>Rua Central</xLgr>
                <nro>42</nro>
                <xBairro>Centro</xBairro>
                <xMun>Curitiba</xMun>
                <UF>PR</UF>
                <CEP>80000000</CEP>
                <fone>4133334444</fone>
              </enderEmit>
              <email>contato@empresa.com.br</email>
            </emit>
            <dest>
              <CNPJ>98765432000110</CNPJ>
              <xNome>Empresa Destinatária</xNome>
            </dest>
          </infNFe>
        </NFe>
      </nfeProc>`;

    expect(parseCedenteXml(xml, 'nota.xml')).toEqual({
      nome: 'Empresa Emissora',
      documento: '12345678000195',
      email: 'contato@empresa.com.br',
      faturamento_anual: undefined,
      cep: '80000000',
      logradouro: 'Rua Central',
      numero: '42',
      complemento: undefined,
      bairro: 'Centro',
      estado: 'PR',
      telefone: '4133334444',
      cidade: 'Curitiba'
    });
  });

  it('reads supported company fields and localized annual revenue aliases', () => {
    const xml = `
      <cedente>
        <razao_social>Empresa Exemplo</razao_social>
        <documento>12345678000195</documento>
        <faturamento_anual>1.234.567,89</faturamento_anual>
      </cedente>`;

    expect(parseCedenteXml(xml, 'cedente.xml')).toEqual({
      nome: 'Empresa Exemplo',
      documento: '12345678000195',
      email: undefined,
      faturamento_anual: 1234567.89,
      cep: undefined,
      logradouro: undefined,
      numero: undefined,
      complemento: undefined,
      bairro: undefined,
      estado: undefined,
      telefone: undefined,
      cidade: undefined
    });
  });

  it('maps related parties, guarantors, and disbursement accounts', () => {
    const xml = `
      <cedente>
        <nome>Empresa Exemplo</nome>
        <partes_relacionadas>
          <parte_relacionada>
            <nome>Joana Silva</nome>
            <tipo_parte_relacionada>Administrador</tipo_parte_relacionada>
            <cpf>12345678901</cpf>
            <telefone>11999990000</telefone>
            <endereco>
              <cep>01001000</cep>
              <logradouro>Rua A</logradouro>
              <numero>10</numero>
              <cidade>São Paulo</cidade>
              <estado>SP</estado>
            </endereco>
            <beneficiario_final>sim</beneficiario_final>
          </parte_relacionada>
        </partes_relacionadas>
        <avalistas>
          <avalista>
            <nome>Maria Souza</nome>
            <cpf>98765432100</cpf>
            <email>maria@example.com</email>
          </avalista>
        </avalistas>
        <contas_desembolso>
          <conta_desembolso>
            <tipo_conta>Poupança</tipo_conta>
            <codigo_banco>001</codigo_banco>
            <agencia>1234</agencia>
            <numero_conta>123456-7</numero_conta>
            <descricao>Conta principal</descricao>
          </conta_desembolso>
        </contas_desembolso>
      </cedente>`;

    const dados = parseCedenteXml(xml, 'cedente.xml');
    expect(dados.partes_relacionadas).toEqual([{
      nome: 'Joana Silva',
      tipo_parte_relacionada: 2,
      cpf: '12345678901',
      telefone: '11999990000',
      beneficiario_final: true,
      endereco: {
        cep: '01001000',
        logradouro: 'Rua A',
        numero: '10',
        estado: 'SP',
        cidade: 'São Paulo'
      }
    }]);
    expect(dados.avalistas).toEqual([{
      nome: 'Maria Souza',
      cpf: '98765432100',
      email: 'maria@example.com'
    }]);
    expect(dados.contas_desembolso).toEqual([{
      tipo_conta: 'conta_poupanca',
      codigo_banco: '001',
      agencia: '1234',
      numero_conta: '123456',
      digito_conta: '7',
      descricao: 'Conta principal'
    }]);
  });

  it('maps the cedente XML field names used in the uploaded sample', () => {
    const xml = `
      <cadastroCedente>
        <cedentes>
          <cedente>
            <nome>Empresa Exemplo</nome>
            <contasCorrente>
              <contaCorrente>
                <banco>001</banco>
                <agencia>1234</agencia>
                <contaCorrente>123456-7</contaCorrente>
                <descricao>Conta principal</descricao>
              </contaCorrente>
            </contasCorrente>
            <representantes>
              <representante>
                <nomeRepresentante>Ana Representante</nomeRepresentante>
                <cpfRepresentante>12345678901</cpfRepresentante>
                <emailRepresentante>ana@example.com</emailRepresentante>
                <assinaTermoCessao>sim</assinaTermoCessao>
              </representante>
            </representantes>
            <avalistas>
              <avalista>
                <nomeAvalista>Bruno Avalista</nomeAvalista>
                <cnpjCpfAvalista>98765432100</cnpjCpfAvalista>
                <email>bruno@example.com</email>
              </avalista>
            </avalistas>
            <partesRelacionadas>
              <parteRelacionada>
                <nomeParteRelacionada>Carla Sócia</nomeParteRelacionada>
                <cnpjCpfParteRelacionada>11122233344</cnpjCpfParteRelacionada>
              </parteRelacionada>
            </partesRelacionadas>
          </cedente>
        </cedentes>
      </cadastroCedente>`;

    const dados = parseCedenteXml(xml, 'cedente.xml');
    expect(dados.partes_relacionadas).toEqual([
      { nome: 'Carla Sócia', cpf: '11122233344' },
      {
        nome: 'Ana Representante',
        cpf: '12345678901',
        email: 'ana@example.com',
        tipo_parte_relacionada: 4,
        assinante_operacao: true
      }
    ]);
    expect(dados.avalistas).toEqual([{
      nome: 'Bruno Avalista',
      cpf: '98765432100',
      email: 'bruno@example.com'
    }]);
    expect(dados.contas_desembolso).toEqual([{
      codigo_banco: '001',
      agencia: '1234',
      numero_conta: '123456',
      digito_conta: '7',
      descricao: 'Conta principal'
    }]);
  });

  it('preserves related collections when combining parsed XML data', () => {
    const xml = `
      <cadastroCedente>
        <cedentes>
          <cedente>
            <partesRelacionadas>
              <parteRelacionada>
                <nomeParteRelacionada>Carla Sócia</nomeParteRelacionada>
                <cnpjCpfParteRelacionada>11122233344</cnpjCpfParteRelacionada>
              </parteRelacionada>
            </partesRelacionadas>
            <avalistas>
              <avalista>
                <nomeAvalista>Bruno Avalista</nomeAvalista>
                <cnpjCpfAvalista>98765432100</cnpjCpfAvalista>
              </avalista>
            </avalistas>
            <contasCorrente>
              <contaCorrente>
                <banco>001</banco>
                <agencia>1234</agencia>
                <contaCorrente>123456-7</contaCorrente>
              </contaCorrente>
            </contasCorrente>
          </cedente>
        </cedentes>
      </cadastroCedente>`;

    const dados = combinarDadosCedenteXml([parseCedenteXml(xml, 'cedente.xml')]);
    expect(dados.partes_relacionadas.length).toBe(1);
    expect(dados.avalistas.length).toBe(1);
    expect(dados.contas_desembolso.length).toBe(1);
  });

  it('rejects malformed XML with the file name in the error', () => {
    expect(() => parseCedenteXml('<cedente>', 'invalido.xml'))
      .toThrowError('O arquivo "invalido.xml" contém um XML inválido.');
  });
});
