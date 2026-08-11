import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CedenteDataService } from '../novo-cedente/cedente-data.service';

interface Documento {
  id: number | string;
  titulo: string;
  descricao: string;
  obrigatorio: boolean;
  pessoaNome?: string;
  pessoaTipo?: 'parte_relacionada' | 'avalista';
  arquivo?: File;
  nomeArquivo?: string;
  tipoArquivo?: string;
  tamanhoArquivo?: string;
  dataUpload?: Date;
  erro?: string;
}

interface GrupoDocumentoPessoa {
  titulo: string;
  descricao: string;
  documentos: Documento[];
}

@Component({
  selector: 'cb-documentacao-cedente',
  templateUrl: './documentacao-cedente.component.html',
  styleUrls: ['./documentacao-cedente.component.css']
})
export class DocumentacaoCedenteComponent implements OnInit, OnDestroy {
  documentacao: boolean = true;
  contrato: boolean = false;
  mensagemPendencia: string = '';

  documentos: Documento[] = [
    { id: 1, titulo: 'Contrato/Estatuto Social', descricao: 'Documento obrigatório', obrigatorio: true },
    { id: 2, titulo: 'Certidão Simplificada da Junta Comercial', descricao: 'Documento obrigatório', obrigatorio: true },
    { id: 3, titulo: 'Ata de Eleição da Diretoria', descricao: 'Documento obrigatório', obrigatorio: true },
    { id: 4, titulo: 'Cartão CNPJ', descricao: 'Documento obrigatório', obrigatorio: true },
    { id: 14, titulo: 'CNH', descricao: 'Documento obrigatório', obrigatorio: true },
    { id: 5, titulo: 'Parecer de Compliance/Reputacional', descricao: 'Documento obrigatório', obrigatorio: true },
    { id: 6, titulo: 'Demonstração Financeira', descricao: 'Documento obrigatório', obrigatorio: true },
    { id: 7, titulo: 'Ata/Parecer de Crédito', descricao: 'Documento obrigatório', obrigatorio: true },
    { id: 8, titulo: 'Consulta aos Órgãos de Proteção de Crédito', descricao: 'Documento obrigatório', obrigatorio: true },
    { id: 9, titulo: 'Relatório de Visita', descricao: 'Documento obrigatório', obrigatorio: true },
    { id: 10, titulo: 'Parecer da Gestora', descricao: 'Documento obrigatório', obrigatorio: true },
    { id: 11, titulo: 'Comprovante de Endereço', descricao: 'Documento obrigatório', obrigatorio: true },
    { id: 12, titulo: 'Contrato Social Cedente', descricao: 'Documento obrigatório', obrigatorio: true },
    { id: 13, titulo: 'Comprovante de Vínculo', descricao: 'Documento obrigatório', obrigatorio: true }
  ];

  documentosPartesRelacionadas: GrupoDocumentoPessoa[] = [];
  documentosAvalistas: GrupoDocumentoPessoa[] = [];

  // Tipos de arquivo aceitos
  tiposPermitidos = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.zip', '.rar'];
  tamanhoMaximo = 700 * 1024; // 700KB
  private readonly duracaoErroVisualMs = 2500;
  private errosTemporariosTimers: { [key: string]: any } = {};

  constructor(
    private cedenteDataService: CedenteDataService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    const dados = this.cedenteDataService.obterDados();
    this.hidratarDocumentosPersistidos(dados.arquivos || []);
  }

  ngOnDestroy(): void {
    Object.keys(this.errosTemporariosTimers).forEach((key: string) => {
      clearTimeout(this.errosTemporariosTimers[key]);
    });
  }

  /*
   * Bloco dinâmico de documentos por partes relacionadas/avalistas
   * temporariamente desabilitado para manter somente documentos do cedente.
   */
  /*
  private configurarDocumentosDinamicos(): void {
    const dados = this.cedenteDataService.obterDados();

    this.documentosPartesRelacionadas = this.criarDocumentosPorPessoa(
      dados.partes_relacionadas || [],
      'parte_relacionada',
      [
        { chave: 'rg_frente_verso', titulo: 'RG (Frente e Verso)' },
        { chave: 'cpf', titulo: 'CPF' },
        { chave: 'comprovante_residencia', titulo: 'Comprovante de Residência' }
      ]
    );

    this.documentosAvalistas = this.criarDocumentosPorPessoa(
      dados.avalistas || [],
      'avalista',
      [
        { chave: 'rg_frente_verso', titulo: 'RG (Frente e Verso)' },
        { chave: 'cpf', titulo: 'CPF' },
        { chave: 'comprovante_residencia', titulo: 'Comprovante de Residência' },
        { chave: 'certidao_casamento', titulo: 'Certidão de Casamento' }
      ]
    );

    this.hidratarDocumentosPersistidos(dados.arquivos || []);
  }

  private criarDocumentosPorPessoa(
    pessoas: any[],
    tipo: 'parte_relacionada' | 'avalista',
    definicoes: Array<{ chave: string; titulo: string }>
  ): GrupoDocumentoPessoa[] {
    return (pessoas || []).map((pessoa: any, index: number) => {
      const pessoaKey = this.obterChavePessoa(pessoa, index, tipo);
      const pessoaNome = this.obterNomePessoa(pessoa, index, tipo);
      const tituloGrupo = tipo === 'parte_relacionada' ? 'Parte Relacionada' : 'Avalista';

      return {
        titulo: `${tituloGrupo} ${index + 1}`,
        descricao: pessoaNome,
        documentos: definicoes.map((definicao) => ({
          id: `${tipo}::${pessoaKey}::${definicao.chave}`,
          titulo: definicao.titulo,
          descricao: 'Documento obrigatório',
          obrigatorio: true,
          pessoaNome,
          pessoaTipo: tipo
        }))
      };
    });
  }

  private obterChavePessoa(pessoa: any, index: number, tipo: 'parte_relacionada' | 'avalista'): string {
    if (pessoa && pessoa.__documentacaoKey) {
      return pessoa.__documentacaoKey;
    }

    const cpf = pessoa && pessoa.cpf ? String(pessoa.cpf).replace(/\D/g, '') : '';
    if (cpf) {
      return `${tipo}_${cpf}`;
    }

    return `${tipo}_${index}`;
  }

  private obterNomePessoa(pessoa: any, index: number, tipo: 'parte_relacionada' | 'avalista'): string {
    if (pessoa && pessoa.nome) {
      return pessoa.nome;
    }

    return tipo === 'parte_relacionada'
      ? `Parte relacionada ${index + 1}`
      : `Avalista ${index + 1}`;
  }

  private normalizarIdDocumento(documentType: any): string {
    if (documentType === null || typeof documentType === 'undefined') {
      return '';
    }

    const texto = String(documentType).trim();

    if (/^\d+$/.test(texto)) {
      return String(Number(texto));
    }

    return texto;
  }

  private obterTodosDocumentos(): Documento[] {
    return [
      ...this.documentos,
      ...this.documentosPartesRelacionadas.reduce((acc: Documento[], grupo) => acc.concat(grupo.documentos), []),
      ...this.documentosAvalistas.reduce((acc: Documento[], grupo) => acc.concat(grupo.documentos), [])
    ];
  }
  */

  private hidratarDocumentosPersistidos(arquivos: any[]): void {
    if (!arquivos || !arquivos.length) {
      return;
    }

    arquivos.forEach((arquivo) => {
      const documento = this.documentos.find(doc => Number(doc.id) === Number(arquivo.document_type));
      if (!documento) {
        return;
      }

      documento.arquivo = {} as File;
      documento.nomeArquivo = arquivo.original_name;
      documento.tipoArquivo = arquivo.type;
      documento.tamanhoArquivo = arquivo.tamanho ? this.formatarTamanho(arquivo.tamanho) : '';
      documento.dataUpload = new Date();
      documento.erro = undefined;
    });
  }

  abrirContrato(){
    this.contrato = true;
    this.documentacao = false;
  }

  validarDocumentosObrigatorios(): boolean {
    const pendentes = this.documentos.filter(doc => doc.obrigatorio && !doc.arquivo);

    if (pendentes.length > 0) {
      const texto = pendentes.length === 1
        ? `Você ainda não anexou 1 documento obrigatório.`
        : `Você ainda não anexou ${pendentes.length} documentos obrigatórios.`;

      this.mensagemPendencia = texto;
      return false;
    }

    this.mensagemPendencia = '';
    return true;
  }

  /**
   * Retorna o ícone apropriado baseado no tipo de arquivo
   */
  obterIconeArquivo(tipoArquivo: string): string {
    if (!tipoArquivo) return 'description';
    
    if (tipoArquivo.includes('pdf')) return 'picture_as_pdf';
    if (tipoArquivo.includes('word') || tipoArquivo.includes('document') || tipoArquivo.includes('doc')) return 'description';
    if (tipoArquivo.includes('sheet') || tipoArquivo.includes('excel') || tipoArquivo.includes('xls')) return 'table_chart';
    if (tipoArquivo.includes('image') || tipoArquivo.includes('jpg') || tipoArquivo.includes('jpeg') || tipoArquivo.includes('png')) return 'image';
    if (tipoArquivo.includes('zip') || tipoArquivo.includes('rar') || tipoArquivo.includes('compressed')) return 'folder_zip';
    
    return 'description';
  }

  /**
   * Retorna a cor do ícone baseado no tipo de arquivo
   */
  obterCorIcone(tipoArquivo: string): string {
    if (!tipoArquivo) return '#3b82f6';
    
    if (tipoArquivo.includes('pdf')) return '#ef4444';
    if (tipoArquivo.includes('word') || tipoArquivo.includes('document') || tipoArquivo.includes('doc')) return '#2563eb';
    if (tipoArquivo.includes('sheet') || tipoArquivo.includes('excel') || tipoArquivo.includes('xls')) return '#16a34a';
    if (tipoArquivo.includes('image') || tipoArquivo.includes('jpg') || tipoArquivo.includes('jpeg') || tipoArquivo.includes('png')) return '#f59e0b';
    if (tipoArquivo.includes('zip') || tipoArquivo.includes('rar')) return '#8b5cf6';
    
    return '#3b82f6';
  }

  /**
   * Formata o tamanho do arquivo para unidade legível
   */
  formatarTamanho(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  private obterTipoArquivo(arquivo: Pick<File, 'name' | 'type'>): string {
    const extensao = (arquivo.name.split('.').pop() || '').toLowerCase();

    const extensoesQueDevemSerNormalizadas = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'rar'];

    if (extensoesQueDevemSerNormalizadas.includes(extensao)) {
      return extensao;
    }

    return (arquivo.type || extensao || '').toLowerCase();
  }

  /**
   * Converte arquivo para Base64 (somente o conteúdo Base64 sem prefixo)
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // remover prefixo como data:application/pdf;base64,
        const base64 = result.split(',')[1] || '';
        resolve(base64);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Valida o arquivo selecionado
   */
  validarArquivo(arquivo: File, documento: Documento): boolean {
    // Validar extensão
    const extensao = '.' + (arquivo.name.split('.').pop() || '').toLowerCase();
    if (!this.tiposPermitidos.includes(extensao)) {
      this.definirErroTemporario(documento, `Tipo de arquivo inválido. Aceitos: ${this.tiposPermitidos.join(', ')}`);
      return false;
    }

    // Validar tamanho
    if (arquivo.size > this.tamanhoMaximo) {
      this.definirErroTemporario(documento, `Arquivo muito grande. Tamanho máximo: ${this.formatarTamanho(this.tamanhoMaximo)}`);
      return false;
    }

    this.limparErroTemporario(documento);
    documento.erro = undefined;
    return true;
  }

  /**
   * Manipula a seleção de arquivo e integra ao CedenteDataService
   */
  async onArquivoSelecionado(event: any, documento: Documento): Promise<void> {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files && input.files[0];
    if (!arquivo) return;

    if (!this.validarArquivo(arquivo, documento)) {
      input.value = '';
      return;
    }

    const tipoArquivo = this.obterTipoArquivo(arquivo);

    documento.arquivo = arquivo;
    documento.nomeArquivo = arquivo.name;
    documento.tipoArquivo = tipoArquivo;
    documento.tamanhoArquivo = this.formatarTamanho(arquivo.size);
    documento.dataUpload = new Date();
    this.limparErroTemporario(documento);
    documento.erro = undefined;

    try {
      const base64 = await this.fileToBase64(arquivo);

      const arquivoPayload = {
        document_type: documento.id,
        original_name: arquivo.name,
        type: tipoArquivo,
        mime_type: (arquivo.type || '').toLowerCase(),
        extensao: (arquivo.name.split('.').pop() || '').toLowerCase(),
        tamanho: arquivo.size,
        content_base64: base64
      };

      this.cedenteDataService.adicionarOuAtualizarArquivo(arquivoPayload);
      this.mensagemPendencia = '';
    } catch (err) {
      this.definirErroTemporario(documento, 'Falha ao ler arquivo. Tente novamente.');
      console.error('Erro conversão Base64:', err);
    } finally {
      input.value = '';
    }
  }

  private definirErroTemporario(documento: Documento, mensagem: string): void {
    const chave = String(documento.id);

    if (this.errosTemporariosTimers[chave]) {
      clearTimeout(this.errosTemporariosTimers[chave]);
    }

    documento.erro = mensagem;
    this.exibirNotificacao(mensagem);

    this.errosTemporariosTimers[chave] = setTimeout(() => {
      documento.erro = undefined;
      delete this.errosTemporariosTimers[chave];
    }, this.duracaoErroVisualMs);
  }

  private limparErroTemporario(documento: Documento): void {
    const chave = String(documento.id);

    if (this.errosTemporariosTimers[chave]) {
      clearTimeout(this.errosTemporariosTimers[chave]);
      delete this.errosTemporariosTimers[chave];
    }
  }

  private exibirNotificacao(mensagem: string): void {
    this.snackBar.open(mensagem, '', {
      duration: 2500
    });
  }

  /**
   * Remove o arquivo anexado localmente e no serviço
   */
  removerArquivo(documento: Documento): void {
    this.cedenteDataService.removerArquivoPorTipoDocumento(documento.id as any);
    this.limparErroTemporario(documento);

    documento.arquivo = undefined;
    documento.nomeArquivo = undefined;
    documento.tipoArquivo = undefined;
    documento.tamanhoArquivo = undefined;
    documento.dataUpload = undefined;
    documento.erro = undefined;
    this.mensagemPendencia = '';
  }

  /**
   * Abre o diálogo para trocar arquivo
   */
  trocarArquivo(input: HTMLInputElement): void {
    input.click();
  }
}

