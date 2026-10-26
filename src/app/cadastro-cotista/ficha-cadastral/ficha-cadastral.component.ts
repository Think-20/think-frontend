import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IdentificacaoCotista } from '../identificacao-inicial/identificacao-inicial.component';

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
export class FichaCadastralComponent {
  @Input() identificacao: IdentificacaoCotista | null = null;
  @Output() continuarSuitability = new EventEmitter<void>();

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

  arquivos: ArquivosAnexos = {
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

  alternarFicha(ficha: Ficha): void {
    ficha.aberta = !ficha.aberta;
  }

  identificadorCampo(fichaIndex: number, grupoIndex: number, campoIndex: number): string {
    return 'campo-' + fichaIndex + '-' + grupoIndex + '-' + campoIndex;
  }

  rotuloCampo(campo: FichaCampo, fichaIndex: number, campoIndex: number): string {
    if (fichaIndex === 0 && campoIndex === 1 && this.identificacao
      && this.identificacao.tipoInvestidor === 'PESSOA_JURIDICA') {
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

  tamanhoArquivo(arquivo: File): string {
    if (arquivo.size < 1024) {
      return arquivo.size + ' B';
    }

    if (arquivo.size < 1024 * 1024) {
      return Math.max(1, Math.round(arquivo.size / 1024)) + ' KB';
    }

    return (arquivo.size / (1024 * 1024)).toFixed(1) + ' MB';
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

  irParaSuitability(): void {
    this.continuarSuitability.emit();
  }
}
