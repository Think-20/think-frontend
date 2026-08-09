import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

type StatusDocumento = 'validar' | 'pendente' | 'aprovado';

interface DocumentoCedenteView {
  id: string;
  titulo: string;
  nomeArquivo: string;
  tamanhoLabel: string;
  dataEnvioLabel: string;
  status: StatusDocumento;
  aberto: boolean;
  original: any;
}

@Component({
  selector: 'cb-doc-cedente-info',
  templateUrl: './doc-cedente-info.component.html',
  styleUrls: ['./doc-cedente-info.component.css']
})
export class DocCedenteInfoComponent implements OnInit {
  @Input() cedente: any;

  documentosCedente: DocumentoCedenteView[] = [];

  private readonly titulosPorTipo: { [key: string]: string } = {
    '1': 'Contrato/Estatuto Social',
    '2': 'Certidão Simplificada da Junta Comercial',
    '3': 'Ata de Eleição da Diretoria',
    '4': 'Cartão CNPJ',
    '5': 'Parecer de Compliance/Reputacional',
    '6': 'Demonstração Financeira',
    '7': 'Ata/Parecer de Crédito',
    '8': 'Consulta aos Órgãos de Proteção de Crédito',
    '9': 'Relatório de Visita',
    '10': 'Parecer da Gestora',
    '11': 'Comprovante de Endereço',
    '12': 'Contrato Social Cedente',
    '13': 'Comprovante de Vínculo'
  };

  constructor() { }

  ngOnInit() {
    this.carregarDocumentosDoCedente();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.cedente) {
      this.carregarDocumentosDoCedente();
    }
  }

  get totalDocumentos(): number {
    return this.documentosCedente.length;
  }

  get documentoAberto(): DocumentoCedenteView | null {
    return this.documentosCedente.find((item: DocumentoCedenteView) => item.aberto) || null;
  }

  toggleVisualizacao(documento: DocumentoCedenteView): void {
    this.documentosCedente = this.documentosCedente.map((item: DocumentoCedenteView) => ({
      ...item,
      aberto: item.id === documento.id ? !item.aberto : false
    }));
  }

  fecharVisualizacao(): void {
    this.documentosCedente = this.documentosCedente.map((item: DocumentoCedenteView) => ({
      ...item,
      aberto: false
    }));
  }

  getStatusLabel(status: StatusDocumento): string {
    if (status === 'pendente') {
      return 'Pendente';
    }

    if (status === 'aprovado') {
      return 'Aprovado';
    }

    return 'Validar';
  }

  extrairNomeResponsavel(documento: DocumentoCedenteView): string {
    return (
      documento.original && (
        documento.original.responsavel_nome ||
        documento.original.responsavel ||
        documento.original.updated_by_name ||
        documento.original.created_by_name ||
        documento.original.usuario_nome
      )
    ) || 'Não informado';
  }

  extrairDescricao(documento: DocumentoCedenteView): string {
    return (
      documento.original && (
        documento.original.descricao ||
        documento.original.description ||
        documento.original.observacao ||
        documento.original.observacao_validacao
      )
    ) || 'Documento anexado no cadastro do cedente.';
  }

  extrairRazaoSocial(documento: DocumentoCedenteView): string {
    return (
      documento.original && (
        documento.original.razao_social ||
        documento.original.company_name ||
        documento.original.empresa_nome
      )
    ) || (this.cedente && (this.cedente.razao_social || this.cedente.company_name || this.cedente.name)) || 'Não informado';
  }

  extrairCnpj(documento: DocumentoCedenteView): string {
    return (
      documento.original && (
        documento.original.cnpj ||
        documento.original.documento ||
        documento.original.cnpj_numero
      )
    ) || (this.cedente && (this.cedente.cnpj || this.cedente.documento)) || 'Não informado';
  }

  extrairDataEmissao(documento: DocumentoCedenteView): string {
    const data =
      documento.original && (
        documento.original.data_emissao ||
        documento.original.issue_date ||
        documento.original.created_at
      );

    return this.formatarData(data);
  }

  extrairValidade(documento: DocumentoCedenteView): string {
    const data =
      documento.original && (
        documento.original.validade ||
        documento.original.data_validade ||
        documento.original.expiration_date
      );

    if (!data) {
      return 'Não informado';
    }

    return this.formatarData(data);
  }

  extrairCategoria(documento: DocumentoCedenteView): string {
    return (
      documento.original && (
        documento.original.categoria ||
        documento.original.category ||
        documento.original.tipo_documento_nome ||
        documento.original.document_type_name
      )
    ) || 'Documento Cedente';
  }

  extrairContato(documento: DocumentoCedenteView): string {
    return (
      documento.original && (
        documento.original.contato ||
        documento.original.email ||
        documento.original.contact
      )
    ) || (this.cedente && (this.cedente.email || this.cedente.contato_email)) || 'Não informado';
  }

  aprovarDocumento(documento: DocumentoCedenteView): void {
    this.alterarStatusLocal(documento.id, 'aprovado');
  }

  recusarDocumento(documento: DocumentoCedenteView): void {
    this.alterarStatusLocal(documento.id, 'pendente');
  }

  baixarDocumento(documento: DocumentoCedenteView): void {
    const url = documento.original && (documento.original.url || documento.original.download_url || documento.original.file_url);

    if (url) {
      window.open(url, '_blank');
      return;
    }

    console.warn('URL de download não disponível para o documento:', documento.original);
  }

  uploadDocumento(documento: DocumentoCedenteView): void {
    console.info('Upload pendente de implementação para o documento:', documento);
  }

  private carregarDocumentosDoCedente(): void {
    const arquivosCedente = this.obterArquivosCedente(this.cedente);

    this.documentosCedente = arquivosCedente.map((arquivo: any, index: number) => {
      const documentType = this.normalizarTipoDocumento(arquivo && (arquivo.document_type || arquivo.tipo_documento || arquivo.id));
      const status = this.normalizarStatus(arquivo && (arquivo.status || arquivo.status_validacao || arquivo.validation_status));
      const dataReferencia = arquivo && (arquivo.updated_at || arquivo.created_at || arquivo.data_envio || arquivo.data_upload);
      const tamanho = Number(arquivo && (arquivo.tamanho || arquivo.size || 0));

      return {
        id: `${documentType}-${index}`,
        titulo: this.obterTituloDocumento(documentType, arquivo),
        nomeArquivo: (arquivo && (arquivo.original_name || arquivo.nome_original || arquivo.name)) || 'Arquivo sem nome',
        tamanhoLabel: this.formatarTamanho(tamanho),
        dataEnvioLabel: this.formatarData(dataReferencia),
        status,
        aberto: false,
        original: arquivo
      };
    });
  }

  private obterArquivosCedente(cedente: any): any[] {
    if (!cedente) {
      return [];
    }

    if (Array.isArray(cedente.cedente_files)) {
      return cedente.cedente_files;
    }

    if (Array.isArray(cedente.arquivos)) {
      return cedente.arquivos;
    }

    return [];
  }

  private obterTituloDocumento(documentType: string, arquivo: any): string {
    if (this.titulosPorTipo[documentType]) {
      return this.titulosPorTipo[documentType];
    }

    return (
      arquivo && (
        arquivo.document_name ||
        arquivo.nome_documento ||
        arquivo.document_type_name
      )
    ) || 'Documento do Cedente';
  }

  private normalizarTipoDocumento(documentType: any): string {
    if (documentType === null || typeof documentType === 'undefined') {
      return '';
    }

    const texto = String(documentType).trim();

    if (/^\d+$/.test(texto)) {
      return String(Number(texto));
    }

    return texto;
  }

  private normalizarStatus(status: any): StatusDocumento {
    const valor = String(status || '').trim().toLowerCase();

    if (valor === 'aprovado' || valor === 'approved') {
      return 'aprovado';
    }

    if (valor === 'pendente' || valor === 'pending') {
      return 'pendente';
    }

    return 'validar';
  }

  private formatarData(data: any): string {
    if (!data) {
      return 'Data não informada';
    }

    const parsed = new Date(data);
    if (Number.isNaN(parsed.getTime())) {
      return 'Data não informada';
    }

    return parsed.toLocaleDateString('pt-BR');
  }

  private formatarTamanho(bytes: number): string {
    if (!bytes || bytes <= 0) {
      return 'Tamanho não informado';
    }

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const tamanho = bytes / Math.pow(k, i);

    return `${Math.round(tamanho * 100) / 100} ${sizes[i]}`;
  }

  private alterarStatusLocal(documentoId: string, status: StatusDocumento): void {
    this.documentosCedente = this.documentosCedente.map((item: DocumentoCedenteView) => {
      if (item.id !== documentoId) {
        return item;
      }

      return {
        ...item,
        status
      };
    });
  }

}
