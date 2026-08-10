import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthService } from '../login/auth.service';
import { FundStateService } from '../cadastro-cedentes/fund-state.service';

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
  visualizacaoUrl: string | null = null;
  visualizacaoUrlSegura: SafeResourceUrl | null = null;
  visualizacaoMimeType = 'application/octet-stream';
  podeGerenciarAprovacao = false;

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

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private auth: AuthService,
    private route: ActivatedRoute,
    private fundState: FundStateService
  ) { }

  ngOnInit() {
    this.definirPermissaoAprovacao();
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

  async visualizarDocumento(documento: DocumentoCedenteView): Promise<void> {
    const arquivoId = documento && documento.original && documento.original.id;
    const mimeType = this.resolverMimeType(documento);

    if (arquivoId !== null && arquivoId !== undefined && arquivoId !== '') {
      const visualizacaoUrl = `${environment.api}/cedente-files/view/${arquivoId}`;
      this.abrirModalDocumento(documento, visualizacaoUrl, mimeType);
      return;
    }

    const arquivoUrl = await this.obterUrlDocumento(documento);

    if (!arquivoUrl) {
      console.warn('Não foi possível visualizar documento anexado.', documento && documento.original);
      return;
    }

    this.abrirModalDocumento(documento, arquivoUrl, mimeType);
  }

  fecharVisualizacao(): void {
    if (this.visualizacaoUrl && this.visualizacaoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.visualizacaoUrl);
    }

    this.visualizacaoUrl = null;
    this.visualizacaoUrlSegura = null;
    this.visualizacaoMimeType = 'application/octet-stream';

    this.documentosCedente = this.documentosCedente.map((item: DocumentoCedenteView) => ({
      ...item,
      aberto: false
    }));
  }

  isPreviewImagem(): boolean {
    return this.visualizacaoMimeType.startsWith('image/');
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

  async baixarDocumento(documento: DocumentoCedenteView): Promise<void> {
    const arquivoId = documento && documento.original && documento.original.id;

    if (arquivoId !== null && arquivoId !== undefined && arquivoId !== '') {
      const fundId = this.obterFundId(documento);

      if (!fundId) {
        console.warn('fund_id não encontrado para download do documento.', documento && documento.original);
        return;
      }

      const queryAccess = this.auth.queryAccess();
      const downloadUrl = `${environment.api}/cedentes/arquivos/download/${arquivoId}?${queryAccess}&fund_id=${encodeURIComponent(fundId)}`;
      window.open(downloadUrl, '_blank');
      return;
    }

    const arquivoUrl = await this.obterUrlDocumento(documento);

    if (!arquivoUrl) {
      console.warn('Não foi possível baixar documento anexado.', documento.original);
      return;
    }

    const anchor = document.createElement('a');
    anchor.href = arquivoUrl;
    anchor.download = documento.nomeArquivo || 'documento';
    anchor.target = '_blank';
    anchor.rel = 'noopener';
    anchor.click();
  }

  baixarTodosDocumentos(): void {
    const cedenteId = this.obterCedenteId();
    const fundId = this.obterFundId();

    if (!cedenteId) {
      console.warn('ID do cedente não encontrado para download de todos os documentos.');
      return;
    }

    if (!fundId) {
      console.warn('fund_id não encontrado para download de todos os documentos.');
      return;
    }

    const queryAccess = this.auth.queryAccess();
    const downloadAllUrl = `${environment.api}/cedentes/arquivos/download-all/${cedenteId}?${queryAccess}&fund_id=${encodeURIComponent(fundId)}`;
    window.open(downloadAllUrl, '_blank');
  }

  uploadDocumento(documento: DocumentoCedenteView): void {
    console.info('Upload pendente de implementação para o documento:', documento);
  }

  private definirPermissaoAprovacao(): void {
    const roleId = this.obterCedenteRoleId();
    this.podeGerenciarAprovacao = roleId === null || roleId === 2 || roleId === 3;
  }

  private obterCedenteRoleId(): number | null {
    const usuario = this.auth.currentUser() as any;

    const roleTopLevel = usuario && usuario.cedente_role && usuario.cedente_role.id;
    const roleEmployee = usuario && usuario.employee && usuario.employee.cedente_role && usuario.employee.cedente_role.id;
    const roleRaw = roleTopLevel != null ? roleTopLevel : roleEmployee;

    if (roleRaw === null || roleRaw === undefined || roleRaw === '') {
      return null;
    }

    const roleId = Number(roleRaw);
    return Number.isNaN(roleId) ? null : roleId;
  }

  private abrirModalDocumento(documento: DocumentoCedenteView, url: string, mimeType: string): void {
    this.visualizacaoUrl = url;
    this.visualizacaoUrlSegura = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.visualizacaoMimeType = mimeType;

    this.documentosCedente = this.documentosCedente.map((item: DocumentoCedenteView) => ({
      ...item,
      aberto: item.id === documento.id
    }));
  }

  private obterCedenteId(): string | null {
    const id = this.cedente && (
      this.cedente.id ||
      this.cedente.cedente_id ||
      this.cedente.cedenteId
    );

    if (id === null || id === undefined || id === '') {
      return null;
    }

    return String(id);
  }

  private obterFundId(documento?: DocumentoCedenteView): string | null {
    const doDocumento = documento && documento.original && (
      documento.original.fund_id ||
      documento.original.fundo_id ||
      documento.original.fundId
    );

    const doCedente = this.cedente && (
      this.cedente.fund_id ||
      this.cedente.fundo_id ||
      this.cedente.fundId ||
      (this.cedente.fund && this.cedente.fund.id)
    );

    const daRota = this.route.snapshot.queryParamMap.get('fund_id');
    const doEstadoGlobal = this.fundState.currentFundId;

    const valor = doDocumento || doCedente || daRota || doEstadoGlobal;

    if (valor === null || valor === undefined || valor === '') {
      return null;
    }

    return String(valor);
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

  private async obterUrlDocumento(documento: DocumentoCedenteView): Promise<string | null> {
    const original = documento && documento.original ? documento.original : {};

    const urlDireta = this.obterUrlDireta(original);
    if (urlDireta) {
      return urlDireta;
    }

    const base64 = this.obterBase64(original);
    if (base64) {
      return `data:${this.resolverMimeType(documento)};base64,${base64}`;
    }

    const blob = await this.obterBlobPorEndpoint(original);
    if (!blob) {
      return null;
    }

    return URL.createObjectURL(blob);
  }

  private obterUrlDireta(original: any): string | null {
    const candidatos = [
      original && original.url,
      original && original.download_url,
      original && original.file_url,
      original && original.public_url,
      original && original.path,
      original && original.name
    ].filter((item: any) => !!item);

    for (const candidato of candidatos) {
      const texto = String(candidato).trim();
      if (!texto) {
        continue;
      }

      if (/^https?:\/\//i.test(texto) || texto.startsWith('data:') || texto.startsWith('blob:')) {
        return texto;
      }

      if (texto.startsWith('/')) {
        return `${environment.api}${texto}`;
      }

      // Fallback comum para arquivos retornados só com hash/nome.
      return `${environment.api}/storage/${texto}`;
    }

    return null;
  }

  private obterBase64(original: any): string {
    return (
      original && (
        original.content_base64 ||
        original.base64 ||
        original.arquivo_base64 ||
        original.file_base64 ||
        original.conteudo_base64 ||
        original.binary_base64 ||
        ''
      )
    ) || '';
  }

  private async obterBlobPorEndpoint(original: any): Promise<Blob | null> {
    const id = original && original.id != null ? String(original.id) : '';
    const name = original && original.name ? String(original.name) : '';
    const encodedName = name ? encodeURIComponent(name) : '';

    const endpoints = [
      id ? `${environment.api}/cedente-files/download/${id}` : '',
      id ? `${environment.api}/cedente-file/download/${id}` : '',
      id ? `${environment.api}/cedente_files/download/${id}` : '',
      id ? `${environment.api}/cedente/arquivo/download/${id}` : '',
      encodedName ? `${environment.api}/cedente-files/download-by-name/${encodedName}` : ''
    ].filter((item: string) => !!item);

    for (const endpoint of endpoints) {
      try {
        const blob = await this.http.get(endpoint, { responseType: 'blob' }).toPromise();
        if (blob && blob.size > 0) {
          return blob;
        }
      } catch (_) {
        // tenta o próximo endpoint
      }
    }

    return null;
  }

  private resolverMimeType(documento: DocumentoCedenteView): string {
    const tipo = String((documento && documento.original && (documento.original.mime_type || documento.original.type || documento.original.file_type)) || '').toLowerCase();
    const nome = String((documento && documento.nomeArquivo) || '').toLowerCase();

    if (tipo === 'pdf' || tipo.includes('pdf') || nome.endsWith('.pdf')) {
      return 'application/pdf';
    }

    if (tipo === 'imagepng') {
      return 'image/png';
    }

    if (tipo === 'imagejpeg' || tipo === 'imagejpg') {
      return 'image/jpeg';
    }

    if (tipo.startsWith('image/')) {
      return tipo;
    }

    if (nome.endsWith('.png')) {
      return 'image/png';
    }

    if (nome.endsWith('.jpg') || nome.endsWith('.jpeg')) {
      return 'image/jpeg';
    }

    return 'application/octet-stream';
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
