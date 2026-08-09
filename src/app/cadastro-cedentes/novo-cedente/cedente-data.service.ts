import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface CedenteData {
  nome: string;
  documento: string;
  email: string;
  faturamento_anual: number | null;
  minimo_assinantes: number | null;
  sistema_financeiro_nacional: boolean;
  telefone: string;
  endereco: {
    cep: string;
    logradouro: string;
    rua?: string;
    numero: string;
    complemento: string;
    bairro: string;
    estado: string;
    cidade: string;
    pais: string;
  };
  partes_relacionadas: any[];
  avalistas: any[];
  contas_desembolso: any[];
  arquivos: any[];
}

type PessoaDocumentoTipo = 'parte_relacionada' | 'avalista';

interface CedenteStorageState {
  dados: CedenteData;
  fundId: string | null;
  cedenteId: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CedenteDataService {

  private readonly documentosCedentePorTipo: { [key: string]: number } = {
    '1': 1,
    'contrato/estatuto social': 1,
    '2': 2,
    'certidao simplificada da junta comercial': 2,
    'certidão simplificada da junta comercial': 2,
    '3': 3,
    'ata de eleicao da diretoria': 3,
    'ata de eleição da diretoria': 3,
    '4': 4,
    'cartao cnpj': 4,
    'cartão cnpj': 4,
    '5': 5,
    'parecer de compliance/reputacional': 5,
    '6': 6,
    'demonstracao financeira': 6,
    'demonstração financeira': 6,
    '7': 7,
    'ata/parecer de credito': 7,
    'ata/parecer de crédito': 7,
    '8': 8,
    'consulta aos orgaos de protecao de credito': 8,
    'consulta aos órgãos de proteção de crédito': 8,
    '9': 9,
    'relatorio de visita': 9,
    'relatório de visita': 9,
    '10': 10,
    'parecer da gestora': 10,
    '11': 11,
    'comprovante de endereco': 11,
    'comprovante de endereço': 11,
    '12': 12,
    'contrato social cedente': 12,
    '13': 13,
    'comprovante de vinculo': 13,
    'comprovante de vínculo': 13
  };

  private readonly STORAGE_KEY = 'cedente_form_data';

  private cedenteData: CedenteData = this.obterDadosInicial();
  private fundId: string | null = null;
  private cedenteId: string | null = null;

  private cedenteDataSubject = new BehaviorSubject<CedenteData>(JSON.parse(JSON.stringify(this.cedenteData)));
  cedenteData$: Observable<CedenteData> = this.cedenteDataSubject.asObservable();

  private gerarChaveInterna(prefixo: string): string {
    return `${prefixo}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  private garantirChaveInterna(item: any, tipo: PessoaDocumentoTipo): any {
    if (!item || typeof item !== 'object') {
      return item;
    }

    if (item.__documentacaoKey) {
      return item;
    }

    const prefixo = tipo === 'parte_relacionada' ? 'parte' : 'avalista';

    return {
      ...item,
      __documentacaoKey: this.gerarChaveInterna(prefixo)
    };
  }

  private removerChaveInterna(item: any): any {
    if (!item || typeof item !== 'object') {
      return item;
    }

    const clone = { ...item };
    delete clone.__documentacaoKey;
    return clone;
  }

  private normalizarColecaoPessoas(items: any[], tipo: PessoaDocumentoTipo): any[] {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.map((item: any) => this.garantirChaveInterna(item, tipo));
  }

  private normalizarChaveDocumento(documentType: any): string {
    if (documentType === null || typeof documentType === 'undefined') {
      return '';
    }

    const texto = String(documentType).trim();

    if (/^\d+$/.test(texto)) {
      return String(Number(texto));
    }

    return texto;
  }

  private arquivosSaoDoMesmoDocumento(arquivoAtual: any, novoArquivo: any): boolean {
    return this.normalizarChaveDocumento(arquivoAtual && arquivoAtual.document_type) ===
      this.normalizarChaveDocumento(novoArquivo && novoArquivo.document_type);
  }

  private removerArquivosPorChaveParcial(fragmento: string): void {
    if (!fragmento) {
      return;
    }

    this.cedenteData.arquivos = this.cedenteData.arquivos.filter((arquivo: any) => {
      const chaveDocumento = this.normalizarChaveDocumento(arquivo && arquivo.document_type);
      return !chaveDocumento.includes(fragmento);
    });
  }

  private normalizarDadosCarregados(dados: CedenteData): CedenteData {
    return {
      ...dados,
      endereco: {
        cep: '',
        logradouro: '',
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        estado: '',
        cidade: '',
        pais: 'Brasil',
        ...(dados && dados.endereco ? dados.endereco : {})
      },
      partes_relacionadas: this.normalizarColecaoPessoas(dados && dados.partes_relacionadas, 'parte_relacionada'),
      avalistas: this.normalizarColecaoPessoas(dados && dados.avalistas, 'avalista'),
      contas_desembolso: Array.isArray(dados && dados.contas_desembolso) ? dados.contas_desembolso : [],
      arquivos: Array.isArray(dados && dados.arquivos) ? dados.arquivos : []
    };
  }

  setFundId(id: string | null) {
    this.fundId = id;
    this.persistirDados();
  }

  getFundId(): string | null {
    return this.fundId;
  }

  setCedenteId(id: string | null) {
    this.cedenteId = id;
    this.persistirDados();
  }

  getCedenteId(): string | null {
    return this.cedenteId;
  }
  
  constructor() { }

  private normalizarTipoDocumento(documentType: any, arquivo?: any): number | string | null {
    const candidatos = [
      documentType,
      arquivo && arquivo.document_type,
      arquivo && arquivo.tipo_documento,
      arquivo && arquivo.document_name,
      arquivo && arquivo.nome_documento,
      arquivo && arquivo.name,
      arquivo && arquivo.original_name,
      arquivo && arquivo.nome_original
    ];

    for (const candidato of candidatos) {
      if (candidato === null || typeof candidato === 'undefined') {
        continue;
      }

      const texto = String(candidato).trim();
      const numero = Number(texto);

      if (!Number.isNaN(numero) && this.documentosCedentePorTipo[String(numero)]) {
        return numero;
      }

      const chave = texto.toLocaleLowerCase();
      if (this.documentosCedentePorTipo[chave]) {
        return this.documentosCedentePorTipo[chave];
      }

      if (texto) {
        return texto;
      }
    }

    return null;
  }

  private extrairContentBase64(arquivo: any): string {
    return (
      arquivo && (
        arquivo.content_base64 ||
        arquivo.base64 ||
        arquivo.arquivo_base64 ||
        arquivo.file_base64 ||
        arquivo.conteudo_base64 ||
        arquivo.data_base64 ||
        arquivo.binary_base64 ||
        ''
      )
    );
  }

  private isDocumentTypeValidoParaApi(documentType: any): boolean {
    const numero = Number(documentType);
    return Number.isInteger(numero) && numero >= 1 && numero <= 13;
  }

  private obterExtensaoArquivo(arquivo: any): string {
    const nome = (arquivo && (arquivo.original_name || arquivo.nome_original || arquivo.name)) || '';
    const extensao = nome.includes('.') ? nome.split('.').pop() : '';
    return String(extensao || arquivo && arquivo.extensao || '').toLowerCase();
  }

  private normalizarTipoArquivoParaPayload(arquivo: any): string {
    const tipoAtual = String((arquivo && (arquivo.type || arquivo.mime_type)) || '').toLowerCase();
    const extensao = this.obterExtensaoArquivo(arquivo);

    if (extensao === 'pdf' || tipoAtual.includes('pdf')) {
      return 'pdf';
    }

    if (tipoAtual) {
      return tipoAtual;
    }

    return extensao;
  }

  private normalizarArquivosParaPayload(): any[] {
    return (this.cedenteData.arquivos || [])
      .map((arquivo: any) => {
        const documentType = this.normalizarTipoDocumento(
          arquivo && arquivo.document_type,
          arquivo
        );
        const documentTypeNumerico = Number(documentType);
        const contentBase64 = this.extrairContentBase64(arquivo);
        const mimeType = String((arquivo && (arquivo.mime_type || arquivo.type)) || '').toLowerCase();
        const extensao = this.obterExtensaoArquivo(arquivo);

        return {
          document_type: documentTypeNumerico,
          original_name: (arquivo && (arquivo.original_name || arquivo.nome_original || arquivo.name)) || '',
          type: this.normalizarTipoArquivoParaPayload(arquivo),
          mime_type: mimeType,
          extensao,
          tamanho: (arquivo && (arquivo.tamanho || arquivo.size)) || 0,
          content_base64: contentBase64,
          // Mantem compatibilidade com validadores que aceitam "base64".
          base64: contentBase64
        };
      })
      .filter((arquivo: any) => this.isDocumentTypeValidoParaApi(arquivo.document_type) && !!arquivo.content_base64);
  }

  carregarCedenteExistente(cedente: any, fundId?: string | null): void {
    if (typeof fundId !== 'undefined') {
      this.fundId = fundId;
    }

    this.cedenteId = cedente && cedente.id != null ? String(cedente.id) : null;

    const endereco = cedente && cedente.endereco
      ? cedente.endereco
      : {
          cep: cedente && cedente.cep,
          logradouro: cedente && (cedente.logradouro || cedente.rua),
          rua: cedente && (cedente.rua || cedente.logradouro),
          numero: cedente && cedente.numero,
          complemento: cedente && cedente.complemento,
          bairro: cedente && cedente.bairro,
          estado: cedente && cedente.estado,
          cidade: cedente && cedente.cidade,
          pais: cedente && cedente.pais
        };
    const arquivosOriginais = cedente && Array.isArray(cedente.arquivos)
      ? cedente.arquivos
      : cedente && Array.isArray(cedente.cedente_files)
        ? cedente.cedente_files
        : [];

    this.cedenteData = {
      nome: cedente && cedente.nome ? cedente.nome : '',
      documento: cedente && cedente.documento ? cedente.documento : '',
      email: cedente && cedente.email ? cedente.email : '',
      faturamento_anual: cedente && cedente.faturamento_anual != null ? Number(cedente.faturamento_anual) : null,
      minimo_assinantes: cedente && cedente.minimo_assinantes != null ? Number(cedente.minimo_assinantes) : null,
      sistema_financeiro_nacional: !!(cedente && cedente.sistema_financeiro_nacional),
      telefone: cedente && cedente.telefone ? cedente.telefone : '',
      endereco: {
        cep: endereco.cep || '',
        logradouro: endereco.logradouro || endereco.rua || '',
        rua: endereco.rua || endereco.logradouro || '',
        numero: endereco.numero || '',
        complemento: endereco.complemento || '',
        bairro: endereco.bairro || '',
        estado: endereco.estado || '',
        cidade: endereco.cidade || '',
        pais: endereco.pais || 'Brasil'
      },
      partes_relacionadas: this.normalizarColecaoPessoas(cedente && cedente.partes_relacionadas, 'parte_relacionada'),
      avalistas: this.normalizarColecaoPessoas(cedente && cedente.avalistas, 'avalista'),
      contas_desembolso: Array.isArray(cedente && cedente.contas_desembolso) ? [...cedente.contas_desembolso] : [],
      arquivos: arquivosOriginais.map((arquivo: any) => ({
        document_type: this.normalizarTipoDocumento(arquivo.document_type || arquivo.tipo_documento || arquivo.id, arquivo),
        original_name: arquivo.original_name || arquivo.nome_original || arquivo.name || '',
        type: arquivo.type || arquivo.mime_type || '',
        mime_type: arquivo.mime_type || arquivo.type || '',
        extensao: this.obterExtensaoArquivo(arquivo),
        tamanho: arquivo.tamanho || arquivo.size || 0,
        content_base64: this.extrairContentBase64(arquivo)
      })).filter((arquivo: any) => arquivo.document_type != null)
    };

    this.notificarMudancas();
  }

  /**
   * Obtém dados iniciais do localStorage ou estado padrão
   */
  private obterDadosInicial(): CedenteData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);

        if (parsed && parsed.dados) {
          this.fundId = parsed.fundId || null;
          this.cedenteId = parsed.cedenteId || null;
          return this.normalizarDadosCarregados(parsed.dados);
        }

        return this.normalizarDadosCarregados(parsed);
      }
    } catch (err) {
      console.warn('Erro ao recuperar dados do localStorage:', err);
    }
    return this.obterEstruturaPadrao();
  }

  /**
   * Retorna a estrutura padrão de dados
   */
  private obterEstruturaPadrao(): CedenteData {
    return {
      nome: '',
      documento: '',
      email: '',
      faturamento_anual: null,
      minimo_assinantes: null,
      sistema_financeiro_nacional: false,
      telefone: '',
      endereco: {
        cep: '',
        logradouro: '',
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        estado: '',
        cidade: '',
        pais: 'Brasil'
      },
      partes_relacionadas: [],
      avalistas: [],
      contas_desembolso: [],
      arquivos: []
    };
  }

  /**
   * Persiste dados no localStorage
   */
  private persistirDados(): void {
    try {
      const storageState: CedenteStorageState = {
        dados: this.cedenteData,
        fundId: this.fundId,
        cedenteId: this.cedenteId
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storageState));
    } catch (err) {
      console.error('Erro ao persistir dados no localStorage:', err);
    }
  }

  /**
   * Notifica subscribers sobre mudanças
   */
  private notificarMudancas(): void {
    this.persistirDados();
    this.cedenteDataSubject.next(JSON.parse(JSON.stringify(this.cedenteData)));
  }

  // ===== DADOS GERAIS =====

  /**
   * Atualizar dados gerais do cedente
   */
  atualizarDadosGerais(dados: Partial<Omit<CedenteData, 'endereco' | 'partes_relacionadas' | 'avalistas' | 'contas_desembolso' | 'arquivos'>>) {
    this.cedenteData = {
      ...this.cedenteData,
      ...dados
    };
    this.notificarMudancas();
  }

  /**
   * Atualizar endereço
   */
  atualizarEndereco(endereco: Partial<CedenteData['endereco']>) {
    this.cedenteData.endereco = {
      ...this.cedenteData.endereco,
      ...endereco
    };
    this.notificarMudancas();
  }

  // ===== PARTES RELACIONADAS =====
/* Adicionar parte relacionada*/

adicionarParteRelacionada(parte: any): number {

  if (!parte || Object.keys(parte).length === 0) {
    console.warn('Tentativa de adicionar parte relacionada vazia');
    return -1;
  }

  this.cedenteData.partes_relacionadas.push(this.garantirChaveInterna(parte, 'parte_relacionada'));

  this.notificarMudancas();

  return this.cedenteData.partes_relacionadas.length - 1;
}
  /**
   * Atualizar parte relacionada
   */
  atualizarParteRelacionada(index: number, parte: any): boolean {
    if (index < 0 || index >= this.cedenteData.partes_relacionadas.length) {
      console.error(`Índice inválido para parte relacionada: ${index}`);
      return false;
    }

    const parteAtual = this.cedenteData.partes_relacionadas[index];
    this.cedenteData.partes_relacionadas[index] = this.garantirChaveInterna({
      ...parte,
      __documentacaoKey: parte && parte.__documentacaoKey ? parte.__documentacaoKey : parteAtual && parteAtual.__documentacaoKey
    }, 'parte_relacionada');
    this.notificarMudancas();
    return true;
  }

  /**
   * Remover parte relacionada
   */
  removerParteRelacionada(index: number): boolean {
    if (index < 0 || index >= this.cedenteData.partes_relacionadas.length) {
      console.error(`Índice inválido para remoção de parte relacionada: ${index}`);
      return false;
    }

    const parte = this.cedenteData.partes_relacionadas[index];
    const chave = parte && parte.__documentacaoKey ? `parte_relacionada::${parte.__documentacaoKey}::` : '';
    this.removerArquivosPorChaveParcial(chave);

    this.cedenteData.partes_relacionadas.splice(index, 1);
    this.notificarMudancas();
    return true;
  }

  /**
   * Obter partes relacionadas
   */
  obterPartesRelacionadas(): any[] {
    return [...this.cedenteData.partes_relacionadas];
  }

  // ===== AVALISTAS =====

  /**
   * Adicionar avalista
   */
  adicionarAvalista(avalista: any): number {
    if (!avalista || Object.keys(avalista).length === 0) {
      console.warn('Tentativa de adicionar avalista vazio');
      return -1;
    }
    this.cedenteData.avalistas.push(this.garantirChaveInterna(avalista, 'avalista'));
    this.notificarMudancas();
    return this.cedenteData.avalistas.length - 1;
  }

  /**
   * Atualizar avalista
   */
  atualizarAvalista(index: number, avalista: any): boolean {
    if (index < 0 || index >= this.cedenteData.avalistas.length) {
      console.error(`Índice inválido para avalista: ${index}`);
      return false;
    }

    const avalistaAtual = this.cedenteData.avalistas[index];
    this.cedenteData.avalistas[index] = this.garantirChaveInterna({
      ...avalista,
      __documentacaoKey: avalista && avalista.__documentacaoKey ? avalista.__documentacaoKey : avalistaAtual && avalistaAtual.__documentacaoKey
    }, 'avalista');
    this.notificarMudancas();
    return true;
  }

  /**
   * Remover avalista
   */
  removerAvalista(index: number): boolean {
    if (index < 0 || index >= this.cedenteData.avalistas.length) {
      console.error(`Índice inválido para remoção de avalista: ${index}`);
      return false;
    }

    const avalista = this.cedenteData.avalistas[index];
    const chave = avalista && avalista.__documentacaoKey ? `avalista::${avalista.__documentacaoKey}::` : '';
    this.removerArquivosPorChaveParcial(chave);

    this.cedenteData.avalistas.splice(index, 1);
    this.notificarMudancas();
    return true;
  }

  /**
   * Obter avalistas
   */
  obterAvalistas(): any[] {
    return [...this.cedenteData.avalistas];
  }

  // ===== CONTAS DE DESEMBOLSO =====

  /**
   * Adicionar conta de desembolso
   */
  adicionarContaDesembolso(conta: any): number {
    if (!conta || Object.keys(conta).length === 0) {
      console.warn('Tentativa de adicionar conta de desembolso vazia');
      return -1;
    }
    this.cedenteData.contas_desembolso.push(conta);
    this.notificarMudancas();
    return this.cedenteData.contas_desembolso.length - 1;
  }

  /**
   * Atualizar conta de desembolso
   */
  atualizarContaDesembolso(index: number, conta: any): boolean {
    if (index < 0 || index >= this.cedenteData.contas_desembolso.length) {
      console.error(`Índice inválido para conta de desembolso: ${index}`);
      return false;
    }
    this.cedenteData.contas_desembolso[index] = conta;
    this.notificarMudancas();
    return true;
  }

  /**
   * Remover conta de desembolso
   */
  removerContaDesembolso(index: number): boolean {
    if (index < 0 || index >= this.cedenteData.contas_desembolso.length) {
      console.error(`Índice inválido para remoção de conta de desembolso: ${index}`);
      return false;
    }
    this.cedenteData.contas_desembolso.splice(index, 1);
    this.notificarMudancas();
    return true;
  }

  /**
   * Obter contas de desembolso
   */
  obterContasDesembolso(): any[] {
    return [...this.cedenteData.contas_desembolso];
  }

  // ===== ARQUIVOS =====

  /**
   * Adicionar arquivo
   */
  adicionarArquivo(arquivo: any): number {
    if (!arquivo || !arquivo.document_type || !arquivo.original_name) {
      console.warn('Tentativa de adicionar arquivo inválido');
      return -1;
    }
    this.cedenteData.arquivos.push(arquivo);
    this.notificarMudancas();
    return this.cedenteData.arquivos.length - 1;
  }

  /**
   * Adiciona um arquivo novo ou substitui o já existente para o mesmo tipo de documento
   */
  adicionarOuAtualizarArquivo(arquivo: any): number {
    if (!arquivo || !arquivo.document_type || !arquivo.original_name) {
      console.warn('Tentativa de adicionar arquivo inválido');
      return -1;
    }

    const indexExistente = this.cedenteData.arquivos.findIndex(
      item => this.arquivosSaoDoMesmoDocumento(item, arquivo)
    );

    if (indexExistente >= 0) {
      this.cedenteData.arquivos[indexExistente] = arquivo;
      this.notificarMudancas();
      return indexExistente;
    }

    this.cedenteData.arquivos.push(arquivo);
    this.notificarMudancas();
    return this.cedenteData.arquivos.length - 1;
  }

  /**
   * Remover arquivo
   */
  removerArquivo(index: number): boolean {
    if (index < 0 || index >= this.cedenteData.arquivos.length) {
      console.error(`Índice inválido para remoção de arquivo: ${index}`);
      return false;
    }
    this.cedenteData.arquivos.splice(index, 1);
    this.notificarMudancas();
    return true;
  }

  /**
   * Remove arquivo pelo tipo de documento
   */
  removerArquivoPorTipoDocumento(documentType: number | string): boolean {
    const index = this.cedenteData.arquivos.findIndex(
      item => this.normalizarChaveDocumento(item.document_type) === this.normalizarChaveDocumento(documentType)
    );

    if (index < 0) {
      console.error(`Tipo de documento inválido para remoção de arquivo: ${documentType}`);
      return false;
    }

    this.cedenteData.arquivos.splice(index, 1);
    this.notificarMudancas();
    return true;
  }

  /**
   * Obter arquivos
   */
  obterArquivos(): any[] {
    return [...this.cedenteData.arquivos];
  }

  // ===== DADOS GERAIS =====

  /**
   * Obter dados atuais (cópia profunda)
   */
  obterDados(): CedenteData {
    return JSON.parse(JSON.stringify(this.cedenteData));
  }

  /**
   * Obter observable dos dados
   */
  obterDados$(): Observable<CedenteData> {
    return this.cedenteData$;
  }

  /**
   * Consolidar payload final (remove campos vazios opcionais)
   */
consolidarPayloadFinal(status?: string): any {
  const logradouro = this.cedenteData.endereco.logradouro || this.cedenteData.endereco.rua || '';
  const enderecoNormalizado = {
    ...this.cedenteData.endereco,
    logradouro,
    rua: logradouro
  };
  const payload: any = {
    fund_id: this.fundId,
    nome: this.cedenteData.nome,
    documento: this.cedenteData.documento,
    email: this.cedenteData.email,
    sistema_financeiro_nacional: this.cedenteData.sistema_financeiro_nacional,
    telefone: this.cedenteData.telefone,
    endereco: enderecoNormalizado,
    // Compatibilidade com endpoints legados que salvam endereço no root do payload.
    cep: enderecoNormalizado.cep,
    logradouro: enderecoNormalizado.logradouro,
    rua: enderecoNormalizado.rua,
    numero: enderecoNormalizado.numero,
    complemento: enderecoNormalizado.complemento,
    bairro: enderecoNormalizado.bairro,
    estado: enderecoNormalizado.estado,
    cidade: enderecoNormalizado.cidade,
    pais: enderecoNormalizado.pais
  };

  if (this.cedenteId) {
    payload.id = this.cedenteId;
  }

  if (status) {
    payload.status = status;
  }

  if (this.cedenteData.faturamento_anual) {
    payload.faturamento_anual = this.cedenteData.faturamento_anual;
  }

  if (this.cedenteData.minimo_assinantes) {
    payload.minimo_assinantes = this.cedenteData.minimo_assinantes;
  }

  // Arrays com cedente_id
  payload.partes_relacionadas = this.cedenteData.partes_relacionadas.map((p: any) => {
    const parteNormalizada = this.removerChaveInterna(p);
    return this.cedenteId ? { ...parteNormalizada, cedente_id: this.cedenteId } : { ...parteNormalizada };
  });

  payload.avalistas = this.cedenteData.avalistas.map((a: any) => {
    const avalistaNormalizado = this.removerChaveInterna(a);
    return this.cedenteId ? { ...avalistaNormalizado, cedente_id: this.cedenteId } : { ...avalistaNormalizado };
  });

  payload.contas_desembolso = this.cedenteData.contas_desembolso.map(c => (
    this.cedenteId ? { ...c, cedente_id: this.cedenteId } : { ...c }
  ));

  const arquivosParaPayload = this.normalizarArquivosParaPayload().map((arquivo: any) => (
    this.cedenteId ? { ...arquivo, cedente_id: this.cedenteId } : { ...arquivo }
  ));

  if (arquivosParaPayload.length) {
    payload.arquivos = arquivosParaPayload;
  }

  return payload;
}


  /**
   * Resetar todos os dados
   */
  resetarDados(): void {
    this.cedenteData = this.obterEstruturaPadrao();
    this.fundId = null;
    this.cedenteId = null;
    this.notificarMudancas();
    this.limparStorage();
  }

  /**
   * Limpar dados do localStorage
   */
  private limparStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (err) {
      console.error('Erro ao limpar localStorage:', err);
    }
  }
}
