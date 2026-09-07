import { Component, OnInit, Output, EventEmitter, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CedenteDataService } from './cedente-data.service';
import { DocumentacaoCedenteComponent } from '../documentacao-cedente/documentacao-cedente.component';
import { PartesRelacionadasComponent } from '../partes-relacionadas/partes-relacionadas.component';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import {
  CepValidator,
  CpfCnpjValidator,
  EmailValidator,
  PhoneValidator,
  BankAccountNumberValidator,
  BankAccountDigitValidator
} from '../../shared/custom-validators';

import * as countries from 'i18n-iso-countries';
import ptBR from 'i18n-iso-countries/langs/pt.json';

countries.registerLocale(ptBR);

@Component({
  selector: 'cb-novo-cedente',
  templateUrl: './novo-cedente.component.html',
  styleUrls: ['./novo-cedente.component.css']
})
export class NovoCedenteComponent implements OnInit {

  private readonly scrollOffset = 24;

  mostrarCadastro: boolean = true;
  stepAtual: number = 1;
  totalSteps: number = 4;
  stepsStatus: { [key: number]: 'pending' | 'active' | 'completed' } = {
    1: 'active',
    2: 'pending',
    3: 'pending',
    4: 'pending'
  };
  
  // formularios
  formDadosCadastrais!: FormGroup;
  formInfoGeral!: FormGroup;

  documentoMask: string = 'cpfcnpj';
  telefoneMask: string = '(99) 99999-9999';
  cepMask: string = '99999-999';
  contaNumeroMask: string = '99999999999999999999';
  contaDigitoMask: string = '99';

  // Arrays de formulários dinâmicos
  partesRelacionadasForms: any[] = [];
  avalistaForms: any[] = [];
  contasDesembolsoForms: any[] = [];
  arquivos: any[] = [];
  salvandoCadastro: boolean = false;
  mensagemAlertaCadastro: string = '';

  mostrarModalXml: boolean = false;
  arquivoXmlSelecionado: File | null = null;
  erroArquivoXml: string | null = null;

  // Dados preenchidos
  partesRelacionadas: any[] = [];
  avalistas: any[] = [];
  contasDesembolso: any[] = [];

  private nextParteRelacionadaIndex = 0;
  private nextAvalistaIndex = 0;
  private nextContaDesembolsoIndex = 0;
  private readonly documentosObrigatoriosIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

  estados: any[] = [];
  paises: any[] = [];

  @Output() onSubmit = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onFinalizarCadastro = new EventEmitter<void>();

  @ViewChild(DocumentacaoCedenteComponent, { static: false })
  documentacaoCedenteComponent?: DocumentacaoCedenteComponent;

  @ViewChildren(PartesRelacionadasComponent)
  partesRelacionadasComponentes?: QueryList<PartesRelacionadasComponent>;

  @ViewChild('dadosCadastraisSection', { static: false })
  dadosCadastraisSection?: ElementRef<HTMLElement>;

  @ViewChild('partesRelacionadasSection', { static: false })
  partesRelacionadasSection?: ElementRef<HTMLElement>;

  @ViewChild('contasDesembolsoSection', { static: false })
  contasDesembolsoSection?: ElementRef<HTMLElement>;

  @ViewChild('avalistasSection', { static: false })
  avalistasSection?: ElementRef<HTMLElement>;

  constructor( 
    private fb: FormBuilder, 
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private cedenteDataService: CedenteDataService,
    private  route: ActivatedRoute
  ) { }


  private fundoId: string | null = null;
  
  ngOnInit() {
    this.fundoId = this.route.snapshot.paramMap.get('id');
    this.cedenteDataService.setFundId(this.fundoId);
    this.formDadosCadastrais = this.fb.group({
      nome: ['', [Validators.required]],
      documento: ['', [Validators.required, CpfCnpjValidator]],
      email: ['', [Validators.required, EmailValidator]],
      faturamento_anual: ['', [Validators.required]],
      minimo_assinantes: [''],
      cep: ['', [Validators.required, CepValidator]],
      logradouro: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      complemento: [''],
      bairro: ['', [Validators.required]],
      sistema_financeiro_nacional: [false],
    });

    const cepControl = this.formDadosCadastrais.get('cep');
    if (cepControl) {
      cepControl.valueChanges.subscribe((valor: string) => {
        const cep = String(valor).replace(/\D/g, '');
        if (cep.length === 8) {
          this.buscarCep();
        }
      });
    }

    // formulario Container Infogeral
    this.formInfoGeral = this.fb.group({
      estado: ['', [Validators.required]],
      telefone: ['', [Validators.required, PhoneValidator]],
      cidade: ['', [Validators.required]],
      pais: ['Brasil', [Validators.required]]
    });

    // Sincronizar alterações dos formulários com o serviço central
    this.formDadosCadastrais.valueChanges.subscribe(val => {
      const dadosGerais: any = {
        nome: val.nome,
        documento: val.documento,
        email: val.email,
        sistema_financeiro_nacional: val.sistema_financeiro_nacional
      };

      if (val.faturamento_anual !== '' && val.faturamento_anual !== null) {
        dadosGerais.faturamento_anual = parseFloat(val.faturamento_anual);
      }
      if (val.minimo_assinantes !== '' && val.minimo_assinantes !== null) {
        dadosGerais.minimo_assinantes = parseInt(val.minimo_assinantes, 10);
      }

      this.cedenteDataService.atualizarDadosGerais(dadosGerais);

      const endereco: any = {
        cep: val.cep,
        logradouro: val.logradouro,
        rua: val.logradouro,
        numero: val.numero,
        complemento: val.complemento,
        bairro: val.bairro
      };
      this.cedenteDataService.atualizarEndereco(endereco);
    });

    this.formInfoGeral.valueChanges.subscribe(val => {
      this.cedenteDataService.atualizarDadosGerais({ telefone: val.telefone });
      this.cedenteDataService.atualizarEndereco({ estado: val.estado, cidade: val.cidade, pais: val.pais });
    });

    // Restaurar valores salvos do serviço/Storage
    const dadosSalvos = this.cedenteDataService.obterDados();
    this.formDadosCadastrais.patchValue({
      nome: dadosSalvos.nome,
      documento: dadosSalvos.documento,
      email: dadosSalvos.email,
      faturamento_anual: dadosSalvos.faturamento_anual || '',
      minimo_assinantes: dadosSalvos.minimo_assinantes || '',
      cep: dadosSalvos.endereco.cep,
      logradouro: dadosSalvos.endereco.logradouro || (dadosSalvos.endereco as any).rua,
      numero: dadosSalvos.endereco.numero,
      complemento: dadosSalvos.endereco.complemento,
      bairro: dadosSalvos.endereco.bairro,
      sistema_financeiro_nacional: dadosSalvos.sistema_financeiro_nacional
    });

    this.formInfoGeral.patchValue({
      estado: dadosSalvos.endereco.estado,
      telefone: dadosSalvos.telefone,
      cidade: dadosSalvos.endereco.cidade,
      pais: dadosSalvos.endereco.pais || 'Brasil'
    });

    this.sincronizarDadosDinamicos(dadosSalvos);

    // API IBGE
    this.http.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
    .subscribe((res: any) => {
      this.estados = res.sort((a: any, b: any) => a.nome.localeCompare(b.nome));
    });

  const nomesPaises = countries.getNames('pt') as { [key: string]: string };
  this.paises = [];
  for (const sigla in nomesPaises) {
    if (nomesPaises.hasOwnProperty(sigla)) {
      this.paises.push({
        sigla,
        nome: nomesPaises[sigla]
      });
    }
  }
  this.paises.sort((a, b) => a.nome.localeCompare(b.nome));
  
  }

  private sincronizarDadosDinamicos(dados: any) {
    this.partesRelacionadas = [...(dados.partes_relacionadas || [])];
    this.avalistas = [...(dados.avalistas || [])];
    this.contasDesembolso = [...(dados.contas_desembolso || [])];

    this.partesRelacionadasForms = this.sincronizarForms(this.partesRelacionadasForms, this.partesRelacionadas);
    this.avalistaForms = this.sincronizarForms(this.avalistaForms, this.avalistas);
    this.contasDesembolsoForms = this.sincronizarForms(this.contasDesembolsoForms, this.contasDesembolso);

    this.nextParteRelacionadaIndex = this.obterMaiorId(this.partesRelacionadasForms);
    this.nextAvalistaIndex = this.obterMaiorId(this.avalistaForms);
    this.nextContaDesembolsoIndex = this.obterMaiorId(this.contasDesembolsoForms);
  }

  private sincronizarForms(forms: any[], items: any[]): any[] {
    const formsSalvos = items.map((item, index) => {
      const formExistente = forms[index];

      return {
        id: formExistente && formExistente.id ? formExistente.id : index + 1,
        saved: true,
        data: item
      };
    });

    const formsNaoSalvos = forms.slice(items.length).filter((form: any) => !form.saved && !form.data);
    return [...formsSalvos, ...formsNaoSalvos];
  }

  private obterMaiorId(forms: any[]): number {
    return forms.reduce((maior: number, form: any) => {
      const id = form && form.id ? Number(form.id) : 0;
      return id > maior ? id : maior;
    }, 0);
  }

  trackById(index: number, item: any) {
    return item.id;
  }

  isControlInvalid(form: FormGroup, controlName: string): boolean {
    const control = form.controls[controlName];
    if (!control) {
      return false;
    }

    return control.invalid && (control.dirty || control.touched);
  }

  getControlErrorMessage(form: FormGroup, controlName: string): string {
    const control = form.controls[controlName];
    if (!control || !control.errors) {
      return '';
    }

    if (control.errors.required) {
      return 'Campo obrigatório.';
    }
    if (control.errors.validCpfCnpj) {
      return 'CPF/CNPJ inválido.';
    }
    if (control.errors.validEmail) {
      return 'E-mail inválido.';
    }
    if (control.errors.validCep) {
      return 'CEP inválido.';
    }
    if (control.errors.validPhone) {
      return 'Telefone inválido.';
    }
    if (control.errors.validBankAccount) {
      return 'Número da conta inválido.';
    }
    if (control.errors.validBankAccountDigit) {
      return 'Dígito da conta inválido.';
    }

    return 'Valor inválido.';
  }

  proximoStep() {
    if (this.stepAtual === 1) {
      this.marcarPartesRelacionadasComoTouched();

      if (this.formDadosCadastrais.invalid || this.formInfoGeral.invalid || this.existemPartesRelacionadasInvalidas()) {
        this.formDadosCadastrais.markAllAsTouched();
        this.formInfoGeral.markAllAsTouched();
        return;
      }
    }

    /*
    if (this.stepAtual === 2) {
      const componentDocumentacao = this.documentacaoCedenteComponent;

      if (componentDocumentacao && !componentDocumentacao.validarDocumentosObrigatorios()) {
        return;
      }
    }
    */

    if (this.stepAtual < this.totalSteps) {
      // Marcar o step atual como completado
      this.stepsStatus[this.stepAtual] = 'completed';
      // Avançar para o próximo step
      this.stepAtual++;
      // Ativar o novo step
      this.stepsStatus[this.stepAtual] = 'active';
    } else if (this.stepAtual === this.totalSteps) {
      this.finalizarCadastro();
    }
  }

  voltarStep() {
    if (this.stepAtual > 1) {
      // Remover o estado completado do step anterior
      this.stepsStatus[this.stepAtual] = 'pending';
      // Voltar para o step anterior
      this.stepAtual--;
      // Reativar o step anterior
      this.stepsStatus[this.stepAtual] = 'active';

      if (this.stepAtual === 1) {
        this.sincronizarDadosDinamicos(this.cedenteDataService.obterDados());
      }
    }
  }

  irParaEtapa(destino: number | { etapa: number; secao?: string }) {
    const step = typeof destino === 'number' ? destino : destino.etapa;
    const secao = typeof destino === 'number' ? undefined : destino.secao;

    if (step < 1 || step > this.totalSteps) {
      return;
    }

    this.stepAtual = step;

    if (step === 1) {
      this.sincronizarDadosDinamicos(this.cedenteDataService.obterDados());
    }

    for (let indice = 1; indice <= this.totalSteps; indice++) {
      if (indice < step) {
        this.stepsStatus[indice] = 'completed';
        continue;
      }

      this.stepsStatus[indice] = indice === step ? 'active' : 'pending';
    }

    if (secao) {
      setTimeout(() => this.scrollParaSecao(secao), 0);
    }
  }

  private scrollParaSecao(secao: string) {
    const secoes: { [key: string]: ElementRef<HTMLElement> | undefined } = {
      'dados-cadastrais': this.dadosCadastraisSection,
      'partes-relacionadas': this.partesRelacionadasSection,
      'contas-desembolso': this.contasDesembolsoSection,
      'avalistas': this.avalistasSection
    };

    const alvo = secoes[secao];
    if (!alvo || !alvo.nativeElement) {
      return;
    }

    const rect = alvo.nativeElement.getBoundingClientRect();
    const top = window.pageYOffset + rect.top - this.scrollOffset;

    window.scrollTo({ top, behavior: 'smooth' });
  }

  cancelarCadastro() {
    if (this.salvandoCadastro) {
      return;
    }

    if (this.hasDadosParaSalvar() && !this.isCadastroCompletoParaPendente()) {
      this.salvarCadastro(true);
      return;
    }

    this.onCancel.emit();
  }

  abrirModalXml() {
    this.arquivoXmlSelecionado = null;
    this.erroArquivoXml = null;
    this.mostrarModalXml = true;
  }

  fecharModalXml() {
    this.mostrarModalXml = false;
    this.arquivoXmlSelecionado = null;
    this.erroArquivoXml = null;
  }

  onArquivoXmlSelecionado(event: Event) {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files && input.files[0];

    if (!arquivo) {
      return;
    }

    const nomeArquivo = arquivo.name || '';
    const isXml = arquivo.type === 'text/xml'
      || arquivo.type === 'application/xml'
      || nomeArquivo.toLowerCase().endsWith('.xml');

    if (!isXml) {
      this.arquivoXmlSelecionado = null;
      this.erroArquivoXml = 'Apenas arquivos com extensão .xml são aceitos.';
      input.value = '';
      return;
    }

    this.arquivoXmlSelecionado = arquivo;
    this.erroArquivoXml = null;
  }

  confirmarCadastroViaXml() {
    if (!this.arquivoXmlSelecionado) {
      return;
    }

    // TODO: enviar o arquivo XML selecionado para o endpoint de cadastro assim que disponível.
    this.snackBar.open('Arquivo XML recebido com sucesso.', 'Fechar', { duration: 3000 });
    this.fecharModalXml();
  }

  // aqui busco o CEP
  buscarCep() {
  const cepControl = this.formDadosCadastrais.get('cep');

  if (!cepControl) {
    return;
  }

  const cep = cepControl.value.replace(/\D/g, '');

  if (cep.length !== 8) {
    return;
  }

  this.http
    .get<any>(`https://viacep.com.br/ws/${cep}/json/`)
    .subscribe({
      next: (dados) => {

        this.formDadosCadastrais.patchValue({
          logradouro: dados.logradouro,
          bairro: dados.bairro
        });

        this.formInfoGeral.patchValue({
          cidade: dados.localidade,
          estado: dados.uf
        });

      },
      error: (erro) => {
        console.log('Erro ao buscar CEP', erro);
      }
    });
  }

  abrirPartesRelacionadas(){
    this.partesRelacionadasForms.push({ id: ++this.nextParteRelacionadaIndex, saved: false });
  }

  abrirDesembolso(){
    this.contasDesembolsoForms.push({ id: ++this.nextContaDesembolsoIndex, saved: false });
  }

  abrirAvalista(){
    this.avalistaForms.push({ id: ++this.nextAvalistaIndex, saved: false });
  }

  adicionarParteRelacionada(parte: any, index: number) {
    const cedenteId = this.cedenteDataService.getCedenteId();
    const parteComId = cedenteId ? { ...parte, cedente_id: cedenteId } : { ...parte };
    this.partesRelacionadas[index] = parte;
    this.partesRelacionadasForms[index] = { ...this.partesRelacionadasForms[index], saved: true, data: parte };
    this.cedenteDataService.adicionarParteRelacionada(parteComId);
  }

  adicionarAvalista(avalista: any, index: number) {
    const cedenteId = this.cedenteDataService.getCedenteId();
    const avalistaComId = cedenteId ? { ...avalista, cedente_id: cedenteId } : { ...avalista };
    this.avalistas[index] = avalista;
    this.avalistaForms[index] = { ...this.avalistaForms[index], saved: true, data: avalista };
    this.cedenteDataService.adicionarAvalista(avalistaComId);
  }

  adicionarContaDesembolso(conta: any, index: number) {
    const cedenteId = this.cedenteDataService.getCedenteId();
    const contaComId = cedenteId ? { ...conta, cedente_id: cedenteId } : { ...conta };
    this.contasDesembolso[index] = conta;
    this.contasDesembolsoForms[index] = { ...this.contasDesembolsoForms[index], saved: true, data: conta };
    this.cedenteDataService.adicionarContaDesembolso(contaComId);
  }

  salvarCadastro(fecharAposSalvar: boolean = false) {
    if (this.salvandoCadastro || !this.hasDadosParaSalvar()) {
      if (fecharAposSalvar) {
        this.onCancel.emit();
      }
      return;
    }

    const status = this.isCadastroCompletoParaPendente() ? 'pendente' : 'rascunho';
    this.mensagemAlertaCadastro = '';
    this.salvandoCadastro = true;
    this.dispatchLoading(true);

    const payload = this.cedenteDataService.consolidarPayloadFinal(status);
    const cedenteId = this.cedenteDataService.getCedenteId();
    const request$ = cedenteId
      ? this.http.put(`${environment.api}/cedente/edit`, payload)
      : this.http.post(`${environment.api}/cedente/save`, payload);

    request$.subscribe({
      next: (res: any) => {
        const resolvedCedenteId =
          (res && res.id) ||
          (res && res.data && res.data.id) ||
          (res && res.cedente && res.cedente.id) ||
          (res && res.cedente_id) ||
          payload.id;

        if (resolvedCedenteId != null) {
          this.cedenteDataService.setCedenteId(String(resolvedCedenteId));
        }

        const response = {
          ...res,
          status
        };

        this.resetarFormulario();
        this.onSubmit.emit(response);

        if (fecharAposSalvar) {
          this.onCancel.emit();
        }
      },
      error: (err: any) => {
        console.error('Erro ao salvar cadastro de cedente:', err);

        if (err && err.status === 413) {
          this.exibirAlertaCadastro('Não foi possível salvar o cadastro porque o tamanho dos anexos excede o limite permitido.\n\nLimite máximo por arquivo: 700 KB.');
          return;
        }

        this.exibirAlertaCadastro('Erro ao salvar cadastro de cedente. Tente novamente.');
      },
      complete: () => {
        this.salvandoCadastro = false;
        this.dispatchLoading(false);
      }
    });
  }

  isCadastroCompletoParaPendente(): boolean {
    return this.formDadosCadastrais.valid && this.formInfoGeral.valid && this.possuiDocumentosObrigatoriosSalvos();
  }

  /*
   * Regra dinâmica de obrigatoriedade para partes relacionadas e avalistas
   * temporariamente desabilitada para manter somente os documentos do cedente.
   */

  private possuiDocumentosObrigatoriosSalvos(): boolean {
    const dados = this.cedenteDataService.obterDados();
    const documentosSalvos = new Set(
      (dados.arquivos || [])
        .map((arquivo: any) => Number(arquivo.document_type))
        .filter((documentType: number) => !Number.isNaN(documentType))
    );

    return this.documentosObrigatoriosIds.every((id: number) => documentosSalvos.has(id));
  }

  private hasDadosParaSalvar(): boolean {
    const dados = this.cedenteDataService.obterDados();
    const endereco: any = dados.endereco || {};

    return !!(
      dados.nome ||
      dados.documento ||
      dados.email ||
      dados.telefone ||
      endereco.cep ||
      endereco.logradouro ||
      endereco.rua ||
      endereco.numero ||
      endereco.bairro ||
      (dados.partes_relacionadas && dados.partes_relacionadas.length) ||
      (dados.avalistas && dados.avalistas.length) ||
      (dados.contas_desembolso && dados.contas_desembolso.length) ||
      (dados.arquivos && dados.arquivos.length)
    );
  }

  duplicarAvalista(data: any) {
    
    if (!data) {
      console.warn('Nenhum avalista disponível para duplicar');
      return;
    }

    const novoAvalista = JSON.parse(JSON.stringify(data));
    this.avalistas.push(novoAvalista);
    this.avalistaForms.push({ id: ++this.nextAvalistaIndex, saved: true, data: novoAvalista });
    this.cedenteDataService.adicionarAvalista(novoAvalista);
  }

  removerParteRelacionada(index: number) {
    const form = this.partesRelacionadasForms[index];
    if (form && form.saved && form.data) {
      this.partesRelacionadas = this.partesRelacionadas.filter(item => item !== form.data);
    }
    this.partesRelacionadasForms.splice(index, 1);
    this.cedenteDataService.removerParteRelacionada(index);
  }

  removerAvalista(index: number) {
    const form = this.avalistaForms[index];
    if (form && form.saved && form.data) {
      this.avalistas = this.avalistas.filter(item => item !== form.data);
    }
    this.avalistaForms.splice(index, 1);
    this.cedenteDataService.removerAvalista(index);
  }

  removerContaDesembolso(index: number) {
    const form = this.contasDesembolsoForms[index];
    if (form && form.saved && form.data) {
      this.contasDesembolso = this.contasDesembolso.filter(item => item !== form.data);
    }
    this.contasDesembolsoForms.splice(index, 1);
    this.cedenteDataService.removerContaDesembolso(index);
  }

  private dispatchLoading(isLoading: boolean) {
    const root = document.querySelector('cb-cadastro-cedentes');
    if (root && (root as any).componentInstance) {
      (root as any).componentInstance.isLoading = isLoading;
    }
  }

  private exibirAlertaCadastro(mensagem: string): void {
    this.mensagemAlertaCadastro = mensagem;
    this.snackBar.open(mensagem, '', {
      duration: 2500
    });
  }

  private marcarPartesRelacionadasComoTouched(): void {
    if (!this.partesRelacionadasComponentes) {
      return;
    }

    this.partesRelacionadasComponentes.forEach((componente: PartesRelacionadasComponent) => {
      componente.markAllAsTouched();
    });
  }

  private existemPartesRelacionadasInvalidas(): boolean {
    if (!this.partesRelacionadasComponentes || !this.partesRelacionadasComponentes.length) {
      return false;
    }

    return this.partesRelacionadasComponentes.some((componente: PartesRelacionadasComponent) => !componente.isValido());
  }

  finalizarCadastro() {
    if (this.formDadosCadastrais.invalid || this.formInfoGeral.invalid) {
      this.formDadosCadastrais.markAllAsTouched();
      this.formInfoGeral.markAllAsTouched();
      return;
    }

    const dadosCadastrais = this.formDadosCadastrais.value;
    const infoGeral = this.formInfoGeral.value;

    const payload: any = {
      id: this.fundoId,
      nome: dadosCadastrais.nome,
      documento: dadosCadastrais.documento,
      email: dadosCadastrais.email,
      sistema_financeiro_nacional: dadosCadastrais.sistema_financeiro_nacional,
      telefone: infoGeral.telefone,
      endereco: {
        cep: dadosCadastrais.cep,
        logradouro: dadosCadastrais.logradouro,
        rua: dadosCadastrais.logradouro,
        numero: dadosCadastrais.numero,
        complemento: dadosCadastrais.complemento,
        bairro: dadosCadastrais.bairro,
        estado: infoGeral.estado,
        cidade: infoGeral.cidade,
        pais: infoGeral.pais
      }
    };

    if (dadosCadastrais.faturamento_anual !== '' && dadosCadastrais.faturamento_anual !== null) {
      payload.faturamento_anual = parseFloat(dadosCadastrais.faturamento_anual);
    }

    if (dadosCadastrais.minimo_assinantes !== '' && dadosCadastrais.minimo_assinantes !== null) {
      payload.minimo_assinantes = parseInt(dadosCadastrais.minimo_assinantes, 10);
    }

    if (this.partesRelacionadas.length > 0) {
      payload.partes_relacionadas = this.partesRelacionadas;
    }

    if (this.avalistas.length > 0) {
      payload.avalistas = this.avalistas;
    }

    if (this.contasDesembolso.length > 0) {
      payload.contas_desembolso = this.contasDesembolso;
    }

    if (this.arquivos.length > 0) {
      payload.arquivos = this.arquivos;
    }

    console.log('Payload final do cedente:', payload);

    this.http.post(`${environment.api}/cedente/save`, payload).subscribe({
      next: (res: any) => {
        console.log('Cadastro de cedente realizado com sucesso:', res);
        this.resetarFormulario();
        this.onSubmit.emit(res);
      },
      error: (err: any) => {
        console.error('Erro ao enviar cadastro de cedente:', err);
      }
    });
  }

  finalizarFluxoCadastro() {
    this.resetarFormulario();
    this.onFinalizarCadastro.emit();
  }

  private resetarFormulario() {
    this.formDadosCadastrais.reset({ sistema_financeiro_nacional: false });
    this.formInfoGeral.reset({ pais: 'Brasil' });
    this.partesRelacionadasForms = [];
    this.avalistaForms = [];
    this.contasDesembolsoForms = [];
    this.arquivos = [];
    this.stepAtual = 1;
    this.stepsStatus = {
      1: 'active',
      2: 'pending',
      3: 'pending',
      4: 'pending'
    };
    this.salvandoCadastro = false;
    this.cedenteDataService.resetarDados();
    this.cedenteDataService.setFundId(this.fundoId);
  }
}
