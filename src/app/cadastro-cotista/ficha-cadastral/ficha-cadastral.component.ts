import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IdentificacaoCotista, TipoInvestidor } from '../identificacao-inicial/identificacao-inicial.component';

interface FichaCampo {
  rotulo: string;
  tipo?: string;
  placeholder?: string;
  colunas?: number;
  opcoes?: string[];
  mascara?: string;
  valor?: string;
  valorInicial?: boolean;
  somenteLeitura?: boolean;
}

interface FichaGrupo {
  titulo: string;
  campos: FichaCampo[];
}

interface Ficha {
  titulo: string;
  aberta: boolean;
  grupos: FichaGrupo[];
}

interface Referencia {
  nomeCompleto: string;
  nacionalidade: string;
  telefone: string;
}

interface ContaBancaria {
  banco: string;
  agencia: string;
  numeroConta: string;
  tipoConta: string;
}

interface ItemPatrimonial {
  categoria: string;
  descricao: string;
  valorAtual: string;
}

interface ParticipacaoSocietaria {
  razaoSocial: string;
  cnpj: string;
  nacionalidade: string;
  percentualCapital: string;
  instituicaoFinanceira: string;
  giinNumber: string;
}

interface PropositoNegocio {
  rotulo: string;
  valor: string;
}

type TipoDocumentoAnexo = 'identificacao' | 'endereco';
type ArquivosAnexos = { [tipo in TipoDocumentoAnexo]: File | null };

@Component({
  selector: 'cb-ficha-cadastral',
  templateUrl: './ficha-cadastral.component.html',
  styleUrls: ['./ficha-cadastral.component.css']
})
export class FichaCadastralComponent implements OnChanges {
  @Input() identificacao: IdentificacaoCotista | null = null;
  @Input() cotista: { [key: string]: any } | null = null;
  @Output() continuarSuitability = new EventEmitter<{ [key: string]: any }>();
  @Output() salvarRascunho = new EventEmitter<{ [key: string]: any }>();
  tipoInvestidorSelecionado: TipoInvestidor = 'PESSOA_FISICA';

  constructor(private http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.cotista && this.cotista) {
      this.preencherCotista(this.cotista);
    }
  }

  readonly cpfMask = '999.999.999-99';
  readonly cnpjMask = '99.999.999/9999-99';
  readonly telefoneMask = '(99) 99999-9999';
  readonly cepMask = '99999-999';

  referencias: Referencia[] = [
    { nomeCompleto: '', nacionalidade: '', telefone: '' },
    { nomeCompleto: '', nacionalidade: '', telefone: '' }
  ];

  contasBancarias: ContaBancaria[] = [
    { banco: '', agencia: '', numeroConta: '', tipoConta: '' }
  ];

  itensPatrimoniais: ItemPatrimonial[] = [
    { categoria: '', descricao: '', valorAtual: '' }
  ];

  participacoesSocietarias: ParticipacaoSocietaria[] = [
    {
      razaoSocial: '',
      cnpj: '',
      nacionalidade: '',
      percentualCapital: '',
      instituicaoFinanceira: '',
      giinNumber: ''
    }
  ];

  readonly propositosDisponiveis: PropositoNegocio[] = [
    { rotulo: 'Câmbio', valor: 'CAMBIO' },
    { rotulo: 'Aplicações/Investimentos', valor: 'APLICACOES_INVESTIMENTOS' },
    { rotulo: 'Intermediação de operações (corretagem)', valor: 'INTERMEDIACAO_OPERACOES' },
    { rotulo: 'Operações de crédito', valor: 'OPERACOES_CREDITO' },
    { rotulo: 'Operações acessórias (serviços, garantias)', valor: 'OPERACOES_ACESSORIAS' },
    { rotulo: 'Outros', valor: 'OUTROS' }
  ];

  propositosSelecionados: string[] = [];
  outroProposito = '';
  pessoaPoliticamenteExposta = '';
  relacionamentoComPpe = '';
  cargoPpe = '';
  dadosPpeRelacionado = '';

  get documentoFormatado(): string {
    const documento = this.identificacao ? this.identificacao.documento : '';

    if (documento.length === 11) {
      return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    if (documento.length === 14) {
      return documento.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    return documento;
  }

  selecionarTipoInvestidor(tipo: TipoInvestidor): void {
    this.tipoInvestidorSelecionado = tipo;
  }

  private preencherCotista(cotista: { [key: string]: any }): void {
    this.tipoInvestidorSelecionado = String(cotista.tipo_pessoa || '').toLowerCase() === 'juridica'
      ? 'PESSOA_JURIDICA'
      : 'PESSOA_FISICA';
    const arquivosSalvos = Array.isArray(cotista.arquivos) && cotista.arquivos.length
      ? cotista.arquivos
      : Array.isArray(cotista.cotista_files) ? cotista.cotista_files : [];
    this.arquivosPersistidos = {
      identificacao: arquivosSalvos.find((arquivo: any) => Number(arquivo.document_type) === 1) || null,
      endereco: arquivosSalvos.find((arquivo: any) => Number(arquivo.document_type) === 2) || null
    };

    this.preencherCampos(0, [
      cotista.nome_completo,
      cotista.documento,
      cotista.tin,
      cotista.nome_mae,
      cotista.sexo,
      cotista.local_nascimento,
      cotista.data_nascimento,
      cotista.estado_civil,
      cotista.regime_casamento,
      cotista.nome_conjuge,
      cotista.cpf_conjuge,
      cotista.numero_dependentes,
      cotista.nacionalidade,
      this.valorSimNao(cotista.possui_outra_nacionalidade),
      cotista.outras_nacionalidades,
      cotista.tipo_documento,
      cotista.numero_documento,
      cotista.data_emissao_documento,
      cotista.orgao_emissor,
      cotista.uf_pais_emissor
    ]);

    const residencial = cotista.endereco_residencial || {};
    this.preencherCampos(1, [
      residencial.cep,
      residencial.logradouro,
      residencial.numero,
      residencial.complemento,
      cotista.tempo_residencia,
      residencial.bairro,
      residencial.cidade,
      residencial.estado,
      cotista.endereco_correspondencia,
      this.valorSimNao(cotista.autorizacao_residencia_outros_paises),
      cotista.paises_residencia,
      this.valorSimNao(cotista.possui_outro_domicilio_fiscal),
      cotista.outros_domicilios_fiscais,
      cotista.telefone,
      cotista.celular,
      cotista.email,
      this.valorSimNao(cotista.us_person)
    ]);

    const comercial = cotista.endereco_comercial || {};
    this.preencherCampos(2, [
      cotista.natureza_ocupacao,
      cotista.instituicao_trabalho,
      cotista.cnpj_empregador,
      comercial.cep,
      comercial.logradouro,
      comercial.numero,
      comercial.complemento,
      comercial.bairro,
      comercial.cidade,
      comercial.estado,
      cotista.telefone_comercial,
      cotista.profissao,
      cotista.cargo,
      cotista.email_comercial
    ]);

    if (Array.isArray(cotista.referencias) && cotista.referencias.length) {
      this.referencias = cotista.referencias.map((referencia: any) => ({
        nomeCompleto: this.valorFormulario(referencia.nome_completo),
        nacionalidade: this.valorFormulario(referencia.nacionalidade),
        telefone: this.valorFormulario(referencia.telefone)
      }));
    }
    if (Array.isArray(cotista.contas) && cotista.contas.length) {
      this.contasBancarias = cotista.contas.map((conta: any) => ({
        banco: this.valorFormulario(conta.banco),
        agencia: this.valorFormulario(conta.agencia),
        numeroConta: this.valorFormulario(conta.numero_conta),
        tipoConta: this.valorFormulario(conta.tipo_conta)
      }));
    }
    if (Array.isArray(cotista.itens_patrimoniais) && cotista.itens_patrimoniais.length) {
      this.itensPatrimoniais = cotista.itens_patrimoniais.map((item: any) => ({
        categoria: this.valorFormulario(item.categoria),
        descricao: this.valorFormulario(item.descricao),
        valorAtual: this.valorFormulario(item.valor_atual)
      }));
    }

    this.preencherCampos(6, [
      cotista.codigo_operacional_cvm,
      cotista.rde_cademp,
      cotista.pais_origem,
      cotista.representante_brasil,
      cotista.representante_coresponsavel,
      cotista.custodiante,
      cotista.administrador_carteira,
      String(cotista.situacao || '').toLowerCase() === 'isento'
        ? 'Isento'
        : cotista.situacao ? 'Não isento' : ''
    ]);

    if (Array.isArray(cotista.participacoes) && cotista.participacoes.length) {
      this.participacoesSocietarias = cotista.participacoes.map((participacao: any) => ({
        razaoSocial: this.valorFormulario(participacao.razao_social),
        cnpj: this.valorFormulario(participacao.cnpj),
        nacionalidade: this.valorFormulario(participacao.nacionalidade),
        percentualCapital: this.valorFormulario(participacao.percentual_capital),
        instituicaoFinanceira: this.valorSimNao(participacao.instituicao_financeira),
        giinNumber: this.valorFormulario(participacao.giin)
      }));
    }

    this.propositosSelecionados = [
      cotista.proposito_cambio ? 'CAMBIO' : null,
      cotista.proposito_aplicacoes ? 'APLICACOES_INVESTIMENTOS' : null,
      cotista.proposito_intermediacao ? 'INTERMEDIACAO_OPERACOES' : null,
      cotista.proposito_credito ? 'OPERACOES_CREDITO' : null,
      cotista.proposito_acessorias ? 'OPERACOES_ACESSORIAS' : null,
      cotista.proposito_outros ? 'OUTROS' : null
    ].filter((proposito: string | null) => proposito !== null);
    this.outroProposito = this.valorFormulario(cotista.proposito_outros);

    this.pessoaPoliticamenteExposta = this.valorSimNao(cotista.e_ppe);
    this.cargoPpe = this.valorFormulario(cotista.ppe_cargo);
    this.relacionamentoComPpe = this.valorSimNao(cotista.relacionamento_ppe);

    const operador = cotista.operador || {};
    this.procuradorOperaPorContaPropria = this.valorSimNao(operador.opera_conta_propria);
    this.procuradorAutorizaOrdens = this.valorSimNao(operador.autoriza_ordens_procurador);
    this.procuradorPpe = this.valorSimNao(operador.e_ppe);
    this.procuradorRelacionamentoPpe = this.valorSimNao(operador.relacionamento_ppe);
    this.cargoProcuradorPpe = this.valorFormulario(operador.ppe_cargo);
    this.dadosProcuradorRelacionado = this.valorFormulario(operador.descricao_poderes);
    this.cpfProcurador = this.valorFormulario(operador.cpf);
    const enderecoOperador = operador.endereco || {};
    this.cepProcurador = this.valorFormulario(enderecoOperador.cep);
    this.enderecoProcurador = this.valorFormulario(enderecoOperador.logradouro);
    this.numeroProcurador = this.valorFormulario(enderecoOperador.numero);
    this.complementoProcurador = this.valorFormulario(enderecoOperador.complemento);
  }

  private preencherCampos(fichaIndex: number, valores: any[]): void {
    valores.forEach((valor, campoIndex) => {
      const campo = this.fichas[fichaIndex].grupos[0].campos[campoIndex];
      if (campo) {
        campo.valor = this.valorFormulario(valor);
      }
    });
  }

  private valorFormulario(valor: any): string {
    if (valor == null) {
      return '';
    }
    const texto = String(valor);
    return /^\d{4}-\d{2}-\d{2}/.test(texto) ? texto.slice(0, 10) : texto;
  }

  private valorSimNao(valor: any): string {
    if (valor == null || valor === '') {
      return '';
    }
    return valor === true || String(valor).toLowerCase() === 'sim' || String(valor) === '1'
      ? 'Sim'
      : 'Não';
  }

  arquivos: ArquivosAnexos = {
    identificacao: null,
    endereco: null
  };
  arquivosPersistidos: { [tipo in TipoDocumentoAnexo]: any | null } = {
    identificacao: null,
    endereco: null
  };

  fichas: Ficha[] = [
    {
      titulo: '1. Identificação do Cliente',
      aberta: false,
      grupos: [{
        titulo: 'Identificação do cliente',
        campos: [
          { rotulo: 'Nome completo (sem abreviações)', colunas: 2 },
          {
            rotulo: 'CPF',
            colunas: 1,
            valorInicial: true,
            somenteLeitura: true
          },
          { rotulo: 'TIN (estrangeiro, se aplicável)', colunas: 1 },
          { rotulo: 'Nome da mãe', colunas: 2 },
          { rotulo: 'Sexo', tipo: 'select', opcoes: ['Feminino', 'Masculino', 'Outro'], colunas: 1 },
          { rotulo: 'Local de nascimento (cidade/UF)', colunas: 1 },
          { rotulo: 'Data de nascimento', tipo: 'date', colunas: 1 },
          { rotulo: 'Estado civil', tipo: 'select', opcoes: ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União estável'], colunas: 1 },
          { rotulo: 'Regime de casamento', tipo: 'select', opcoes: ['Comunhão parcial de bens', 'Comunhão universal de bens', 'Separação total de bens', 'Participação final nos aquestos'], colunas: 1 },
          { rotulo: 'Nome cônjuge/companheiro(a)', colunas: 2 },
          { rotulo: 'CPF cônjuge/companheiro(a)', placeholder: '000.000.000-00', mascara: this.cpfMask, colunas: 1 },
          { rotulo: 'Nº de dependentes', tipo: 'number', colunas: 1 },
          { rotulo: 'Nacionalidade', colunas: 1 },
          { rotulo: 'Possui outra nacionalidade?', tipo: 'radio', opcoes: ['Sim', 'Não'], colunas: 1 },
          { rotulo: 'Se sim, quais?', colunas: 2 },
          { rotulo: 'Tipo do documento', tipo: 'select', opcoes: ['RG', 'CNH', 'Passaporte', 'RNE', 'Outro'], colunas: 1 },
          { rotulo: 'Nº do documento', colunas: 1 },
          { rotulo: 'Data de emissão', tipo: 'date', colunas: 1 },
          { rotulo: 'Órgão emissor', colunas: 1 },
          { rotulo: 'UF/País emissor', colunas: 1 }
        ]
      }]
    },
    {
      titulo: 'Endereço residencial',
      aberta: false,
      grupos: [{
        titulo: 'Endereço residencial',
        campos: [
          { rotulo: 'CEP', placeholder: '00000-000', mascara: this.cepMask, colunas: 1 },
          { rotulo: 'Endereço residencial', colunas: 3 },
          { rotulo: 'Nº', colunas: 1 },
          { rotulo: 'Complemento', colunas: 1 },
          { rotulo: 'Tempo de residência', colunas: 1 },
          { rotulo: 'Bairro', colunas: 1 },
          { rotulo: 'Cidade', colunas: 1 },
          { rotulo: 'UF', colunas: 1 },
          { rotulo: 'Endereço para correspondência', tipo: 'radio', opcoes: ['Residencial', 'Comercial'], colunas: 2 },
          { rotulo: 'Autorização de residência em outros países?', tipo: 'radio', opcoes: ['Sim', 'Não'], colunas: 2 },
          { rotulo: 'Se sim, quais?', colunas: 2 },
          { rotulo: 'Possui outro domicílio fiscal?', tipo: 'radio', opcoes: ['Sim', 'Não'], colunas: 2 },
          { rotulo: 'Se sim, quais?', colunas: 2 },
          { rotulo: 'Telefone (DDI+DDD+Nº)', tipo: 'tel', placeholder: '(11) 91234-5678', mascara: this.telefoneMask, colunas: 1 },
          { rotulo: 'Celular (DDI+DDD+Nº)', tipo: 'tel', placeholder: '(11) 91234-5678', mascara: this.telefoneMask, colunas: 1 },
          { rotulo: 'E-mail', tipo: 'email', colunas: 2 },
          { rotulo: 'É considerado uma “U.S. Person”?', tipo: 'radio', opcoes: ['Sim', 'Não'], colunas: 2 }
        ]
      }]
    },
    {
      titulo: 'Ocupação e dados profissionais',
      aberta: false,
      grupos: [{
        titulo: 'Dados profissionais',
        campos: [
          {
            rotulo: 'Natureza da ocupação (principal fonte de renda)',
            tipo: 'select',
            opcoes: [
              'Empregado(a)',
              'Empresário(a)',
              'Profissional liberal',
              'Autônomo(a)',
              'Aposentado(a)',
              'Estudante',
              'Do lar',
              'Outros'
            ],
            colunas: 2
          },
          { rotulo: 'Instituição em que trabalha', colunas: 2 },
          { rotulo: 'CNPJ do empregador', placeholder: '00.000.000/0000-00', mascara: this.cnpjMask, colunas: 1 },
          { rotulo: 'CEP', placeholder: '00000-000', mascara: this.cepMask, colunas: 1 },
          { rotulo: 'Endereço comercial', colunas: 2 },
          { rotulo: 'Nº', colunas: 1 },
          { rotulo: 'Complemento', colunas: 1 },
          { rotulo: 'Bairro', colunas: 1 },
          { rotulo: 'Cidade', colunas: 1 },
          { rotulo: 'UF', colunas: 1 },
          { rotulo: 'Telefone comercial', tipo: 'tel', placeholder: '(11) 91234-5678', mascara: this.telefoneMask, colunas: 1 },
          { rotulo: 'Profissão', colunas: 1 },
          { rotulo: 'Cargo na empresa', colunas: 1 },
          { rotulo: 'E-mail comercial', tipo: 'email', colunas: 2 }
        ]
      }]
    },
    {
      titulo: '2. Referências pessoais e comerciais',
      aberta: false,
      grupos: [{
        titulo: 'Referências',
        campos: []
      }]
    },
    {
      titulo: '3. Dados bancários',
      aberta: false,
      grupos: [{
        titulo: 'Conta bancária',
        campos: []
      }]
    },
    {
      titulo: '4. Situação financeira / patrimonial',
      aberta: false,
      grupos: [{
        titulo: 'Situação financeira',
        campos: []
      }]
    },
    {
      titulo: '5. Investidor estrangeiro (se aplicável)',
      aberta: false,
      grupos: [{
        titulo: 'Informações internacionais',
        campos: [
          { rotulo: 'Cód. operacional CVM', colunas: 1 },
          { rotulo: 'BDE (Nº BACEN) / CADEMP', colunas: 1 },
          { rotulo: 'País de origem', colunas: 1 },
          { rotulo: 'Representante no Brasil', colunas: 2 },
          { rotulo: 'Representante co-responsável', colunas: 2 },
          { rotulo: 'Custodiante', colunas: 1 },
          { rotulo: 'Administrador de carteira', colunas: 1 },
          { rotulo: 'Situação', tipo: 'select', opcoes: ['Isento', 'Não isento'], colunas: 1 }
        ]
      }]
    },
    {
      titulo: '6. Participações societárias (mais relevantes)',
      aberta: false,
      grupos: [{
        titulo: 'Participação societária',
        campos: []
      }]
    },
    {
      titulo: '7. Declaração de propósitos',
      aberta: false,
      grupos: [{
        titulo: 'Objetivo do investimento',
        campos: [
          { rotulo: 'Objetivo', tipo: 'textarea' },
          { rotulo: 'Origem dos recursos para investimento', tipo: 'textarea' }
        ]
      }]
    },
    {
      titulo: '8. Pessoa Politicamente Exposta (PPE)',
      aberta: false,
      grupos: [{
        titulo: 'Declaração PPE',
        campos: []
      }]
    },
    {
      titulo: '9. Procurador',
      aberta: false,
      grupos: [{
        titulo: 'Dados do procurador',
        campos: []
      }]
    }
  ];

  procuradorOperaPorContaPropria = '';
  procuradorAutorizaOrdens = '';
  procuradorPpe = '';
  procuradorRelacionamentoPpe = '';
  cargoProcuradorPpe = '';
  dadosProcuradorRelacionado = '';
  cpfProcurador = '';
  cepProcurador = '';
  enderecoProcurador = '';
  numeroProcurador = '';
  complementoProcurador = '';

  alternarFicha(ficha: Ficha): void {
    ficha.aberta = !ficha.aberta;
  }

  identificadorCampo(fichaIndex: number, grupoIndex: number, campoIndex: number): string {
    return 'campo-' + fichaIndex + '-' + grupoIndex + '-' + campoIndex;
  }

  rotuloCampo(campo: FichaCampo, fichaIndex: number, campoIndex: number): string {
    const tipoInvestidor = this.identificacao
      ? this.identificacao.tipoInvestidor
      : this.tipoInvestidorSelecionado;
    if (fichaIndex === 0 && campoIndex === 1 && tipoInvestidor === 'PESSOA_JURIDICA') {
      return 'CNPJ';
    }

    return campo.rotulo;
  }

  adicionarReferencia(): void {
    this.referencias.push({
      nomeCompleto: '',
      nacionalidade: '',
      telefone: ''
    });
  }

  removerReferencia(index: number): void {
    this.referencias.splice(index, 1);
  }

  atualizarReferencia(
    referencia: Referencia,
    campo: keyof Referencia,
    evento: Event
  ): void {
    referencia[campo] = (evento.target as HTMLInputElement).value;
  }

  adicionarContaBancaria(): void {
    this.contasBancarias.push({
      banco: '',
      agencia: '',
      numeroConta: '',
      tipoConta: ''
    });
  }

  removerContaBancaria(index: number): void {
    this.contasBancarias.splice(index, 1);
  }

  atualizarContaBancaria(
    conta: ContaBancaria,
    campo: keyof ContaBancaria,
    evento: Event
  ): void {
    conta[campo] = (evento.target as HTMLInputElement).value;
  }

  adicionarItemPatrimonial(): void {
    this.itensPatrimoniais.push({
      categoria: '',
      descricao: '',
      valorAtual: ''
    });
  }

  removerItemPatrimonial(index: number): void {
    this.itensPatrimoniais.splice(index, 1);
  }

  atualizarItemPatrimonial(
    item: ItemPatrimonial,
    campo: keyof ItemPatrimonial,
    evento: Event
  ): void {
    item[campo] = (evento.target as HTMLInputElement).value;
  }

  adicionarParticipacaoSocietaria(): void {
    this.participacoesSocietarias.push({
      razaoSocial: '',
      cnpj: '',
      nacionalidade: '',
      percentualCapital: '',
      instituicaoFinanceira: '',
      giinNumber: ''
    });
  }

  removerParticipacaoSocietaria(index: number): void {
    this.participacoesSocietarias.splice(index, 1);
  }

  atualizarParticipacaoSocietaria(
    participacao: ParticipacaoSocietaria,
    campo: keyof ParticipacaoSocietaria,
    evento: Event
  ): void {
    participacao[campo] = (evento.target as HTMLInputElement).value;
  }

  alternarProposito(proposito: string, evento: Event): void {
    const selecionado = (evento.target as HTMLInputElement).checked;

    if (selecionado && this.propositosSelecionados.indexOf(proposito) === -1) {
      this.propositosSelecionados.push(proposito);
    } else if (!selecionado) {
      this.propositosSelecionados = this.propositosSelecionados.filter(valor => valor !== proposito);
    }

    if (proposito === 'OUTROS' && !selecionado) {
      this.outroProposito = '';
    }
  }

  atualizarOutroProposito(evento: Event): void {
    this.outroProposito = (evento.target as HTMLInputElement).value;
  }

  atualizarRespostaPpe(pergunta: 'exposta' | 'relacionamento', evento: Event): void {
    const resposta = (evento.target as HTMLInputElement).value;

    if (pergunta === 'exposta') {
      this.pessoaPoliticamenteExposta = resposta;
      if (resposta !== 'Sim') {
        this.cargoPpe = '';
      }
      return;
    }

    this.relacionamentoComPpe = resposta;
    if (resposta !== 'Sim') {
      this.dadosPpeRelacionado = '';
    }
  }

  atualizarCampoPpe(campo: 'cargo' | 'relacionado', evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;

    if (campo === 'cargo') {
      this.cargoPpe = valor;
      return;
    }

    this.dadosPpeRelacionado = valor;
  }

  atualizarRespostaProcurador(
    pergunta: 'contaPropria' | 'ordens' | 'ppe' | 'relacionamentoPpe',
    evento: Event
  ): void {
    const resposta = (evento.target as HTMLInputElement).value;

    switch (pergunta) {
      case 'contaPropria':
        this.procuradorOperaPorContaPropria = resposta;
        break;
      case 'ordens':
        this.procuradorAutorizaOrdens = resposta;
        break;
      case 'ppe':
        this.procuradorPpe = resposta;
        if (resposta !== 'Sim') {
          this.cargoProcuradorPpe = '';
        }
        break;
      case 'relacionamentoPpe':
        this.procuradorRelacionamentoPpe = resposta;
        if (resposta !== 'Sim') {
          this.dadosProcuradorRelacionado = '';
        }
        break;
    }
  }

  atualizarCampoProcurador(campo: 'cargoPpe' | 'relacionadoPpe', evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;

    if (campo === 'cargoPpe') {
      this.cargoProcuradorPpe = valor;
      return;
    }

    this.dadosProcuradorRelacionado = valor;
  }

  selecionarArquivo(tipo: TipoDocumentoAnexo, evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const arquivo = input.files && input.files.length > 0 ? input.files[0] : null;

    if (arquivo) {
      this.arquivos[tipo] = arquivo;
    }
  }

  abrirSeletorArquivo(input: HTMLInputElement): void {
    input.value = '';
    input.click();
  }

  atualizarCepCampo(fichaIndex: number, campoIndex: number, cep: string): void {
    const cepLimpo = this.apenasDigitos(cep);
    if (cepLimpo.length === 8) {
      this.buscarCep(cepLimpo, (dados) => {
        if (fichaIndex === 1) {
          this.preencherCampo(fichaIndex, 1, dados.logradouro);
          this.preencherCampo(fichaIndex, 5, dados.bairro);
          this.preencherCampo(fichaIndex, 6, dados.localidade);
          this.preencherCampo(fichaIndex, 7, dados.uf);
        } else if (fichaIndex === 2) {
          this.preencherCampo(fichaIndex, 4, dados.logradouro);
          this.preencherCampo(fichaIndex, 7, dados.bairro);
          this.preencherCampo(fichaIndex, 8, dados.localidade);
          this.preencherCampo(fichaIndex, 9, dados.uf);
        }
      });
    }
  }

  atualizarCepProcurador(cep: string): void {
    const cepLimpo = this.apenasDigitos(cep);
    if (cepLimpo.length === 8) {
      this.buscarCep(cepLimpo, (dados) => {
        this.enderecoProcurador = dados.logradouro || '';
      });
    }
  }

  private preencherCampo(fichaIndex: number, campoIndex: number, valor: string): void {
    const grupo = this.fichas[fichaIndex] && this.fichas[fichaIndex].grupos[0];
    if (grupo && grupo.campos[campoIndex]) {
      grupo.campos[campoIndex].valor = valor || '';
    }
  }

  private buscarCep(cep: string, sucesso: (dados: any) => void): void {
    this.http.get<any>(`https://viacep.com.br/ws/${cep}/json/`).subscribe({
      next: (dados) => {
        if (!dados.erro) {
          sucesso(dados);
        }
      },
      error: (erro) => {
        console.error('Erro ao buscar CEP', erro);
      }
    });
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1] || '');
      };
      reader.onerror = erro => reject(erro);
      reader.readAsDataURL(file);
    });
  }

  private tipoArquivo(file: File): string {
    const extensao = file.name.split('.').pop();
    return (extensao || file.type.split('/').pop() || '').toLowerCase();
  }

  private async montarArquivos(): Promise<any[]> {
    const arquivos: any[] = [];

    if (this.arquivos.identificacao) {
      const contentBase64 = await this.fileToBase64(this.arquivos.identificacao);
      arquivos.push({
        document_type: 1,
        original_name: this.arquivos.identificacao.name,
        type: this.tipoArquivo(this.arquivos.identificacao),
        content_base64: contentBase64,
        base64: contentBase64
      });
    }

    if (this.arquivos.endereco) {
      const contentBase64 = await this.fileToBase64(this.arquivos.endereco);
      arquivos.push({
        document_type: 2,
        original_name: this.arquivos.endereco.name,
        type: this.tipoArquivo(this.arquivos.endereco),
        content_base64: contentBase64,
        base64: contentBase64
      });
    }

    return arquivos;
  }

  tamanhoArquivo(arquivo: File): string {
    return this.formatarTamanhoArquivo(arquivo.size);
  }

  nomeArquivoPersistido(arquivo: any): string {
    return arquivo && (arquivo.original_name || arquivo.nome_original || arquivo.name)
      ? arquivo.original_name || arquivo.nome_original || arquivo.name
      : 'Arquivo anexado';
  }

  tamanhoArquivoPersistido(arquivo: any): string {
    const tamanho = Number(arquivo && (arquivo.tamanho || arquivo.size));
    return tamanho > 0 ? this.formatarTamanhoArquivo(tamanho) : '';
  }

  private formatarTamanhoArquivo(tamanho: number): string {
    if (tamanho < 1024) {
      return tamanho + ' B';
    }

    if (tamanho < 1024 * 1024) {
      return Math.max(1, Math.round(tamanho / 1024)) + ' KB';
    }

    return (tamanho / (1024 * 1024)).toFixed(1) + ' MB';
  }

  baixarArquivo(tipo: TipoDocumentoAnexo): void {
    const arquivo = this.arquivos[tipo];
    if (!arquivo) {
      return;
    }

    const url = URL.createObjectURL(arquivo);
    const link = document.createElement('a');
    link.href = url;
    link.download = arquivo.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  removerArquivo(tipo: TipoDocumentoAnexo, input: HTMLInputElement): void {
    this.arquivos[tipo] = null;
    input.value = '';
  }

  private valorCampo(fichaIndex: number, campoIndex: number): string {
    const ficha = this.fichas[fichaIndex];
    const campo = ficha && ficha.grupos[0] && ficha.grupos[0].campos[campoIndex];
    if (campo && campo.valorInicial) {
      return this.identificacao
        ? this.documentoFormatado
        : (campo.valor ? String(campo.valor).trim() : '');
    }
    return campo && campo.valor ? String(campo.valor).trim() : '';
  }

  private valorOpcional(valor: string): string | null {
    return valor ? valor : null;
  }

  private booleanSim(valor: string): boolean {
    return String(valor).toLowerCase() === 'sim';
  }

  private apenasDigitos(valor: string): string {
    return String(valor || '').replace(/\D/g, '');
  }

  private numero(valor: string): number | null {
    if (!valor) {
      return null;
    }
    const parsed = Number(String(valor).replace(',', '.'));
    return isNaN(parsed) ? null : parsed;
  }

  async montarObjetoJson(): Promise<{ [key: string]: any }> {
    const i = this.identificacao;
    const arquivos = await this.montarArquivos();
    const enderecoResidencial = {
      cep: this.apenasDigitos(this.valorCampo(1, 0)),
      logradouro: this.valorOpcional(this.valorCampo(1, 1)),
      numero: this.valorOpcional(this.valorCampo(1, 2)),
      complemento: this.valorOpcional(this.valorCampo(1, 3)),
      bairro: this.valorOpcional(this.valorCampo(1, 5)),
      cidade: this.valorOpcional(this.valorCampo(1, 6)),
      estado: this.valorOpcional(this.valorCampo(1, 7)),
      pais: 'Brasil'
    };
    const enderecoComercial = {
      cep: this.apenasDigitos(this.valorCampo(2, 3)),
      logradouro: this.valorOpcional(this.valorCampo(2, 4)),
      numero: this.valorOpcional(this.valorCampo(2, 5)),
      complemento: this.valorOpcional(this.valorCampo(2, 6)),
      bairro: this.valorOpcional(this.valorCampo(2, 7)),
      cidade: this.valorOpcional(this.valorCampo(2, 8)),
      estado: this.valorOpcional(this.valorCampo(2, 9)),
      pais: 'Brasil'
    };

    return {
      enviar: true,
      nome_completo: this.valorOpcional(this.valorCampo(0, 0)),
      documento: i
        ? this.apenasDigitos(i.documento)
        : this.apenasDigitos(this.valorCampo(0, 1)) || null,
      tipo_pessoa: i
        ? (i.tipoInvestidor === 'PESSOA_JURIDICA' ? 'juridica' : 'fisica')
        : (this.tipoInvestidorSelecionado === 'PESSOA_JURIDICA' ? 'juridica' : 'fisica'),
      tin: this.valorOpcional(this.valorCampo(0, 2)),
      nome_mae: this.valorOpcional(this.valorCampo(0, 3)),
      sexo: this.valorOpcional(this.valorCampo(0, 4)),
      local_nascimento: this.valorOpcional(this.valorCampo(0, 5)),
      data_nascimento: this.valorOpcional(this.valorCampo(0, 6)),
      estado_civil: this.valorOpcional(this.valorCampo(0, 7)),
      regime_casamento: this.valorOpcional(this.valorCampo(0, 8)),
      nome_conjuge: this.valorOpcional(this.valorCampo(0, 9)),
      cpf_conjuge: this.valorOpcional(this.apenasDigitos(this.valorCampo(0, 10))),
      numero_dependentes: this.numero(this.valorCampo(0, 11)),
      nacionalidade: this.valorOpcional(this.valorCampo(0, 12)),
      possui_outra_nacionalidade: this.booleanSim(this.valorCampo(0, 13)),
      outras_nacionalidades: this.valorOpcional(this.valorCampo(0, 14)),
      tipo_documento: this.valorOpcional(this.valorCampo(0, 15)),
      numero_documento: this.valorOpcional(this.valorCampo(0, 16)),
      data_emissao_documento: this.valorOpcional(this.valorCampo(0, 17)),
      orgao_emissor: this.valorOpcional(this.valorCampo(0, 18)),
      uf_pais_emissor: this.valorOpcional(this.valorCampo(0, 19)),
      tempo_residencia: this.valorOpcional(this.valorCampo(1, 4)),
      endereco_correspondencia: this.valorCampo(1, 8).toLowerCase() || null,
      endereco_residencial: enderecoResidencial,
      endereco_comercial: enderecoComercial,
      autorizacao_residencia_outros_paises: this.booleanSim(this.valorCampo(1, 9)),
      paises_residencia: this.valorOpcional(this.valorCampo(1, 10)),
      possui_outro_domicilio_fiscal: this.booleanSim(this.valorCampo(1, 11)),
      outros_domicilios_fiscais: this.valorOpcional(this.valorCampo(1, 12)),
      telefone: this.valorOpcional(this.valorCampo(1, 13)),
      celular: this.valorOpcional(this.valorCampo(1, 14)),
      email: this.valorOpcional(this.valorCampo(1, 15)),
      us_person: this.booleanSim(this.valorCampo(1, 16)),
      natureza_ocupacao: this.valorOpcional(this.valorCampo(2, 0)),
      instituicao_trabalho: this.valorOpcional(this.valorCampo(2, 1)),
      cnpj_empregador: this.valorOpcional(this.apenasDigitos(this.valorCampo(2, 2))),
      telefone_comercial: this.valorOpcional(this.valorCampo(2, 10)),
      profissao: this.valorOpcional(this.valorCampo(2, 11)),
      cargo: this.valorOpcional(this.valorCampo(2, 12)),
      email_comercial: this.valorOpcional(this.valorCampo(2, 13)),
      referencias: this.referencias
        .filter(referencia => referencia.nomeCompleto || referencia.nacionalidade || referencia.telefone)
        .map(referencia => ({
          nome_completo: this.valorOpcional(referencia.nomeCompleto),
          nacionalidade: this.valorOpcional(referencia.nacionalidade),
          telefone: this.valorOpcional(referencia.telefone)
        })),
      contas: this.contasBancarias
        .filter(conta => conta.banco || conta.agencia || conta.numeroConta || conta.tipoConta)
        .map(conta => ({
          banco: this.valorOpcional(conta.banco),
          agencia: this.valorOpcional(conta.agencia),
          numero_conta: this.valorOpcional(conta.numeroConta),
          tipo_conta: this.valorOpcional(conta.tipoConta)
        })),
      itens_patrimoniais: this.itensPatrimoniais
        .filter(item => item.categoria || item.descricao || item.valorAtual)
        .map(item => ({
          categoria: this.valorOpcional(item.categoria),
          descricao: this.valorOpcional(item.descricao),
          valor_atual: this.numero(item.valorAtual)
        })),
      codigo_operacional_cvm: this.valorOpcional(this.valorCampo(6, 0)),
      rde_cademp: this.valorOpcional(this.valorCampo(6, 1)),
      pais_origem: this.valorOpcional(this.valorCampo(6, 2)),
      representante_brasil: this.valorOpcional(this.valorCampo(6, 3)),
      representante_coresponsavel: this.valorOpcional(this.valorCampo(6, 4)),
      custodiante: this.valorOpcional(this.valorCampo(6, 5)),
      administrador_carteira: this.valorOpcional(this.valorCampo(6, 6)),
      situacao: this.valorCampo(6, 7) === 'Isento' ? 'isento' : 'nao_isento',
      participacoes: this.participacoesSocietarias
        .filter(participacao => participacao.razaoSocial || participacao.cnpj)
        .map(participacao => ({
          razao_social: this.valorOpcional(participacao.razaoSocial),
          cnpj: this.valorOpcional(this.apenasDigitos(participacao.cnpj)),
          nacionalidade: this.valorOpcional(participacao.nacionalidade),
          percentual_capital: this.numero(participacao.percentualCapital),
          instituicao_financeira: this.booleanSim(participacao.instituicaoFinanceira),
          giin: this.valorOpcional(participacao.giinNumber)
        })),
      proposito_cambio: this.propositosSelecionados.indexOf('CAMBIO') !== -1,
      proposito_aplicacoes: this.propositosSelecionados.indexOf('APLICACOES_INVESTIMENTOS') !== -1,
      proposito_intermediacao: this.propositosSelecionados.indexOf('INTERMEDIACAO_OPERACOES') !== -1,
      proposito_credito: this.propositosSelecionados.indexOf('OPERACOES_CREDITO') !== -1,
      proposito_acessorias: this.propositosSelecionados.indexOf('OPERACOES_ACESSORIAS') !== -1,
      proposito_outros: this.valorOpcional(this.outroProposito),
      e_ppe: this.booleanSim(this.pessoaPoliticamenteExposta),
      ppe_cargo: this.valorOpcional(this.cargoPpe),
      relacionamento_ppe: this.booleanSim(this.relacionamentoComPpe),
      ppe_relacionada_cargo: null,
      ppe_relacionada_nome: null,
      ppe_relacionada_cpf: null,
      ppe_relacionada_nacionalidade: null,
      operador: {
        opera_conta_propria: this.booleanSim(this.procuradorOperaPorContaPropria),
        autoriza_ordens_procurador: this.booleanSim(this.procuradorAutorizaOrdens),
        nome_completo: null,
        cpf: this.valorOpcional(this.apenasDigitos(this.cpfProcurador)),
        data_nascimento: null,
        descricao_poderes: this.valorOpcional(this.dadosProcuradorRelacionado),
        e_ppe: this.booleanSim(this.procuradorPpe),
        ppe_cargo: this.valorOpcional(this.cargoProcuradorPpe),
        relacionamento_ppe: this.booleanSim(this.procuradorRelacionamentoPpe),
        ppe_relacionada_cargo: null,
        ppe_relacionada_nome: null,
        ppe_relacionada_cpf: null,
        ppe_relacionada_nacionalidade: null,
        endereco: {
          cep: this.valorOpcional(this.apenasDigitos(this.cepProcurador)),
          logradouro: this.valorOpcional(this.enderecoProcurador),
          numero: this.valorOpcional(this.numeroProcurador),
          complemento: this.valorOpcional(this.complementoProcurador),
          pais: 'Brasil'
        }
      },
      arquivos
    };
  }

  async irParaSuitability(): Promise<void> {
    const payload = await this.montarObjetoJson();
    this.continuarSuitability.emit(payload);
  }

  async salvarComoRascunho(): Promise<void> {
    const payload = await this.montarObjetoJson();
    payload.status = 'rascunho';
    payload.enviar = false;
    this.salvarRascunho.emit(payload);
  }
}
