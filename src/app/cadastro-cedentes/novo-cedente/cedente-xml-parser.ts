export interface DadosCedenteXml {
  nome?: string;
  documento?: string;
  email?: string;
  faturamento_anual?: number;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  estado?: string;
  telefone?: string;
  cidade?: string;
  partes_relacionadas?: DadosPessoaRelacionadaXml[];
  avalistas?: DadosPessoaRelacionadaXml[];
  contas_desembolso?: DadosContaDesembolsoXml[];
}

interface DadosPessoaRelacionadaXml {
  nome?: string;
  tipo_parte_relacionada?: number;
  nacionalidade?: string;
  email?: string;
  cpf?: string;
  telefone?: string;
  estado_civil?: string;
  regime_casamento?: string;
  profissao?: string;
  beneficiario_final?: boolean;
  assinante_operacao?: boolean;
  assinante_obrigatorio?: boolean;
  endereco?: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    bairro?: string;
    estado?: string;
    cidade?: string;
    complemento?: string;
    pais?: string;
  };
}

interface DadosContaDesembolsoXml {
  tipo_conta?: string;
  codigo_banco?: string;
  agencia?: string;
  numero_conta?: string;
  digito_conta?: string;
  descricao?: string;
}

export function parseCedenteXml(conteudo: string, nomeArquivo: string): DadosCedenteXml {
  const documentoXml = new DOMParser().parseFromString(conteudo, 'application/xml');
  if (documentoXml.getElementsByTagName('parsererror').length) {
    throw new Error(`O arquivo "${nomeArquivo}" contém um XML inválido.`);
  }

  const elementos = Array.from(documentoXml.getElementsByTagName('*'));
  const emissor = elementos.find((elemento) => elemento.localName.toLowerCase() === 'emit');
  const raiz = emissor || documentoXml.documentElement;
  const endereco = Array.from(raiz.getElementsByTagName('*'))
    .find((elemento) => elemento.localName.toLowerCase() === 'enderemit');
  const raizEndereco = endereco || raiz;

  const obterValor = (elemento: Element, nomes: string[]): string | undefined => {
    const nomesNormalizados = nomes.map((nome) => nome.toLowerCase());
    const encontrado = Array.from(elemento.getElementsByTagName('*')).find((filho) =>
      nomesNormalizados.indexOf(filho.localName.toLowerCase()) !== -1
    );
    const valor = encontrado && encontrado.textContent ? encontrado.textContent.trim() : '';
    return valor || undefined;
  };

  const obterValorEndereco = (nomes: string[]): string | undefined =>
    obterValor(raizEndereco, nomes) || (raizEndereco === raiz ? undefined : obterValor(raiz, nomes));
  const valorFaturamento = obterValor(raiz, ['faturamentoAnual', 'faturamento_anual', 'annualRevenue']);
  const faturamento = converterFaturamentoXml(valorFaturamento);
  const dados: DadosCedenteXml = {
    nome: obterValor(raiz, ['xNome', 'razaoSocial', 'razao_social', 'nome', 'companyName']),
    documento: obterValor(raiz, ['CNPJ', 'CPF', 'documento', 'cnpj']),
    email: obterValor(raiz, ['email', 'e-mail']),
    faturamento_anual: faturamento,
    cep: obterValorEndereco(['CEP', 'cep']),
    logradouro: obterValorEndereco(['xLgr', 'logradouro', 'rua', 'street']),
    numero: obterValorEndereco(['nro', 'numero', 'number']),
    complemento: obterValorEndereco(['xCpl', 'complemento']),
    bairro: obterValorEndereco(['xBairro', 'bairro']),
    estado: obterValorEndereco(['UF', 'estado', 'uf']),
    telefone: obterValor(raiz, ['fone', 'telefone', 'phone']),
    cidade: obterValorEndereco(['xMun', 'cidade', 'municipio'])
  };

  const partesRelacionadas = mapearPessoasRelacionadas(documentoXml.documentElement, obterValor)
    .concat(mapearRepresentantes(documentoXml.documentElement, obterValor));
  const avalistas = mapearAvalistas(documentoXml.documentElement, obterValor);
  const contasDesembolso = mapearContasDesembolso(documentoXml.documentElement, obterValor);

  if (partesRelacionadas.length) {
    dados.partes_relacionadas = partesRelacionadas;
  }
  if (avalistas.length) {
    dados.avalistas = avalistas;
  }
  if (contasDesembolso.length) {
    dados.contas_desembolso = contasDesembolso;
  }

  return dados;
}

export function combinarDadosCedenteXml(arquivos: DadosCedenteXml[]): DadosCedenteXml {
  const documentos = arquivos
    .map((dados) => (dados.documento || '').replace(/\D/g, ''))
    .filter((documento) => !!documento);

  if (documentos.some((documento) => documento !== documentos[0])) {
    throw new Error('Os arquivos XML selecionados pertencem a cedentes diferentes. Selecione arquivos do mesmo cedente.');
  }

  const dadosCombinados: DadosCedenteXml = {};
  arquivos.forEach((dadosArquivo) => {
    dadosCombinados.nome = dadosCombinados.nome || dadosArquivo.nome;
    dadosCombinados.documento = dadosCombinados.documento || dadosArquivo.documento;
    dadosCombinados.email = dadosCombinados.email || dadosArquivo.email;
    if (dadosCombinados.faturamento_anual === undefined) {
      dadosCombinados.faturamento_anual = dadosArquivo.faturamento_anual;
    }
    dadosCombinados.cep = dadosCombinados.cep || dadosArquivo.cep;
    dadosCombinados.logradouro = dadosCombinados.logradouro || dadosArquivo.logradouro;
    dadosCombinados.numero = dadosCombinados.numero || dadosArquivo.numero;
    dadosCombinados.complemento = dadosCombinados.complemento || dadosArquivo.complemento;
    dadosCombinados.bairro = dadosCombinados.bairro || dadosArquivo.bairro;
    dadosCombinados.estado = dadosCombinados.estado || dadosArquivo.estado;
    dadosCombinados.telefone = dadosCombinados.telefone || dadosArquivo.telefone;
    dadosCombinados.cidade = dadosCombinados.cidade || dadosArquivo.cidade;
  });

  const partesRelacionadas: DadosPessoaRelacionadaXml[] = [];
  const avalistas: DadosPessoaRelacionadaXml[] = [];
  const contasDesembolso: DadosContaDesembolsoXml[] = [];
  arquivos.forEach((dadosArquivo) => {
    partesRelacionadas.push(...(dadosArquivo.partes_relacionadas || []));
    avalistas.push(...(dadosArquivo.avalistas || []));
    contasDesembolso.push(...(dadosArquivo.contas_desembolso || []));
  });

  if (partesRelacionadas.length) dadosCombinados.partes_relacionadas = partesRelacionadas;
  if (avalistas.length) dadosCombinados.avalistas = avalistas;
  if (contasDesembolso.length) dadosCombinados.contas_desembolso = contasDesembolso;

  return dadosCombinados;
}

type XmlFieldReader = (element: Element, names: string[]) => string | undefined;

function mapearPessoasRelacionadas(root: Element, obterValor: XmlFieldReader): DadosPessoaRelacionadaXml[] {
  const registros = obterRegistrosXml(
    root,
    ['partes_relacionadas', 'partesRelacionadas', 'socios', 'shareholders'],
    ['parte_relacionada', 'parteRelacionada', 'parte', 'socio', 'shareholder', 'relatedParty', 'pessoa', 'item', 'registro'],
    ['nome', 'nomeParteRelacionada', 'xNome', 'cpf', 'cnpj', 'cnpjCpfParteRelacionada', 'documento', 'email', 'telefone', 'fone']
  );
  return registros.map((registro) => mapearPessoaRelacionada(registro, obterValor));
}

function mapearRepresentantes(root: Element, obterValor: XmlFieldReader): DadosPessoaRelacionadaXml[] {
  const registros = obterRegistrosXml(
    root,
    ['representantes'],
    ['representante', 'item', 'registro'],
    ['nomeRepresentante', 'cpfRepresentante', 'emailRepresentante']
  );
  return registros.map((registro) => {
    const representante = mapearPessoaRelacionada(registro, obterValor);
    const nome = obterValor(registro, ['nomeRepresentante']);
    const cpf = obterValor(registro, ['cpfRepresentante']);
    const email = obterValor(registro, ['emailRepresentante']);
    const assinaTermo = obterValor(registro, ['assinaTermoCessao']);

    if (nome !== undefined) representante.nome = nome;
    if (cpf !== undefined) representante.cpf = cpf;
    if (email !== undefined) representante.email = email;
    representante.tipo_parte_relacionada = 4;
    definirBooleano(representante, 'assinante_operacao', assinaTermo);
    return representante;
  });
}

function mapearAvalistas(root: Element, obterValor: XmlFieldReader): DadosPessoaRelacionadaXml[] {
  const registros = obterRegistrosXml(
    root,
    ['avalistas', 'guarantors', 'fiadores'],
    ['avalista', 'guarantor', 'fiador', 'pessoa', 'item', 'registro'],
    ['nome', 'nomeAvalista', 'xNome', 'cpf', 'cnpj', 'cnpjCpfAvalista', 'documento', 'email', 'telefone', 'fone']
  );
  return registros.map((registro) => mapearPessoaRelacionada(registro, obterValor));
}

function mapearPessoaRelacionada(registro: Element, obterValor: XmlFieldReader): DadosPessoaRelacionadaXml {
  const pessoa: DadosPessoaRelacionadaXml = {};
  const nome = obterValor(registro, ['nome', 'nomeCompleto', 'nomeParteRelacionada', 'nomeAvalista', 'xNome', 'name']);
  const tipo = obterValor(registro, ['tipo_parte_relacionada', 'tipoParteRelacionada', 'tipoRelacionamento', 'relacao', 'tipo']);
  const nacionalidade = obterValor(registro, ['nacionalidade', 'nationality']);
  const email = obterValor(registro, ['email', 'e-mail']);
  const cpf = obterValor(registro, ['cpf', 'cnpj', 'cnpjCpfParteRelacionada', 'cnpjCpfAvalista', 'cpfRepresentante', 'documento', 'taxId']);
  const telefone = obterValor(registro, ['telefone', 'fone', 'phone']);
  const estadoCivil = obterValor(registro, ['estado_civil', 'estadoCivil', 'maritalStatus']);
  const regimeCasamento = obterValor(registro, ['regime_casamento', 'regimeCasamento', 'marriageRegime']);
  const profissao = obterValor(registro, ['profissao', 'profissão', 'occupation']);

  if (nome !== undefined) pessoa.nome = nome;
  if (tipo !== undefined) {
    const tipoParteRelacionada = converterTipoParteRelacionada(tipo);
    if (tipoParteRelacionada !== undefined) {
      pessoa.tipo_parte_relacionada = tipoParteRelacionada;
    }
  }
  if (nacionalidade !== undefined) pessoa.nacionalidade = nacionalidade;
  if (email !== undefined) pessoa.email = email;
  if (cpf !== undefined) pessoa.cpf = cpf;
  if (telefone !== undefined) pessoa.telefone = telefone;
  if (estadoCivil !== undefined) pessoa.estado_civil = estadoCivil;
  if (regimeCasamento !== undefined) pessoa.regime_casamento = regimeCasamento;
  if (profissao !== undefined) pessoa.profissao = profissao;

  definirBooleano(pessoa, 'beneficiario_final', obterValor(registro, ['beneficiario_final', 'beneficiarioFinal', 'beneficialOwner']));
  definirBooleano(pessoa, 'assinante_operacao', obterValor(registro, ['assinante_operacao', 'assinanteOperacao', 'signsOperation']));
  definirBooleano(pessoa, 'assinante_obrigatorio', obterValor(registro, ['assinante_obrigatorio', 'assinanteObrigatorio', 'requiredSigner']));

  const enderecoNode = obterDescendentes(registro)
    .find((elemento) => normalizarNomeTag(elemento.localName) === 'endereco' ||
      normalizarNomeTag(elemento.localName) === 'address');
  const enderecoFonte = enderecoNode || registro;
  const endereco: DadosPessoaRelacionadaXml['endereco'] = {};
  const cep = obterValor(enderecoFonte, ['cep', 'postalCode']);
  const logradouro = obterValor(enderecoFonte, ['logradouro', 'rua', 'xLgr', 'street']);
  const numero = obterValor(enderecoFonte, ['numero', 'nro', 'number']);
  const bairro = obterValor(enderecoFonte, ['bairro', 'xBairro', 'district']);
  const estado = obterValor(enderecoFonte, ['estado', 'uf', 'UF', 'state']);
  const cidade = obterValor(enderecoFonte, ['cidade', 'municipio', 'xMun', 'city']);
  const complemento = obterValor(enderecoFonte, ['complemento', 'xCpl', 'addressComplement']);
  const pais = obterValor(enderecoFonte, ['pais', 'country']);

  if (cep !== undefined) endereco.cep = cep;
  if (logradouro !== undefined) endereco.logradouro = logradouro;
  if (numero !== undefined) endereco.numero = numero;
  if (bairro !== undefined) endereco.bairro = bairro;
  if (estado !== undefined) endereco.estado = estado;
  if (cidade !== undefined) endereco.cidade = cidade;
  if (complemento !== undefined) endereco.complemento = complemento;
  if (pais !== undefined) endereco.pais = pais;
  if (Object.keys(endereco).length) pessoa.endereco = endereco;

  return pessoa;
}

function mapearContasDesembolso(root: Element, obterValor: XmlFieldReader): DadosContaDesembolsoXml[] {
  const registros = obterRegistrosXml(
    root,
    ['contas_desembolso', 'contasDesembolso', 'contas_bancarias', 'contasBancarias', 'contasCorrente', 'bankAccounts'],
    ['conta_desembolso', 'contaDesembolso', 'conta_bancaria', 'contaBancaria', 'contaCorrente', 'conta', 'account', 'item', 'registro'],
    ['codigo_banco', 'codigoBanco', 'bankCode', 'banco', 'agencia', 'agency', 'numero_conta', 'numeroConta', 'accountNumber', 'contaCorrente']
  );

  return registros.map((registro) => {
    const conta: DadosContaDesembolsoXml = {};
    const tipo = obterValor(registro, ['tipo_conta', 'tipoConta', 'accountType', 'tipo']);
    const codigoBanco = obterValor(registro, ['codigo_banco', 'codigoBanco', 'bankCode', 'codBanco', 'banco']);
    const agencia = obterValor(registro, ['agencia', 'agency', 'branch']);
    const numero = obterValor(registro, ['numero_conta', 'numeroConta', 'accountNumber', 'numero', 'contaCorrente', 'conta']);
    const digito = obterValor(registro, ['digito_conta', 'digitoConta', 'accountDigit', 'digito']);
    const descricao = obterValor(registro, ['descricao', 'description']);
    const numeroConta = numero && !digito ? numero.match(/^(.+)-(\w)$/) : null;

    if (tipo !== undefined) conta.tipo_conta = converterTipoConta(tipo);
    if (codigoBanco !== undefined) conta.codigo_banco = codigoBanco;
    if (agencia !== undefined) conta.agencia = agencia;
    if (numeroConta) {
      conta.numero_conta = numeroConta[1];
      conta.digito_conta = numeroConta[2];
    } else {
      if (numero !== undefined) conta.numero_conta = numero;
      if (digito !== undefined) conta.digito_conta = digito;
    }
    if (descricao !== undefined) conta.descricao = descricao;
    return conta;
  });
}

function obterRegistrosXml(
  root: Element,
  containers: string[],
  records: string[],
  fieldNames: string[]
): Element[] {
  const containerNames = containers.map(normalizarNomeTag);
  const recordNames = records.map(normalizarNomeTag);
  const fields = fieldNames.map(normalizarNomeTag);
  const todos = obterDescendentes(root);
  const containersEncontrados = todos.filter((elemento) =>
    containerNames.indexOf(normalizarNomeTag(elemento.localName)) !== -1
  );

  if (containersEncontrados.length) {
    return containersEncontrados.reduce((resultado: Element[], container) => {
      const filhos = Array.from(container.children);
      const registrosFilhos = filhos.filter((filho) =>
        recordNames.indexOf(normalizarNomeTag(filho.localName)) !== -1
      );
      if (registrosFilhos.length) {
        return resultado.concat(registrosFilhos);
      }

      const temCampos = obterDescendentes(container).some((elemento) =>
        fields.indexOf(normalizarNomeTag(elemento.localName)) !== -1
      );
      return temCampos ? resultado.concat(container) : resultado;
    }, []);
  }

  return todos.filter((elemento) =>
    recordNames.indexOf(normalizarNomeTag(elemento.localName)) !== -1 &&
    obterDescendentes(elemento).some((filho) => fields.indexOf(normalizarNomeTag(filho.localName)) !== -1)
  );
}

function definirBooleano(
  pessoa: DadosPessoaRelacionadaXml,
  campo: 'beneficiario_final' | 'assinante_operacao' | 'assinante_obrigatorio',
  valor?: string
): void {
  if (valor === undefined) {
    return;
  }

  const normalizado = normalizarNomeTag(valor);
  if (['true', '1', 'sim', 'yes', 's'].indexOf(normalizado) !== -1) {
    pessoa[campo] = true;
  } else if (['false', '0', 'nao', 'no', 'n'].indexOf(normalizado) !== -1) {
    pessoa[campo] = false;
  }
}

function converterTipoParteRelacionada(valor: string): number | undefined {
  const tipo = normalizarNomeTag(valor);
  if (tipo === 'administrador') return 2;
  if (tipo === 'procurador') return 3;
  if (tipo === 'representantelegal') return 4;
  if (tipo === 'socio' || tipo === 'shareholder') return 1;
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 1 && numero <= 4 ? numero : undefined;
}

function converterTipoConta(valor: string): string {
  const tipo = normalizarNomeTag(valor);
  if (tipo.indexOf('poupanca') !== -1 || tipo.indexOf('savings') !== -1) {
    return 'conta_poupanca';
  }
  return 'conta_corrente';
}

function obterDescendentes(elemento: Element): Element[] {
  return Array.from(elemento.getElementsByTagName('*'));
}

function normalizarNomeTag(valor: string): string {
  return valor
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function converterFaturamentoXml(valor?: string): number | undefined {
  if (!valor) {
    return undefined;
  }

  const normalizado = valor.indexOf(',') === -1
    ? valor.replace(/[^\d.-]/g, '')
    : valor.replace(/[^\d,-]/g, '').replace(/\./g, '').replace(',', '.');
  if (!normalizado) {
    return undefined;
  }

  const faturamento = Number(normalizado);
  return isFinite(faturamento) ? faturamento : undefined;
}
